import type { Store } from "@/types/store";

export type PopupStatus = "upcoming" | "active" | "ended" | "none";

export function getPopupStatus(store: Store): PopupStatus {
  if (store.type !== "popup") return "none";
  if (!store.popupStartDate || !store.popupEndDate) return "active"; // no dates = assume active

  const today = new Date().toISOString().slice(0, 10);

  if (today < store.popupStartDate) return "upcoming";
  if (today > store.popupEndDate) return "ended";
  return "active";
}

export function formatPopupPeriod(store: Store): string {
  if (!store.popupStartDate || !store.popupEndDate) return "";
  return `${store.popupStartDate} ~ ${store.popupEndDate}`;
}

export const popupStatusConfig: Record<
  PopupStatus,
  { label: string; color: string; bgColor: string }
> = {
  upcoming: { label: "오픈 예정", color: "text-blue-700", bgColor: "bg-blue-50" },
  active: { label: "진행중", color: "text-green-700", bgColor: "bg-green-50" },
  ended: { label: "종료", color: "text-gray-500", bgColor: "bg-gray-100" },
  none: { label: "", color: "", bgColor: "" },
};
