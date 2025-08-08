import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Redisクライアントの初期化
const redis = Redis.fromEnv();
const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json";
const CACHE_TTL = 36; // 1秒

// 都市名のバリデーション関数
function validateCity(city: string | null): string | null {
  if (!city || typeof city !== "string") {
    return null;
  }
  
  // 基本的なバリデーション（英数字、スペース、カンマ、ハイフンのみ許可）
  const sanitizedCity = city.trim();
  if (sanitizedCity.length === 0 || sanitizedCity.length > 100) {
    return null;
  }
  
  // 特殊文字の除去
  const validCity = sanitizedCity.replace(/[^a-zA-Z0-9\s,\-]/g, "");
  return validCity || null;
}

export async function GET(request: NextRequest) {
  try {
    // URLパラメータから都市名を取得
    const { searchParams } = new URL(request.url);
    const cityParam = searchParams.get("city");
    
    // 都市名のバリデーション
    const city = validateCity(cityParam);
    if (!city) {
      return NextResponse.json(
        { error: "有効な都市名を指定してください" },
        { status: 400 }
      );
    }

    // Redisからキャッシュされた天気データを取得
    const cachedWeather = await redis.get(`weather:${city}`);
 
    if (cachedWeather) {
        return NextResponse.json({
        weather: cachedWeather,
        cached: true
        });
    }

    // Weather APIからデータを取得
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      console.error("Weather API key not found");
      return NextResponse.json(
        { error: "Weather APIキーが設定されていません" },
        { status: 500 }
      );
    }

    console.log("Fetching weather data for:", city);
    const response = await fetch(
      `${WEATHER_API_URL}?key=${apiKey}&q=${encodeURIComponent(city)}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Weather API error:", response.status, errorData);
      return NextResponse.json(
        { 
          error: "天気データの取得に失敗しました",
          details: errorData.error?.message || "Unknown error"
        },
        { status: response.status }
      );
    }

    const weatherData = await response.json();
    console.log("Weather data received:", weatherData);

    // データをRedisにキャッシュ（1時間有効）
    await redis.setex(`weather:${city}`, CACHE_TTL, JSON.stringify(weatherData));

    return NextResponse.json({ 
      weather: weatherData,
      cached: false 
    });

  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}