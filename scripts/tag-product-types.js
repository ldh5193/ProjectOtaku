/**
 * 웹 검색 결과 기반 매장 상품 유형 일괄 태깅 스크립트
 * 프랜차이즈 + 매장명 키워드 + 장르 조합으로 productTypes 추론
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../public/data/stores-naver.json");
const stores = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// --- 프랜차이즈별 상품 유형 매핑 (웹 검색 결과 기반) ---
const franchiseRules = [
  // 피규어 전문점
  { match: (n) => /피규어프레소|피규어센터|피규어리본|씽스피규어|더피규어|원피규어|피규어팜/.test(n), tags: ["figure-scale", "figure-nendoroid"] },
  { match: (n) => /박서방/.test(n), tags: ["figure-scale", "figure-nendoroid", "blindbox"] },

  // 건담/프라모델 전문
  { match: (n) => /건담베이스/.test(n), tags: ["figure-scale", "figure-nendoroid"] },

  // 애니메이트 - 일본 애니 굿즈 종합
  { match: (n) => /애니메이트/.test(n), tags: ["acrylstand", "keychain", "poster", "stationery", "blindbox"] },

  // 애니플러스 - 애니 굿즈
  { match: (n) => /애니플러스/.test(n), tags: ["acrylstand", "keychain", "poster"] },

  // 팝마트 - 블라인드박스 전문
  { match: (n) => /팝마트|popmart/i.test(n), tags: ["blindbox"] },

  // 토이저러스 - 대형 완구 매장
  { match: (n) => /토이저러스/.test(n), tags: ["blindbox", "plush", "figure-scale"] },

  // 롯데마트/일렉트로마트 - 대형 매장 내 완구
  { match: (n) => /롯데마트|일렉트로마트/.test(n), tags: ["blindbox", "plush"] },

  // 브라더굿즈 - 가챠+굿즈 종합
  { match: (n) => /브라더굿즈/.test(n), tags: ["blindbox", "acrylstand", "keychain"] },

  // 애니세카이 - 피규어+굿즈 종합
  { match: (n) => /애니세카이/.test(n), tags: ["figure-scale", "figure-nendoroid", "acrylstand", "keychain", "blindbox"] },

  // 더쿠 - 종합 오타쿠샵
  { match: (n) => /^더쿠\s/.test(n), tags: ["figure-scale", "figure-nendoroid", "acrylstand", "keychain", "blindbox"] },

  // 히든토이 - 블라인드박스/피규어
  { match: (n) => /히든토이/.test(n), tags: ["blindbox", "figure-scale"] },

  // 토이 관련 매장 - 완구 종합
  { match: (n) => /토이마켓|토이아울렛|토이아일랜드|오모차랜드|토이친구/.test(n), tags: ["blindbox", "plush", "figure-scale"] },

  // 캑티, 으라차챠, 가챠샵 등 가챠 전문
  { match: (n) => /캑티|으라차챠|가챠샵|우주가챠|가챠오션|꽁실가챠|네코가챠|플레이캡슐|캡슐토이|행궁가챠/.test(n), tags: ["blindbox"] },

  // 굿즈 전문점
  { match: (n) => /제이굿즈|더굿즈|에스엠지굿즈/.test(n), tags: ["acrylstand", "keychain", "blindbox"] },

  // 키덜트/토이 종합
  { match: (n) => /키덜트|슈퍼플레이/.test(n), tags: ["blindbox", "figure-scale", "plush"] },

  // 라신반 - 중고 피규어
  { match: (n) => /라신반/.test(n), tags: ["figure-scale", "figure-nendoroid"] },

  // 도토리숲
  { match: (n) => /도토리숲/.test(n), tags: ["blindbox", "plush", "keychain"] },

  // 모와즐
  { match: (n) => /모와즐/.test(n), tags: ["acrylstand", "keychain", "blindbox"] },

  // 랑스토어
  { match: (n) => /랑스토어/.test(n), tags: ["acrylstand", "keychain", "poster"] },

  // 턴스톡스
  { match: (n) => /턴스톡스/.test(n), tags: ["figure-scale", "blindbox"] },

  // 애니랜드
  { match: (n) => /애니랜드/.test(n), tags: ["acrylstand", "keychain", "figure-scale", "blindbox"] },

  // 한토이
  { match: (n) => /한토이/.test(n), tags: ["blindbox", "plush", "figure-scale"] },

  // 토피코
  { match: (n) => /토피코/.test(n), tags: ["blindbox", "figure-scale", "plush"] },
];

// --- 매장명 키워드 기반 태깅 ---
const keywordRules = [
  { keyword: /피규어/, tags: ["figure-scale"] },
  { keyword: /넨도/, tags: ["figure-nendoroid"] },
  { keyword: /봉제|인형|플러시/, tags: ["plush"] },
  { keyword: /블라인드|랜덤박스|랜덤볼/, tags: ["blindbox"] },
  { keyword: /포토카드|포카/, tags: ["photocard"] },
  { keyword: /아크릴/, tags: ["acrylstand"] },
  { keyword: /키링/, tags: ["keychain"] },
  { keyword: /문구/, tags: ["stationery"] },
  { keyword: /포스터/, tags: ["poster"] },
  { keyword: /의류|패션/, tags: ["apparel"] },
];

// --- 장르 기반 기본 태깅 (보수적) ---
function getGenreBasedTags(store) {
  const tags = [];
  const genres = store.genre || [];

  if (genres.includes("figure")) {
    tags.push("figure-scale");
  }
  if (genres.includes("idol")) {
    tags.push("photocard", "acrylstand", "keychain");
  }
  if (genres.includes("gashapon")) {
    tags.push("blindbox");
  }

  return tags;
}

let tagged = 0;
let unchanged = 0;

for (const store of stores) {
  const allTags = new Set();

  // 1. 프랜차이즈 규칙
  for (const rule of franchiseRules) {
    if (rule.match(store.name)) {
      rule.tags.forEach(t => allTags.add(t));
    }
  }

  // 2. 키워드 규칙
  for (const rule of keywordRules) {
    if (rule.keyword.test(store.name) || (store.description && rule.keyword.test(store.description))) {
      rule.tags.forEach(t => allTags.add(t));
    }
  }

  // 3. 장르 기반 (프랜차이즈/키워드로 태깅되지 않은 경우만)
  if (allTags.size === 0) {
    getGenreBasedTags(store).forEach(t => allTags.add(t));
  }

  if (allTags.size > 0) {
    store.productTypes = Array.from(allTags);
    tagged++;
  } else {
    unchanged++;
  }
}

// 통계 출력
console.log(`\nTagging complete:`);
console.log(`  Tagged: ${tagged} stores`);
console.log(`  No tags: ${unchanged} stores`);
console.log(`  Total: ${stores.length} stores`);

// 태그 분포
const dist = {};
for (const s of stores) {
  if (s.productTypes) {
    for (const pt of s.productTypes) {
      dist[pt] = (dist[pt] || 0) + 1;
    }
  }
}
console.log(`\nProduct type distribution:`);
Object.entries(dist).sort((a, b) => b[1] - a[1]).forEach(([pt, c]) => console.log(`  ${pt}: ${c}`));

// 저장
fs.writeFileSync(DATA_PATH, JSON.stringify(stores, null, 2) + "\n");
console.log(`\nSaved to ${DATA_PATH}`);
