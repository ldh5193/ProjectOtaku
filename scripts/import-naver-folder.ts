/**
 * 네이버 지도 공유 폴더 → stores-naver.json 동기화 스크립트
 *
 * 사용법:
 *   npm run import:naver
 *   npm run import:naver -- --url "https://naver.me/xxxxx"
 *   npm run import:naver -- --share-id "e09ba28f..."
 *   npm run import:naver -- --dry-run        # 저장 없이 미리보기
 *   npm run import:naver -- --skip-thumbnails # 썸네일 생략 (빠른 실행)
 *
 * 중복 처리:
 *   - stores-manual.json에 같은 매장이 있으면 → stores-naver.json으로 이동
 *   - 이동 시 manual에서 수동 입력한 정보(genre, description 등)는 보존
 */

import fs from "fs";
import path from "path";
import type { Store, Genre } from "../src/types/store";
import { detectArea, generateId } from "./scraper/id-generator";

// ── 설정 ──────────────────────────────────────────

const DEFAULT_SHARE_ID = "e09ba28f2c684462b6681d1ce9dbf384";
const API_BASE = "https://pages.map.naver.com/save-pages/api/maps-bookmark/v3";
const MANUAL_PATH = path.resolve(__dirname, "../public/data/stores-manual.json");
const NAVER_PATH = path.resolve(__dirname, "../public/data/stores-naver.json");
const BATCH_SIZE = 20; // placeInfo=true 최대 한도

// ── 타입 ──────────────────────────────────────────

interface NaverBookmark {
  bookmarkId: number;
  name: string;
  address: string;
  px: number; // lng
  py: number; // lat
  sid: string; // naver place ID
  mcid: string;
  mcidName: string;
  type: string;
  available: boolean;
  placeInfo?: {
    thumbnailUrls?: string[];
    category?: string;
  };
}

interface NaverFolderResponse {
  folder: {
    name: string;
    bookmarkCount: number;
    shareId: string;
  };
  bookmarkList: NaverBookmark[];
}

// ── 장르 분류 ──────────────────────────────────────

interface GenreRule {
  keywords: string[];
  genre: Genre;
}

const GENRE_RULES: GenreRule[] = [
  {
    keywords: ["가챠", "가샤폰", "캡슐토이", "gashapon", "가차"],
    genre: "gashapon",
  },
  {
    keywords: ["피규어", "프라모델", "넨도로이드", "반다이", "건담", "figure"],
    genre: "figure",
  },
  {
    keywords: ["만화", "코믹스", "라노벨", "라이트노벨", "동인지", "북스"],
    genre: "manga",
  },
  {
    keywords: ["TCG", "카드샵", "트레이딩카드", "포켓몬카드", "유희왕", "원피스카드", "카드"],
    genre: "tcg",
  },
  {
    keywords: ["아이돌", "포토카드", "앨범", "K-POP", "kpop", "최애"],
    genre: "idol",
  },
  {
    keywords: ["애니", "애니메이션", "아니플러스", "오타쿠", "anime"],
    genre: "anime",
  },
  {
    keywords: ["게임", "닌텐도", "플스", "PS5", "레트로게임", "오락실"],
    genre: "game",
  },
  {
    keywords: ["굿즈", "캐릭터", "키링", "아크릴", "스티커", "문구"],
    genre: "goods",
  },
];

function classifyGenres(name: string, category?: string): Genre[] {
  const text = `${name} ${category ?? ""}`.toLowerCase();
  const matched = new Set<Genre>();

  for (const rule of GENRE_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        matched.add(rule.genre);
        break;
      }
    }
  }

  if (matched.size === 0) {
    matched.add("goods");
  }

  return Array.from(matched);
}

// ── API 호출 ──────────────────────────────────────

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Referer: "https://pages.map.naver.com/save-pages/",
  "Accept-Language": "ko",
};

async function resolveShareId(input: string): Promise<string> {
  if (/^[a-f0-9]{32}$/.test(input)) return input;

  if (input.includes("naver.me/")) {
    const res = await fetch(input, { redirect: "manual" });
    const location = res.headers.get("location");
    if (location) {
      const match = location.match(/folder\/([a-f0-9]{32})/);
      if (match) return match[1];
    }
  }

  const match = input.match(/folder\/([a-f0-9]{32})/);
  if (match) return match[1];

  throw new Error(`공유 폴더 ID를 추출할 수 없습니다: ${input}`);
}

