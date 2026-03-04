import { NextRequest, NextResponse } from "next/server";

interface ImportResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  originalUrl: string;
  naverPlaceId?: string;
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

function extractPlaceInfo(url: string): {
  placeId?: string;
  query?: string;
} {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // /p/entry/place/{placeId}
    const entryMatch = path.match(/\/p\/entry\/place\/(\d+)/);
    if (entryMatch) return { placeId: entryMatch[1] };

    // /p/search/{query}/place/{placeId}
    const searchPlaceMatch = path.match(
      /\/p\/search\/([^/]+)\/place\/(\d+)/
    );
    if (searchPlaceMatch)
      return {
        query: decodeURIComponent(searchPlaceMatch[1]),
        placeId: searchPlaceMatch[2],
      };

    // /p/search/{query}
    const searchMatch = path.match(/\/p\/search\/([^/]+)/);
    if (searchMatch)
      return { query: decodeURIComponent(searchMatch[1]) };

    // v5 patterns
    const v5Entry = path.match(/\/v5\/entry\/place\/(\d+)/);
    if (v5Entry) return { placeId: v5Entry[1] };

    const v5Search = path.match(/\/v5\/search\/([^/]+)/);
    if (v5Search) return { query: decodeURIComponent(v5Search[1]) };
  } catch {
    // URL parsing failed
  }
  return {};
}

async function tryExtractTitleFromPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await res.text();
    const ogTitle = html.match(
      /<meta\s+property="og:title"\s+content="([^"]+)"/
    );
    if (ogTitle) {
      return ogTitle[1].replace(/ : 네이버 지도$/, "").trim();
    }
    const titleTag = html.match(/<title>([^<]+)<\/title>/);
    if (titleTag) {
      return titleTag[1].replace(/ : 네이버 지도$/, "").trim();
    }
  } catch {
    // page fetch failed
  }
  return null;
}

async function searchKakao(query: string): Promise<ImportResult | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) throw new Error("KAKAO_REST_API_KEY is not configured");

  const params = new URLSearchParams({ query, size: "1" });
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    { headers: { Authorization: `KakaoAK ${apiKey}` } }
  );

  if (!res.ok) throw new Error(`Kakao API error: ${res.status}`);

  const data = await res.json();
  if (data.documents.length === 0) return null;

  const place = data.documents[0];
  return {
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    lat: parseFloat(place.y),
    lng: parseFloat(place.x),
    phone: place.phone || undefined,
    originalUrl: "",
  };
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

    if (!url.includes("naver.me/") && !url.includes("map.naver.com/")) {
      return NextResponse.json(
        { error: "네이버 지도 URL이 아닙니다" },
        { status: 400 }
      );
    }

    // Step 1: Resolve short URL
    const resolvedUrl = await resolveNaverUrl(url);

    // Step 2: Extract place info from URL
    const { placeId, query } = extractPlaceInfo(resolvedUrl);

    // Step 3: Determine search query
    let finalQuery = query;

    if (!finalQuery && placeId) {
      finalQuery = (await tryExtractTitleFromPage(resolvedUrl)) ?? undefined;
    }

    if (!finalQuery) {
      return NextResponse.json(
        {
          error:
            "URL에서 매장 정보를 추출할 수 없습니다. 매장명을 직접 입력해주세요.",
        },
        { status: 422 }
      );
    }

    // Step 4: Search via Kakao API
    const result = await searchKakao(finalQuery);
    if (!result) {
      return NextResponse.json(
        { error: `"${finalQuery}" 검색 결과가 없습니다` },
        { status: 404 }
      );
    }

    result.originalUrl = url;
    result.naverPlaceId = placeId;

    return NextResponse.json({ success: true, place: result });
  } catch (err) {
    console.error("Naver import error:", err);
    return NextResponse.json(
      { error: "URL 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
