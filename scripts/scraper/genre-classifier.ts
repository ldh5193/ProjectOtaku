import type { Genre } from "../../src/types/store";
import type { KakaoPlace } from "./kakao-client";

interface GenreRule {
  keywords: string[];
  genre: Genre;
}

const RULES: GenreRule[] = [
  { keywords: ["피규어", "프라모델", "넨도로이드", "반다이"], genre: "figure" },
  { keywords: ["가챠", "가샤폰", "캡슐토이"], genre: "gashapon" },
  { keywords: ["만화", "코믹스", "라노벨", "라이트노벨", "동인지"], genre: "manga" },
  { keywords: ["TCG", "카드샵", "트레이딩카드", "포켓몬카드", "유희왕", "원피스카드"], genre: "tcg" },
  { keywords: ["아이돌", "포토카드", "앨범", "K-POP", "kpop"], genre: "idol" },
  { keywords: ["애니", "애니메이션", "아니플러스", "오타쿠"], genre: "anime" },
  { keywords: ["게임", "닌텐도", "플스", "PS5", "레트로게임"], genre: "game" },
  { keywords: ["굿즈", "캐릭터", "키링", "아크릴", "스티커"], genre: "goods" },
];

export function classifyGenres(place: KakaoPlace, searchKeyword: string): Genre[] {
  const text = `${place.place_name} ${place.category_name} ${searchKeyword}`.toLowerCase();
  const matched = new Set<Genre>();

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        matched.add(rule.genre);
        break;
      }
    }
  }

  // Default to goods if nothing matched
  if (matched.size === 0) {
    matched.add("goods");
  }

  return Array.from(matched);
}
