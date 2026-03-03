import type { Store, Area } from "../../src/types/store";

const ADDRESS_TO_AREA: [string[], Area][] = [
  [["마포구"], "hongdae"],
  [["서대문구", "신촌"], "sinchon"],
  [["강남구", "서초구"], "gangnam"],
  [["종로구"], "jongno"],
  [["동대문구", "중구"], "dongdaemun"],
  [["용산구"], "yongsan"],
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
