import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import type { Store, Genre } from "@/types/store";
import { ALL_GENRES } from "@/types/store";
import { createRateLimiter } from "@/lib/rate-limit";

const checkRateLimit = createRateLimiter(5, 60_000);

const URL_STORES_PATH = resolve(process.cwd(), "public/data/stores-url.json");
const MANUAL_PATH = resolve(process.cwd(), "public/data/stores-manual.json");
const NAVER_PATH = resolve(process.cwd(), "public/data/stores-naver.json");

// ── 지역 감지 (id-generator와 동일 로직) ──

const ADDRESS_TO_AREA: [string[], string][] = [
  [["마포구"], "hongdae"],
  [["서대문구", "신촌"], "sinchon"],
  [["강남구", "서초구"], "gangnam"],
  [["종로구"], "jongno"],
  [["동대문구"], "dongdaemun"],
  [["용산구"], "yongsan"],
  [["송파구"], "songpa"],
  [["광진구"], "gwangjin"],
  [["서울"], "seouletc"],
  [["부산"], "busan"],
  [["대구"], "daegu"],
  [["대전"], "daejeon"],
  [["광주"], "gwangju"],
  [["인천"], "incheon"],
  [["경기"], "gyeonggi"],
  [["충남", "충청남도"], "chungnam"],
  [["충북", "충청북도"], "chungbuk"],
  [["전북", "전라북도"], "jeonbuk"],
  [["전남", "전라남도"], "jeonnam"],
  [["경북", "경상북도"], "gyeongbuk"],
  [["경남", "경상남도"], "gyeongnam"],
  [["강원"], "gangwon"],
  [["제주"], "jeju"],
];

function detectArea(address: string): string {
  for (const [keywords, area] of ADDRESS_TO_AREA) {
    for (const kw of keywords) {
      if (address.includes(kw)) return area;
    }
  }
  return "etc";
}

function generateId(address: string, existingStores: Store[]): string {
  const area = detectArea(address);
  const existingIds = existingStores
    .filter((s) => s.id.startsWith(`${area}-`))
    .map((s) => {
      const parts = s.id.split("-");
      const num = parseInt(parts[parts.length - 1], 10);
      return isNaN(num) ? 0 : num;
    });
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `${area}-${String(maxId + 1).padStart(3, "0")}`;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, "").replace(/서울특별시/g, "서울").replace(/[()-]/g, "").toLowerCase();
}

function isDuplicate(existing: Store, name: string, address: string, naverPlaceId?: string): boolean {
  if (naverPlaceId && existing.naverPlaceId === naverPlaceId) return true;
  const nameMatch = normalize(existing.name) === normalize(name);
  const addrNorm = normalize(address);
  const existAddrNorm = normalize(existing.address);
  if (nameMatch && existAddrNorm === addrNorm) return true;
  if (nameMatch && addrNorm.length >= 10 && existAddrNorm.includes(addrNorm.slice(0, 10))) return true;
  return false;
}

function loadJson(filepath: string): Store[] {
  try {
    const raw = readFileSync(filepath, "utf-8").trim();
    if (!raw || raw === "[]") return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

interface SaveBody {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  naverPlaceId?: string;
  imageUrl?: string;
  genres: Genre[];
}

export async function POST(request: NextRequest) {
  try {
    // 레이트리밋
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body: SaveBody = await request.json();

    if (!body.name || !body.address || !body.lat || !body.lng) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다" }, { status: 400 });
    }

    // 입력 검증
    if (body.name.length > 100) {
      return NextResponse.json({ error: "매장명이 너무 깁니다 (최대 100자)" }, { status: 400 });
    }
    if (body.address.length > 200) {
      return NextResponse.json({ error: "주소가 너무 깁니다 (최대 200자)" }, { status: 400 });
    }
    if (body.phone && body.phone.length > 20) {
      return NextResponse.json({ error: "전화번호가 너무 깁니다 (최대 20자)" }, { status: 400 });
    }
    if (body.lat < 33 || body.lat > 39 || body.lng < 124 || body.lng > 132) {
      return NextResponse.json({ error: "유효하지 않은 좌표입니다" }, { status: 400 });
    }
    if (body.imageUrl && !body.imageUrl.startsWith("https://")) {
      return NextResponse.json({ error: "이미지 URL은 https://로 시작해야 합니다" }, { status: 400 });
    }
    // 유효한 장르만 필터
    body.genres = body.genres.filter((g) => ALL_GENRES.includes(g));

    // 전체 매장 로드 (중복 확인 + ID 생성용)
    const manual = loadJson(MANUAL_PATH);
    const naver = loadJson(NAVER_PATH);
    const urlStores = loadJson(URL_STORES_PATH);
    const allStores = [...manual, ...naver, ...urlStores];

    // 중복 확인
    const dup = allStores.find((s) => isDuplicate(s, body.name, body.address, body.naverPlaceId));
    if (dup) {
      return NextResponse.json(
        { error: `이미 등록된 매장입니다: ${dup.name} (${dup.id})` },
        { status: 409 }
      );
    }

    // 새 매장 생성
    const id = generateId(body.address, allStores);
    const today = new Date().toISOString().split("T")[0];
    const newStore: Store = {
      id,
      name: body.name,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
      genre: body.genres.length > 0 ? body.genres : ["goods"],
      type: "independent",
      source: "manual",
      lastVerified: today,
      naverPlaceId: body.naverPlaceId,
    };
    if (body.phone) newStore.phone = body.phone;
    if (body.imageUrl) newStore.thumbnailUrls = [body.imageUrl];

    urlStores.push(newStore);
    writeFileSync(URL_STORES_PATH, JSON.stringify(urlStores, null, 2) + "\n");

    return NextResponse.json({ success: true, store: newStore });
  } catch (err) {
    console.error("URL import save error:", err);
    return NextResponse.json(
      { error: "매장 저장에 실패했습니다" },
      { status: 500 }
    );
  }
}
