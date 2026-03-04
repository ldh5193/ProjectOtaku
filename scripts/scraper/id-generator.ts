import type { Store, Area } from "../../src/types/store";

const ADDRESS_TO_AREA: [string[], Area][] = [
  // 서울 세부
  [["마포구"], "hongdae"],
  [["서대문구", "신촌"], "sinchon"],
  [["강남구", "서초구"], "gangnam"],
  [["종로구"], "jongno"],
  [["동대문구"], "dongdaemun"],
  [["용산구"], "yongsan"],
  [["송파구"], "songpa"],
  [["광진구"], "gwangjin"],
  // 서울 기타 (위 매칭 안 된 서울)
  [["서울"], "etc-seoul"],
  // 광역시
  [["부산"], "busan"],
  [["대구"], "daegu"],
  [["대전"], "daejeon"],
  [["광주"], "gwangju"],
  [["인천"], "incheon"],
  // 도
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

export function detectArea(address: string): Area {
  for (const [keywords, area] of ADDRESS_TO_AREA) {
    for (const kw of keywords) {
      if (address.includes(kw)) return area;
    }
  }
  return "etc";
}

export function generateId(address: string, existingStores: Store[]): string {
  const area = detectArea(address);

  const existingIds = existingStores
    .filter((s) => s.id.startsWith(`${area}-`))
    .map((s) => {
      const num = parseInt(s.id.split("-")[1], 10);
      return isNaN(num) ? 0 : num;
    });

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  const nextId = String(maxId + 1).padStart(3, "0");

  return `${area}-${nextId}`;
}
