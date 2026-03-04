import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { searchAllPages, type KakaoPlace } from "./kakao-client";
import { REGIONS, KEYWORDS } from "./search-queries";
import { classifyGenres } from "./genre-classifier";
import { generateId } from "./id-generator";
import { mergeStores, type CandidateStore } from "./merger";
import type { Store, Genre } from "../../src/types/store";

const MANUAL_PATH = resolve(__dirname, "../../public/data/stores-manual.json");
const NAVER_PATH = resolve(__dirname, "../../public/data/stores-naver.json");
const CANDIDATES_PATH = resolve(__dirname, "../../public/data/scraped-candidates.json");

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    console.error("KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  // 1. Load existing stores (both files)
  const manualStores: Store[] = JSON.parse(readFileSync(MANUAL_PATH, "utf-8"));
  const naverStores: Store[] = JSON.parse(readFileSync(NAVER_PATH, "utf-8"));
  const existingStores: Store[] = [...manualStores, ...naverStores];
  console.log(`기존 매장 수: manual=${manualStores.length}, naver=${naverStores.length}`);

  // 2. Search Kakao API for all region × keyword combinations
  const allPlaces = new Map<string, { place: KakaoPlace; genres: Set<Genre> }>();
  let apiCalls = 0;

  for (const region of REGIONS) {
    for (const keyword of KEYWORDS) {
      console.log(`검색 중: ${region.name} - ${keyword}`);

      try {
        const places = await searchAllPages(apiKey, `${region.name} ${keyword}`, {
          x: region.x,
          y: region.y,
          radius: region.radius,
        });

        for (const place of places) {
          const existing = allPlaces.get(place.id);
          const genres = classifyGenres(place, keyword);

          if (existing) {
            genres.forEach((g) => existing.genres.add(g));
          } else {
            allPlaces.set(place.id, {
              place,
              genres: new Set(genres),
            });
          }
        }

        apiCalls++;
      } catch (err) {
        console.error(`오류 (${region.name} - ${keyword}):`, err);
      }

      await delay(200);
    }
  }

  console.log(`\nAPI 호출 수: ${apiCalls}`);
  console.log(`검색된 고유 장소 수: ${allPlaces.size}`);

  // 3. Convert to candidate stores
  const candidates: CandidateStore[] = [];

  for (const [kakaoId, { place, genres }] of allPlaces) {
    const address = place.road_address_name || place.address_name;
    if (!address) continue;

    candidates.push({
      name: place.place_name,
      address,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      genre: Array.from(genres),
      phone: place.phone || undefined,
      kakaoPlaceId: kakaoId,
    });
  }

  // 4. Merge with existing (detect duplicates)
  const { newCount, candidates: newCandidates } = mergeStores(existingStores, candidates);
  console.log(`새로 발견된 매장 수: ${newCount}`);

  // 5. Assign IDs and create Store objects for new candidates
  const allStores = [...existingStores];

  for (const candidate of newCandidates) {
    const id = generateId(candidate.address, allStores);
    const newStore: Store = {
      id,
      name: candidate.name,
      address: candidate.address,
      lat: candidate.lat,
      lng: candidate.lng,
      genre: candidate.genre as Genre[],
      type: "independent",
      ...(candidate.phone && { phone: candidate.phone }),
      source: "scraped",
      lastVerified: new Date().toISOString().split("T")[0],
    };
    allStores.push(newStore);
  }

  // 6. Save — scraped 매장은 manual 파일에 저장
  writeFileSync(MANUAL_PATH, JSON.stringify(allStores, null, 2) + "\n", "utf-8");
  console.log(`stores-manual.json 저장 완료 (총 ${allStores.length}개 매장)`);

  // Save candidates separately for review
  writeFileSync(CANDIDATES_PATH, JSON.stringify(newCandidates, null, 2) + "\n", "utf-8");
  console.log(`scraped-candidates.json 저장 (${newCandidates.length}개 후보)`);
}

main().catch((err) => {
  console.error("스크래퍼 실행 오류:", err);
  process.exit(1);
});
