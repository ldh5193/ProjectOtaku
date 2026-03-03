import type { Store } from "@/types/store";
import { genreLabels } from "@/types/store";
import { buildReportUrl, buildNaverMapUrl } from "@/lib/report-urls";

export function buildInfoWindowHTML(store: Store): string {
  const tags = store.genre
    .map(
      (g) =>
        `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:9999px;background:#eef2ff;color:#4338ca;font-size:12px;">${genreLabels[g]}</span>`
    )
    .join("");

  const reportUrl = buildReportUrl(store);
  const naverMapUrl = buildNaverMapUrl(store);

  return `
    <div style="padding:12px;min-width:200px;max-width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111;">${store.name}</h3>
      <p style="margin:0 0 6px;font-size:13px;color:#555;">${store.address}</p>
      <div style="margin-bottom:6px;">${tags}</div>
      ${store.openingHours ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">🕐 ${store.openingHours}</p>` : ""}
      ${store.phone ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">📞 ${store.phone}</p>` : ""}
      ${store.description ? `<p style="margin:0 0 4px;font-size:12px;color:#888;">${store.description}</p>` : ""}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
        <a href="${naverMapUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#03c75a;text-decoration:none;font-weight:500;">네이버 지도에서 보기</a>
        <a href="${reportUrl}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#9ca3af;text-decoration:none;">정보 수정 제보</a>
      </div>
    </div>
  `;
}
