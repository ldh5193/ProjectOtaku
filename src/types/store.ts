export type Genre =
  | "anime"
  | "figure"
  | "goods"
  | "manga"
  | "game"
  | "idol"
  | "tcg"
  | "gashapon";

export type StoreType = "franchise" | "independent" | "popup";

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  genre: Genre[];
  type: StoreType;
  phone?: string;
  openingHours?: string;
  website?: string;
  description?: string;
  source?: "manual" | "scraped";
  lastVerified?: string;
}

export const genreLabels: Record<Genre, string> = {
  anime: "애니",
  figure: "피규어",
  goods: "굿즈",
  manga: "만화",
  game: "게임",
  idol: "아이돌",
  tcg: "TCG",
  gashapon: "가챠",
};

export const ALL_GENRES: Genre[] = [
  "anime",
  "figure",
  "goods",
  "manga",
  "game",
  "idol",
  "tcg",
  "gashapon",
];

export type Area =
  | "hongdae"
  | "gangnam"
  | "sinchon"
  | "jongno"
  | "dongdaemun"
  | "yongsan"
  | "etc";

export const areaLabels: Record<Area, string> = {
  hongdae: "홍대",
  gangnam: "강남",
  sinchon: "신촌",
  jongno: "종로",
  dongdaemun: "동대문",
  yongsan: "용산",
  etc: "기타",
};

export function getStoreArea(store: Store): Area {
  const prefix = store.id.split("-")[0];
  if (prefix in areaLabels) return prefix as Area;
  return "etc";
}

export function getAreaLabel(store: Store): string {
  return areaLabels[getStoreArea(store)];
}
