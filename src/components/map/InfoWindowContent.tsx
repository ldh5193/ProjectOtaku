import type { Store } from "@/types/store";
import { genreLabels } from "@/types/store";
import { buildNaverMapUrl } from "@/lib/report-urls";
import { getFreshness, freshnessConfig, formatVerifiedDate } from "@/lib/freshness";
import { escapeHtml } from "@/lib/sanitize";

export function buildInfoWindowHTML(store: Store): string {
  const tags = store.genre
    .map(
      (g) =>
        `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:9999px;background:#eef2ff;color:#4338ca;font-size:12px;">${genreLabels[g]}</span>`
    )
    .join("");

  const naverMapUrl = buildNaverMapUrl(store);
  const tier = getFreshness(store.lastVerified);
  const fc = freshnessConfig[tier];

  return `
    <div style="padding:12px;min-width:200px;max-width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111;">${escapeHtml(store.name)}</h3>
      <p style="margin:0 0 6px;font-size:13px;color:#555;">${escapeHtml(store.address)}</p>
      <div style="margin-bottom:6px;">${tags}</div>
      ${store.openingHours ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">🕐 ${escapeHtml(store.openingHours)}</p>` : ""}
      ${store.phone ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">📞 ${escapeHtml(store.phone)}</p>` : ""}
      ${store.description ? `<p style="margin:0 0 4px;font-size:12px;color:#888;">${escapeHtml(store.description)}</p>` : ""}
      <p style="margin:0 0 4px;font-size:11px;color:${fc.inlineColor};">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${fc.inlineColor};margin-right:4px;vertical-align:middle;"></span>
        ${formatVerifiedDate(store.lastVerified)}
      </p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
        <a href="${naverMapUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#03c75a;text-decoration:none;font-weight:500;">네이버 지도에서 보기</a>
        <a href="#store/${store.id}" style="font-size:12px;color:#4338ca;text-decoration:none;font-weight:500;">자세히 보기 &rarr;</a>
      </div>
    </div>
  `;
}
