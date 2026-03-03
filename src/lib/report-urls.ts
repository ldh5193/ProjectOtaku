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
