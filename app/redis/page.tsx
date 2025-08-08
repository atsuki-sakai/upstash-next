import { Redis } from "@upstash/redis"
import { getWeatherData } from "../lib/weather"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const redis = Redis.fromEnv()

export default async function Home() {
  try {
    // 1) カウンターをインクリメントして新しい値を取得
    const count = await redis.incr("counter")

    // 2) 天気データを取得（都市は固定で tokyo）
    const weatherData = await getWeatherData("tokyo")

    // 3) UI を Shadcn UI の Card レイアウトで構成
    return (
      <div className="container mx-auto max-w-3xl p-6 space-y-6">
        {/* タイトル領域 */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Redis Demo</h1>
          <p className="text-sm text-muted-foreground">Redis と外部APIのキャッシュ動作を確認できます</p>
        </div>

        {/* カウンターカード */}
        <Card>
          <CardHeader>
            <CardTitle>Counter</CardTitle>
            <CardDescription>ページアクセスごとにインクリメントされます</CardDescription>
            <p>１回目の取得後はキャッシュから取得され、コストとパフォーマンスの最適化が可能です。</p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{count}</p>
          </CardContent>
        </Card>

        {/* 天気カード */}
        <Card>
          <CardHeader>
            <CardTitle>東京の天気</CardTitle>
            <CardDescription>Weather API の結果を Redis に1時間キャッシュ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* 4) 取得結果の分岐表示 */}
            {weatherData.error ? (
              <p className="text-sm text-red-600">エラー: {weatherData.error}</p>
            ) : weatherData.weather ? (
              <div className="space-y-1 text-base">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">気温</span>
                  <span className="font-medium">{weatherData.weather.current?.temp_c}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">天気</span>
                  <span className="font-medium">{weatherData.weather.current?.condition?.text}</span>
                </div>
                {weatherData.cached && (
                  <p className="text-xs text-muted-foreground">(キャッシュから取得)</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">天気データを読み込み中...</p>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">キャッシュキー: weather:tokyo</div>
            {/* 5) キャッシュ削除のサーバーアクション（安全なキー名の固定） */}
            <form
              action={async () => {
                "use server"
                await redis.del("weather:tokyo")
              }}
            >
              <Button type="submit" variant="destructive" size="sm" aria-label="Delete Redis Cache">
                Delete Redis Cache
              </Button>
            </form>
          </CardFooter>
        </Card>

       
      </div>
    )
  } catch (error) {
    // 6) 例外時のフォールバックUI
    console.error("Page error:", error)
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>エラー</CardTitle>
            <CardDescription>ページの表示中にエラーが発生しました</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">ページを再読み込みしてください。</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}