async function fetchBookmarks(
  shareId: string,
  withPlaceInfo: boolean
): Promise<{ folder: NaverFolderResponse["folder"]; bookmarks: NaverBookmark[] }> {
  // 1단계: 전체 목록 (한국어 주소)
  const infoUrl = `${API_BASE}/shares/${shareId}/bookmarks?start=0&limit=500`;
  const infoRes = await fetch(infoUrl, { headers: HEADERS });
  if (!infoRes.ok) throw new Error(`API 오류: ${infoRes.status}`);
  const infoData: NaverFolderResponse = await infoRes.json();

  const folder = infoData.folder;
  const bookmarks = infoData.bookmarkList;

  console.log(`📂 폴더: ${folder.name} (${folder.bookmarkCount}개)`);

  if (!withPlaceInfo) return { folder, bookmarks };

  // 2단계: placeInfo(썸네일) 가져와서 기본 데이터에 병합
  // placeInfo=true 응답은 영어 주소를 반환하므로, 썸네일만 추출해서 병합
  console.log(`🖼️  썸네일 정보 가져오는 중...`);
  const thumbnailMap = new Map<number, NaverBookmark["placeInfo"]>();
  const total = bookmarks.length;

  for (let start = 0; start < total; start += BATCH_SIZE) {
    const url = `${API_BASE}/shares/${shareId}/bookmarks?start=${start}&limit=${BATCH_SIZE}&placeInfo=true`;
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) {
      const data: NaverFolderResponse = await res.json();
      for (const b of data.bookmarkList) {
        if (b.placeInfo) thumbnailMap.set(b.bookmarkId, b.placeInfo);
      }
    }

    const progress = Math.min(start + BATCH_SIZE, total);
    process.stdout.write(`\r  ${progress}/${total} 완료`);

    if (start + BATCH_SIZE < total) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  console.log(`  (썸네일 ${thumbnailMap.size}개 확보)`);

  // 한국어 주소 북마크에 썸네일 병합
  for (const bookmark of bookmarks) {
    const pi = thumbnailMap.get(bookmark.bookmarkId);
    if (pi) bookmark.placeInfo = pi;
  }

  return { folder, bookmarks };
}

// ── 중복 판별 ──────────────────────────────────────

function normalize(text: string): string {
  return text
    .replace(/\s+/g, "")
    .replace(/서울특별시/g, "서울")
    .replace(/[()-]/g, "")
    .toLowerCase();
}

function isDuplicate(existing: Store, bookmark: NaverBookmark): boolean {
  if (existing.naverPlaceId && existing.naverPlaceId === bookmark.sid) {
    return true;
  }

  const nameMatch = normalize(existing.name) === normalize(bookmark.name);
  const addrNorm = normalize(bookmark.address);
  const existAddrNorm = normalize(existing.address);

  if (nameMatch && existAddrNorm === addrNorm) return true;
  if (nameMatch && addrNorm.length >= 10 && existAddrNorm.includes(addrNorm.slice(0, 10))) {
    return true;
  }

  return false;
}

// ── 변환 ──────────────────────────────────────────

function bookmarkToStore(
  bookmark: NaverBookmark,
  allStores: Store[],
  mergeFrom?: Store
): Store {
  const id = mergeFrom?.id ?? generateId(bookmark.address, allStores);
  const genres = mergeFrom?.genre ?? classifyGenres(bookmark.name, bookmark.placeInfo?.category ?? bookmark.mcidName);
  const today = new Date().toISOString().split("T")[0];

  const store: Store = {
    id,
    name: bookmark.name,
    address: bookmark.address,
    lat: bookmark.py,
    lng: bookmark.px,
    genre: genres,
    type: mergeFrom?.type ?? "independent",
    source: "naver-shared",
    lastVerified: today,
    naverPlaceId: bookmark.sid,
  };

  // 수동 입력에서 보존할 정보
  if (mergeFrom?.phone) store.phone = mergeFrom.phone;
  if (mergeFrom?.openingHours) store.openingHours = mergeFrom.openingHours;
  if (mergeFrom?.website) store.website = mergeFrom.website;
  if (mergeFrom?.description) store.description = mergeFrom.description;

  if (bookmark.placeInfo?.thumbnailUrls?.length) {
    store.thumbnailUrls = bookmark.placeInfo.thumbnailUrls;
  } else if (mergeFrom?.thumbnailUrls) {
    store.thumbnailUrls = mergeFrom.thumbnailUrls;
  }

  return store;
}

// ── 메인 ──────────────────────────────────────────

