import type { Store } from "@/types/store";
import { genreLabels } from "@/types/store";
import { buildReportUrl } from "@/lib/report-urls";

export function buildInfoWindowHTML(store: Store): string {
  const tags = store.genre
    .map(
      (g) =>
        `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:9999px;background:#eef2ff;color:#4338ca;font-size:12px;">${genreLabels[g]}</span>`
    )
    .join("");

  const reportUrl = buildReportUrl(store);

  return `
    <div style="padding:12px;min-width:200px;max-width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111;">${store.name}</h3>
      <p style="margin:0 0 6px;font-size:13px;color:#555;">${store.address}</p>
      <div style="margin-bottom:6px;">${tags}</div>
      ${store.openingHours ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">🕐 ${store.openingHours}</p>` : ""}
      ${store.phone ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">📞 ${store.phone}</p>` : ""}
      ${store.description ? `<p style="margin:0 0 4px;font-size:12px;color:#888;">${store.description}</p>` : ""}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
        <a href="${reportUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#6366f1;text-decoration:none;">잘못된 정보 신고하기</a>
      </div>
    </div>
  `;
}
