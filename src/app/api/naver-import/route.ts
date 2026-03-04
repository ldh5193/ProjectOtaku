import { NextRequest, NextResponse } from "next/server";

interface ImportResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  originalUrl: string;
  naverPlaceId?: string;
  imageUrl?: string;
}

async function resolveNaverUrl(url: string): Promise<string> {
  if (url.includes("naver.me/")) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const location = res.headers.get("location");
      if (location) return location;
    } catch {
      // fallback to original
    }
  }
  return url;
}

function extractPlaceId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // /p/entry/place/{placeId}
    const entryMatch = path.match(/\/p\/entry\/place\/(\d+)/);
    if (entryMatch) return entryMatch[1];

    // /p/search/{query}/place/{placeId}
    const searchPlaceMatch = path.match(/\/p\/search\/[^/]+\/place\/(\d+)/);
    if (searchPlaceMatch) return searchPlaceMatch[1];

    // /place/{placeId} (m.place.naver.com)
    const mPlaceMatch = path.match(/\/place\/(\d+)/);
    if (mPlaceMatch) return mPlaceMatch[1];

    // v5 patterns
    const v5Entry = path.match(/\/v5\/entry\/place\/(\d+)/);
    if (v5Entry) return v5Entry[1];
  } catch {
    // URL parsing failed
  }
  return null;
}

async function fetchPlaceData(
  placeId: string
): Promise<ImportResult | null> {
  try {
    const res = await fetch(`https://m.place.naver.com/place/${placeId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      },
    });
    const html = await res.text();

    // 첫 번째 매칭만 추출 (해당 매장의 정보)
    const nameMatch = html.match(/"name":"([^"]+)"/);
    const roadAddrMatch = html.match(/"roadAddress":"([^"]+)"/);
    const addrMatch = html.match(/"address":"([^"]+)"/);
    const xMatch = html.match(/"x":"([0-9.]+)"/);
    const yMatch = html.match(/"y":"([0-9.]+)"/);
    const phoneMatch = html.match(/"phone":"([^"]+)"/);

    const name = nameMatch?.[1];
    const address = roadAddrMatch?.[1] ?? addrMatch?.[1];
    const lng = xMatch?.[1] ? parseFloat(xMatch[1]) : null;
    const lat = yMatch?.[1] ? parseFloat(yMatch[1]) : null;

    if (!name || !address || lat == null || lng == null) return null;

    // og:image
    const ogImage = html.match(
      /<meta\s+[^>]*property="og:image"\s+content="([^"]+)"/
    );
    const imageUrl = ogImage
      ? ogImage[1].replace(/&amp;/g, "&")
      : undefined;

    return {
      name,
      address,
      lat,
      lng,
      phone: phoneMatch?.[1] || undefined,
      originalUrl: "",
      naverPlaceId: placeId,
      imageUrl,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      );
    }

    if (
      !url.includes("naver.me/") &&
      !url.includes("map.naver.com/") &&
      !url.includes("place.naver.com/")
    ) {
      return NextResponse.json(
        { error: "네이버 지도 URL이 아닙니다" },
        { status: 400 }
      );
    }

    // Step 1: Resolve short URL
    const resolvedUrl = await resolveNaverUrl(url);

    // Step 2: Extract place ID from URL
    const placeId = extractPlaceId(resolvedUrl);

    if (!placeId) {
      return NextResponse.json(
        { error: "URL에서 매장 ID를 추출할 수 없습니다." },
        { status: 422 }
      );
    }

    // Step 3: Fetch place data from m.place.naver.com
    const result = await fetchPlaceData(placeId);

    if (!result) {
      return NextResponse.json(
        { error: "매장 정보를 가져올 수 없습니다." },
        { status: 404 }
      );
    }

    result.originalUrl = url;

    return NextResponse.json({ success: true, place: result });
  } catch (err) {
    console.error("Naver import error:", err);
    return NextResponse.json(
      { error: "URL 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
