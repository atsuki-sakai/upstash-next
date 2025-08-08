import { Index } from "@upstash/vector";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PostBodySchema, PostWithTextSchema } from "@/app/lib/schemas/vector";

// 型定義: ベクトルに付与するメタデータ
export type Metadata = { category: string; year: number; sex: "male" | "female" | "gender" };

// リクエストIDを生成（ログ相関用）
function getRequestId(): string {
  return globalThis?.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

// Vectorクライアントを安全に初期化
// - 実行時にのみ環境変数の不足で失敗させる
function getVectorIndex(): Index<Metadata> {
  // 1) 環境変数の読取
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  // 2) 必須環境変数の存在確認
  if (!url || !token) {
    throw new Error("UPSTASH Vector credentials are not configured");
  }

  // 3) クライアント生成
  return new Index<Metadata>({ url, token });
}

// クエリ文字列（空白/カンマ区切り）を数値配列に変換
function parseVectorParamToNumbers(param: string): number[] {
  return param
    .split(/[\s,]+/)
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
}

// topKを安全に数値化（範囲 1..100、未指定は10）
function computeTopK(raw: string | null): number {
  const n = Number(raw ?? 10);
  const fallback = 10;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(100, n || fallback));
}

export async function POST(request: Request) {
  // リクエストIDを生成（ログ相関用）
  const requestId = getRequestId();
  // 1) リクエストJSONのパースと検証
  let parsed: z.infer<typeof PostBodySchema>;
  try {
    const body = await request.json();
    console.log("[/api/vector][POST] received body", { requestId, hasBody: !!body });
    parsed = PostBodySchema.parse(body);
  } catch (error) {
    // バリデーションエラーを整形
    if (error instanceof z.ZodError) {
      console.error("[/api/vector][POST] zod error", { requestId, issues: error.issues });
      return NextResponse.json(
        { message: "invalid request", issues: error.issues, requestId },
        { status: 400 }
      );
    }
    console.error("[/api/vector][POST] invalid JSON", { requestId, error: (error as Error).message });
    return NextResponse.json({ message: "invalid JSON", requestId }, { status: 400 });
  }

  // 2) Vectorクライアントの取得（環境変数チェック含む）
  let index: Index<Metadata>;
  try {
    index = getVectorIndex();
  } catch (error) {
    console.error("[/api/vector][POST] vector client init failed", { requestId, error: (error as Error).message });
    return NextResponse.json(
      { message: (error as Error).message, requestId },
      { status: 500 }
    );
  }

  // 3) データのUpsert（text→data保存 / vector→vector保存）
  try {
    // ログ用に何を保存するか表記
    const mode = "vector" in parsed && parsed.vector ? "vector" : "text";
    console.log("[/api/vector][POST] upsert start", { requestId, id: parsed.id, mode, metadata: parsed.metadata });

    if ("vector" in parsed && parsed.vector) {
      // ベクター保存（embedder不要）
      await index.upsert<Metadata>({
        id: parsed.id,
        vector: parsed.vector,
        metadata: parsed.metadata,
      });
    } else {
      // テキスト保存（embedderがIndexに設定されている必要あり）
      await index.upsert<Metadata>({
        id: parsed.id,
        data: (parsed as z.infer<typeof PostWithTextSchema>).text,
        metadata: parsed.metadata,
      });
    }
    console.log("[/api/vector][POST] upsert success", { requestId, id: parsed.id });
  } catch (error) {
    const message = (error as Error).message;
    console.error("[/api/vector][POST] upsert failed", { requestId, id: parsed.id, error: message });
    // Upstash側でembedder未設定時の代表的なエラーメッセージに対応
    if (message.includes("Embedding data for this index is not allowed")) {
      return NextResponse.json(
        {
          code: "EMBEDDER_NOT_CONFIGURED",
          message: "Indexに埋め込みモデルが設定されていないため、textをdataとして保存できません。IndexのEmbedderを設定してください。",
          hint: "Upstash Console → Vector → 対象Index → SettingsでEmbedding modelを設定",
          requestId,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "failed to upsert", error: message, requestId },
      { status: 500 }
    );
  }

  // 4) 成功レスポンス
  return NextResponse.json({ message: "success", id: parsed.id, requestId }, { status: 200 });
}


export async function GET(request: Request) {
  // 1) クエリパラメータの取得
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text"); // テキスト検索用
  const vectorParam = searchParams.get("query"); // ベクター検索用（空白/カンマ区切り数列）
  const topKParam = searchParams.get("topK");
  // threshold: 0..1 の数値として扱う（無効値は 0.7 にフォールバック）
  const thresholdRaw = Number(searchParams.get("threshold"))
  const thresholdParam = Number.isFinite(thresholdRaw) ? Math.max(0, Math.min(1, thresholdRaw)) : 0.7
  const requestId = getRequestId();
  console.log("[/api/vector][GET] start", { requestId, text: !!text, hasVector: !!vectorParam, topKParam });

  // 2) topKの解釈（未指定なら10）
  const topK = computeTopK(topKParam);

  // 3) Vectorクライアントの取得（環境変数チェック含む）
  let index: Index<Metadata>;
  try {
    index = getVectorIndex();
  } catch (error) {
    console.error("[/api/vector][GET] vector client init failed", { requestId, error: (error as Error).message });
    return NextResponse.json(
      { message: (error as Error).message, requestId },
      { status: 500 }
    );
  }

  // 4) 検索の分岐処理
  try {
    // 4-1) テキストクエリが与えられた場合（埋め込みはインデックス側の設定を利用）
    if (text && text.trim().length > 0) {
      console.log("[/api/vector][GET] text query", { requestId, topK });
      const result = await index.query<Metadata>({
        data: text,
        topK,
        includeVectors: false,
        includeMetadata: true,
        includeData: true,
      });
      type QueryRes = { matches?: unknown[] }
      const r = result as QueryRes
      console.log("[/api/vector][GET] text query success", { requestId, matchCount: r?.matches?.length ?? 0 });
      const filteredResults = result.filter(item => (item?.score ?? 0) >= thresholdParam)
      return NextResponse.json({ matches: filteredResults, requestId }, { status: 200 });
    }

    // 4-2) 数値ベクターでの検索（スペース/カンマ区切り）
    if (vectorParam && vectorParam.trim().length > 0) {
      // クエリを数値配列へ変換
      const numbers = parseVectorParamToNumbers(vectorParam);

      if (numbers.length === 0) {
        console.error("[/api/vector][GET] invalid vector format", { requestId, vectorParam });
        return NextResponse.json({ message: "invalid vector", requestId }, { status: 400 });
      }

      console.log("[/api/vector][GET] vector query", { requestId, topK, dim: numbers.length });
      const result = await index.query<Metadata>({
        vector: numbers,
        topK,
        includeVectors: false,
        includeMetadata: true,
      });
      type QueryRes = { matches?: unknown[] }
      const r = result as QueryRes
      console.log("[/api/vector][GET] vector query success", { requestId, matchCount: r?.matches?.length ?? 0 });
      const filteredResults = result.filter(item => (item?.score ?? 0) >= thresholdParam)
      return NextResponse.json({ matches: filteredResults, requestId }, { status: 200 });
    }

    // 4-3) パラメータ不足
    console.error("[/api/vector][GET] missing query params", { requestId });
    return NextResponse.json(
      { message: "either 'text' or 'query' parameter is required", requestId },
      { status: 400 }
    );
  } catch (error) {
    const message = (error as Error).message;
    console.error("[/api/vector][GET] query failed", { requestId, error: message });
    if (message.includes("Embedding data for this index is not allowed")) {
      return NextResponse.json(
        {
          code: "EMBEDDER_NOT_CONFIGURED",
          message: "Indexに埋め込みモデルが設定されていないため、textでの検索ができません。IndexのEmbedderを設定してください。",
          hint: "Upstash Console → Vector → 対象Index → SettingsでEmbedding modelを設定",
          requestId,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "failed to query", error: message, requestId },
      { status: 500 }
    );
  }
}