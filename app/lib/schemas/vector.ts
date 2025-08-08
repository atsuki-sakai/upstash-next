import { z } from "zod";

// Zodスキーマ: 入力値の厳格な検証
export const MetadataSchema = z.object({
    // カテゴリ: 空文字禁止
    category: z.string().min(1, "category is required"),
    // 年: 1900〜2025の整数のみ
    year: z
      .number()
      .int()
      .gte(1900)
      .lte(2025),
    // 性別: 固定の列挙値
    sex: z.enum(["male", "female", "gender"]),
  });
  
  // POSTの受け取りは text または vector のどちらかを許容
  export const PostBaseSchema = z.object({
    // ID: 空文字禁止
    id: z.string().min(1, "id is required"),
    // メタデータ
    metadata: MetadataSchema,
  });
  
  export const PostWithTextSchema = PostBaseSchema.extend({
    // テキスト: 空文字禁止
    text: z.string().min(1, "text is required"),
    // vectorは未指定
    vector: z.undefined().optional(),
  });
  
  export const PostWithVectorSchema = PostBaseSchema.extend({
    // 数値ベクター: 1要素以上
    vector: z.array(z.number()).min(1, "vector must have at least 1 element"),
    // textは任意
    text: z.string().optional(),
  });
  
  export const PostBodySchema = z.union([PostWithTextSchema, PostWithVectorSchema]);
  