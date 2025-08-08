"use client"

import type { Metadata } from "@/app/api/vector/route"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export default function VectorPage() {
    // 入力テキスト
    const [text, setText] = useState("")
    // メタデータ
    const [metadata, setMetadata] = useState<Metadata>({
        category: "趣味",
        year: 2024,
        sex: "gender",
    })
    // 検索テキスト
    const [queryText, setQueryText] = useState("")
    // ベクター保存用（embedder未設定でも保存可能にする）
    const [saveVector, setSaveVector] = useState("")
    // topK と スコア閾値（Sliderで調整）
    const [topK, setTopK] = useState<number>(10)
    const [threshold, setThreshold] = useState<number>(0.7)
    // 検索結果
    type QueryResultMatch = {
        id: string | number
        score?: number
        metadata?: Metadata
    }
    type QueryResult = { requestId?: string; matches?: QueryResultMatch[] } | null
    const [results, setResults] = useState<QueryResult>(null)
    // ローディング/エラー状態
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // エラーレスポンス型ガード
    type ErrorResponse = { message?: string; requestId?: string; error?: string }
    const isErrorResponse = (v: unknown): v is ErrorResponse => typeof v === "object" && v !== null && "message" in v

    // 保存処理: ベクトルへのUpsert
    // - vectorが入力されていればvector保存、なければtext保存
    const handleSubmit = async () => {
        setError(null)
        try {
            // 1) 入力からpayloadを作成
            const payload = saveVector.trim().length > 0
                ? {
                    id: crypto.randomUUID(),
                    // 空白/カンマ区切りの数列を数値配列化
                    vector: saveVector
                        .split(/[\s,]+/)
                        .map((v) => Number(v))
                        .filter((v) => Number.isFinite(v)),
                    metadata,
                }
                : {
                    id: crypto.randomUUID(),
                    text,
                    metadata,
                }

            // 2) APIへ送信
            const response = await fetch("/api/vector", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) {
                const raw: unknown = await response.json().catch(() => ({}))
                const message = isErrorResponse(raw) && raw.message ? raw.message : "Failed to upsert"
                console.error("[VectorPage][POST] failed", { raw })
                throw new Error(message)
            }
            alert("Success")
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error"
            console.error("[VectorPage][POST] error", e)
            setError(msg)
        }
    }

    // 検索処理: テキストクエリ（data検索）
    const handleSearchByText = async () => {
        setError(null)
        setLoading(true)
        setResults(null)
        try {
            // 1) API呼び出し（textクエリ）
            // - topK と threshold をクエリに付与
            const res = await fetch(`/api/vector?text=${encodeURIComponent(queryText)}&topK=${topK}&threshold=${threshold}`)
            const raw: unknown = await res.json()
            if (!res.ok) {
                const message = isErrorResponse(raw) && raw.message ? raw.message : "Search failed"
                throw new Error(message)
            }
            setResults((raw as QueryResult) ?? null)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error"
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    // 検索処理: 生ベクター（数列）
    const handleSearchByVector = async () => {
        setError(null)
        setLoading(true)
        setResults(null)
        try {
            // 1) API呼び出し（vectorクエリ）
            // - topK と threshold をクエリに付与
            const res = await fetch(`/api/vector?query=${encodeURIComponent(queryText)}&topK=${topK}&threshold=${threshold}`)
            const raw: unknown = await res.json()
            if (!res.ok) {
                const message = isErrorResponse(raw) && raw.message ? raw.message : "Search failed"
                throw new Error(message)
            }
            setResults((raw as QueryResult) ?? null)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error"
            setError(msg)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        // 入力確認のためのログ
        console.log("[VectorPage] metadata changed", metadata)
    }, [metadata])

    return (
        <div className="container mx-auto max-w-4xl space-y-8 p-6">
            <div>
                <h1 className="text-2xl font-bold">VectorDB</h1>
                <p className="text-sm text-gray-500">VectorDBへの保存と検索のデモ</p>
            </div>

            {/* 保存フォーム */}
            <Card>
                <CardHeader>
                    <CardTitle>保存</CardTitle>
                    <CardDescription>テキストまたは数列ベクターを保存し、任意のメタデータを付与します</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="text">テキスト</Label>
                        <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="保存するテキスト" />
                    </div>
                    <div className="grid gap-2 hidden">
                        <Label htmlFor="vector">ベクター（任意。スペース/カンマ区切り数列）</Label>
                        <Input id="vector" value={saveVector} onChange={(e) => setSaveVector(e.target.value)} placeholder="例: 0.1 0.2 0.3" />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="category">カテゴリ</Label>
                            <Input id="category" value={metadata.category} onChange={(e) => setMetadata({ ...metadata, category: e.target.value })} placeholder="カテゴリ" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="year">年</Label>
                            <Input id="year" type="number" value={metadata.year} onChange={(e) => setMetadata({ ...metadata, year: parseInt(e.target.value) || 2024 })} placeholder="1900〜2025" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sex">性別</Label>
                            <Select id="sex" value={metadata.sex} onChange={(e) => setMetadata({ ...metadata, sex: e.target.value as "male" | "female" | "gender" })}>
                                <option value="gender">ジェンダー</option>
                                <option value="male">男性</option>
                                <option value="female">女性</option>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit}>保存</Button>
                </CardFooter>
            </Card>

            {/* 検索フォーム */}
            <Card>
                <CardHeader>
                    <CardTitle>検索</CardTitle>
                    <CardDescription>テキストで検索します</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="query">検索クエリ</Label>
                        <Input id="query" value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="テキスト" />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="topk">topK</Label>
                            <span className="text-xs text-gray-500">{topK}</span>
                        </div>
                        {/* 値域: 1..100, 初期値: 10 */}
                        <Slider
                            id="topk"
                            min={1}
                            max={30}
                            step={1}
                            value={[topK]}
                            onValueChange={(v) => setTopK(v[0] ?? 10)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="threshold">スコア閾値</Label>
                            <span className="text-xs text-gray-500">{threshold.toFixed(2)}</span>
                        </div>
                        {/* 値域: 0.00..1.00, 初期値: 0.70 */}
                        <Slider
                            id="threshold"
                            min={0}
                            max={1}
                            step={0.01}
                            value={[threshold]}
                            onValueChange={(v) => setThreshold(Number((v[0] ?? 0.7).toFixed(2)))}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                    <Button onClick={handleSearchByText} disabled={loading}>
                        テキスト検索
                    </Button>
                    <Button className="hidden" variant="secondary" onClick={handleSearchByVector} disabled={loading}>
                        ベクター検索
                    </Button>
                </CardFooter>
            </Card>

            {loading && <p className="text-sm text-gray-500">検索中...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>検索結果</CardTitle>
                        <CardDescription>requestId: {results?.requestId ?? "-"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(results, null, 2)}</pre>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}