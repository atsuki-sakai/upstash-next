import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json";
const CACHE_TTL = 3600; // 1時間

// 都市名のバリデーション関数
function validateCity(city: string | null): string | null {
  if (!city || typeof city !== "string") {
    return null;
  }
  
  const sanitizedCity = city.trim();
  if (sanitizedCity.length === 0 || sanitizedCity.length > 100) {
    return null;
  }
  
  const validCity = sanitizedCity.replace(/[^a-zA-Z0-9\s,\-]/g, "");
  return validCity || null;
}

// 天気データを取得する関数（サーバーサイド専用）
export async function getWeatherData(city: string) {
  try {
    // 都市名のバリデーション
    const validatedCity = validateCity(city);
    if (!validatedCity) {
      return { error: "有効な都市名を指定してください" };
    }

    // Redisからキャッシュされた天気データを取得
    const cachedWeather = await redis.get(`weather:${validatedCity}`);
    
    if (cachedWeather) {
      try {
        // キャッシュされたデータが文字列かどうかチェック
        if (typeof cachedWeather === "string") {
          const weatherData = JSON.parse(cachedWeather);
          return { 
            weather: weatherData,
            cached: true 
          };
        } else {
          // オブジェクトの場合はそのまま使用
          return { 
            weather: cachedWeather,
            cached: true 
          };
        }
      } catch (parseError) {
        console.error("Cache parse error:", parseError);
        // パースエラーの場合はキャッシュを削除して再取得
        await redis.del(`weather:${validatedCity}`);
      }
    }

    // Weather APIからデータを取得
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return { error: "Weather APIキーが設定されていません" };
    }

    const response = await fetch(
      `${WEATHER_API_URL}?key=${apiKey}&q=${encodeURIComponent(validatedCity)}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: "天気データの取得に失敗しました",
        details: errorData.error?.message || "Unknown error"
      };
    }

    const weatherData = await response.json();

    // データをRedisにキャッシュ（1時間有効）
    await redis.setex(`weather:${validatedCity}`, CACHE_TTL, JSON.stringify(weatherData));

    return { 
      weather: weatherData,
      cached: false 
    };

  } catch (error) {
    console.error("Weather API error:", error);
    return { error: "サーバーエラーが発生しました" };
  }
} 