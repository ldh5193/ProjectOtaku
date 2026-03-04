export type FreshnessTier = "fresh" | "aging" | "stale" | "unknown";

export function getFreshness(lastVerified?: string): FreshnessTier {
  if (!lastVerified) return "unknown";
  const verified = new Date(lastVerified);
  const now = new Date();
  const diffMs = now.getTime() - verified.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);

  if (diffMonths < 3) return "fresh";
  if (diffMonths < 6) return "aging";
  return "stale";
}

export const freshnessConfig: Record<
  FreshnessTier,
  { color: string; bgColor: string; label: string; inlineColor: string }
> = {
  fresh: { color: "text-green-600", bgColor: "bg-green-100", label: "최근 확인", inlineColor: "#16a34a" },
  aging: { color: "text-yellow-600", bgColor: "bg-yellow-100", label: "확인 필요", inlineColor: "#ca8a04" },
  stale: { color: "text-red-500", bgColor: "bg-red-100", label: "오래된 정보", inlineColor: "#ef4444" },
  unknown: { color: "text-gray-400", bgColor: "bg-gray-100", label: "미확인", inlineColor: "#9ca3af" },
};

export function formatVerifiedDate(lastVerified?: string): string {
  if (!lastVerified) return "확인 날짜 없음";
  const d = new Date(lastVerified);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 확인`;
}
