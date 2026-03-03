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

type Area = "hongdae" | "gangnam" | "sinchon" | "etc";

export const areaLabels: Record<Area, string> = {
  hongdae: "홍대",
  gangnam: "강남",
  sinchon: "신촌",
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
