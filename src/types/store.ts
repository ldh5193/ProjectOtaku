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

export type ProductType =
  | "acrylstand"
  | "blindbox"
  | "figure-nendoroid"
  | "figure-scale"
  | "plush"
  | "apparel"
  | "photocard"
  | "keychain"
  | "stationery"
  | "itabag"
  | "poster";

export const productTypeLabels: Record<ProductType, string> = {
  acrylstand: "아크스탠드",
  blindbox: "랜덤박스",
  "figure-nendoroid": "넨도로이드",
  "figure-scale": "스케일피규어",
  plush: "봉제인형",
  apparel: "의류",
  photocard: "포토카드",
  keychain: "키링",
  stationery: "문구",
  itabag: "이타백",
  poster: "포스터",
};

export const ALL_PRODUCT_TYPES: ProductType[] = [
  "acrylstand",
  "blindbox",
  "figure-nendoroid",
  "figure-scale",
  "plush",
  "apparel",
  "photocard",
  "keychain",
  "stationery",
  "itabag",
  "poster",
];

export interface DayHours {
  day: string;       // "월","화","수","목","금","토","일"
  open: string;      // "13:00"
  close: string;     // "21:00"
  off?: boolean;     // 휴무일
}

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
  businessHours?: DayHours[];
  website?: string;
  description?: string;
  source?: "manual" | "scraped" | "naver-shared";
  lastVerified?: string;
  naverPlaceId?: string;
  thumbnailUrls?: string[];
  series?: string[];
  productTypes?: ProductType[];
  popupStartDate?: string;  // "2026-03-01" (type: "popup" only)
  popupEndDate?: string;    // "2026-03-31"
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
  | "songpa"
  | "gwangjin"
  | "seouletc"
  | "gyeonggi"
  | "incheon"
  | "busan"
  | "daegu"
  | "daejeon"
  | "gwangju"
  | "chungnam"
  | "chungbuk"
  | "jeonbuk"
  | "jeonnam"
  | "gyeongbuk"
  | "gyeongnam"
  | "gangwon"
  | "jeju"
  | "etc";

export const areaLabels: Record<Area, string> = {
  hongdae: "홍대",
  gangnam: "강남",
  sinchon: "신촌",
  jongno: "종로",
  dongdaemun: "동대문",
  yongsan: "용산",
  songpa: "송파",
  gwangjin: "광진",
  seouletc: "서울(기타)",
  gyeonggi: "경기",
  incheon: "인천",
  busan: "부산",
  daegu: "대구",
  daejeon: "대전",
  gwangju: "광주",
  chungnam: "충남",
  chungbuk: "충북",
  jeonbuk: "전북",
  jeonnam: "전남",
  gyeongbuk: "경북",
  gyeongnam: "경남",
  gangwon: "강원",
  jeju: "제주",
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
