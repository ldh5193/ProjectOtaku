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