function loadJson(filepath: string): Store[] {
  if (!fs.existsSync(filepath)) return [];
  const raw = fs.readFileSync(filepath, "utf-8").trim();
  if (!raw || raw === "[]") return [];
  return JSON.parse(raw);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipThumbnails = args.includes("--skip-thumbnails");

  let shareInput = DEFAULT_SHARE_ID;
  const urlIdx = args.indexOf("--url");
  if (urlIdx !== -1 && args[urlIdx + 1]) shareInput = args[urlIdx + 1];
  const idIdx = args.indexOf("--share-id");
  if (idIdx !== -1 && args[idIdx + 1]) shareInput = args[idIdx + 1];

  const shareId = await resolveShareId(shareInput);
  console.log(`🔗 공유 폴더 ID: ${shareId}`);

  // 기존 데이터 로드 (분리 관리)
  const manualStores = loadJson(MANUAL_PATH);
  const naverStores = loadJson(NAVER_PATH);
  console.log(`📦 기존 매장: manual=${manualStores.length}, naver=${naverStores.length}`);

  // API에서 북마크 가져오기
  const { bookmarks } = await fetchBookmarks(shareId, !skipThumbnails);
  console.log(`📥 가져온 북마크: ${bookmarks.length}개`);

  const available = bookmarks.filter((b) => b.available && b.type === "place");
  console.log(`✅ 유효한 매장: ${available.length}개`);

  // 중복 처리 + 변환
  const seenSids = new Set<string>();
  const newNaverStores: Store[] = [];
  const updatedManual = [...manualStores]; // manual에서 제거될 항목 추적용
  let newCount = 0;
  let movedFromManual = 0;
  let updatedCount = 0;

  // 기존 naver 매장을 sid 기준으로 인덱싱
  const naverBySid = new Map<string, Store>();
  for (const s of naverStores) {
    if (s.naverPlaceId) naverBySid.set(s.naverPlaceId, s);
  }

  // 전체 매장 리스트 (ID 생성에 사용)
  const allStoresForId = [...manualStores, ...naverStores];

  for (const bookmark of available) {
    if (seenSids.has(bookmark.sid)) continue;
    seenSids.add(bookmark.sid);

    // 1) 기존 naver 목록에 있는지 확인
    const existingNaver = naverBySid.get(bookmark.sid) ??
      naverStores.find((s) => isDuplicate(s, bookmark));

    if (existingNaver) {
      // 기존 naver 매장 업데이트
      const updated = bookmarkToStore(bookmark, allStoresForId, existingNaver);
      newNaverStores.push(updated);
      updatedCount++;
      continue;
    }

    // 2) manual 목록에 있는지 확인 → 있으면 naver로 이동
    const manualIdx = updatedManual.findIndex((s) => isDuplicate(s, bookmark));

    if (manualIdx !== -1) {
      const manualStore = updatedManual[manualIdx];
      const moved = bookmarkToStore(bookmark, allStoresForId, manualStore);
      newNaverStores.push(moved);
      updatedManual.splice(manualIdx, 1); // manual에서 제거
      movedFromManual++;
      continue;
    }

    // 3) 새 매장
    const store = bookmarkToStore(bookmark, [...allStoresForId, ...newNaverStores]);
    newNaverStores.push(store);
    newCount++;
  }

  // 통계
  console.log(`\n📊 결과:`);
  console.log(`  새로 추가: ${newCount}개`);
  console.log(`  기존 naver 업데이트: ${updatedCount}개`);
  console.log(`  manual → naver 이동: ${movedFromManual}개`);
  console.log(`  naver 총 매장: ${newNaverStores.length}개`);
  console.log(`  manual 잔여: ${updatedManual.length}개`);

  // 지역별 분포
  const areaCounts = new Map<string, number>();
  for (const s of newNaverStores) {
    const area = s.id.split("-")[0];
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }
  console.log(`\n📍 지역별 분포:`);
  for (const [area, count] of [...areaCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${area}: ${count}개`);
  }

  if (dryRun) {
    console.log(`\n🔍 드라이런 모드 — 파일 저장 건너뜀`);
    return;
  }

  // 저장
  fs.writeFileSync(NAVER_PATH, JSON.stringify(newNaverStores, null, 2) + "\n");
  console.log(`\n💾 저장: ${NAVER_PATH} (${newNaverStores.length}개)`);

  if (movedFromManual > 0) {
    fs.writeFileSync(MANUAL_PATH, JSON.stringify(updatedManual, null, 2) + "\n");
    console.log(`💾 저장: ${MANUAL_PATH} (${updatedManual.length}개)`);
  }
}

main().catch((err) => {
  console.error("❌ 오류:", err.message);
  process.exit(1);
});
