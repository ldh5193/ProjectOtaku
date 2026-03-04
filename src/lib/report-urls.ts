import type { Store } from "@/types/store";

const REPO = "ldh5193/ProjectOtaku";
const BASE = `https://github.com/${REPO}/issues/new`;

export function buildReportUrl(store: Store): string {
  const params = new URLSearchParams({
    template: "store-report.yml",
    title: `[정보 수정] ${store.name}`,
    "store-id": store.id,
    "store-name": store.name,
  });
  return `${BASE}?${params.toString()}`;
}

export function buildSuggestUrl(): string {
  const params = new URLSearchParams({
    template: "store-suggestion.yml",
  });
  return `${BASE}?${params.toString()}`;
}

export function buildNaverMapUrl(store: Store): string {
  if (store.naverPlaceId) {
    return `https://m.place.naver.com/place/${store.naverPlaceId}/home`;
  }
  const query = encodeURIComponent(store.name);
  return `https://map.naver.com/v5/search/${query}?c=${store.lng},${store.lat},15,0,0,0,dh`;
}

export function buildDirectionsAppUrl(
  store: Store,
  userLat: number,
  userLng: number,
): string {
  const params = new URLSearchParams({
    slat: String(userLat),
    slng: String(userLng),
    sname: "내 위치",
    dlat: String(store.lat),
    dlng: String(store.lng),
    dname: store.name,
    appname: "com.otakuroad.web",
  });
  return `nmap://route/public?${params.toString()}`;
}

export function buildDirectionsWebUrl(
  store: Store,
  userLat: number,
  userLng: number,
): string {
  const sname = encodeURIComponent("내 위치");
  const dname = encodeURIComponent(store.name);
  return `https://map.naver.com/v5/directions/${userLng},${userLat},${sname}/${store.lng},${store.lat},${dname}/-/transit`;
}
