const KAKAO_API_BASE = "https://dapi.kakao.com/v2/local/search/keyword.json";

export interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string; // longitude
  y: string; // latitude
  category_name: string;
  place_url: string;
}

interface KakaoSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoPlace[];
}

export async function searchKeyword(
  apiKey: string,
  query: string,
  options?: { x?: string; y?: string; radius?: number; page?: number }
): Promise<KakaoSearchResponse> {
  const params = new URLSearchParams({
    query,
    size: "15",
    page: String(options?.page ?? 1),
  });

  if (options?.x && options?.y) {
    params.set("x", options.x);
    params.set("y", options.y);
    params.set("radius", String(options?.radius ?? 5000));
  }

  const res = await fetch(`${KAKAO_API_BASE}?${params}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });

  if (!res.ok) {
    throw new Error(`Kakao API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function searchAllPages(
  apiKey: string,
  query: string,
  options?: { x?: string; y?: string; radius?: number }
): Promise<KakaoPlace[]> {
  const all: KakaoPlace[] = [];
  let page = 1;

  while (true) {
    const res = await searchKeyword(apiKey, query, { ...options, page });
    all.push(...res.documents);

    if (res.meta.is_end || page >= 3) break; // max 3 pages (45 results)
    page++;
    await delay(200);
  }

  return all;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
