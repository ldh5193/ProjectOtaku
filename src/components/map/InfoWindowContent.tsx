import type { Store } from "@/types/store";
import { genreLabels } from "@/types/store";
import { buildNaverMapUrl, buildDirectionsWebUrl } from "@/lib/report-urls";
import { getFreshness, freshnessConfig, formatVerifiedDate } from "@/lib/freshness";
import { getBusinessStatus } from "@/lib/opening-hours";
import { getPopupStatus, popupStatusConfig, formatPopupPeriod } from "@/lib/popup-status";
import { escapeHtml } from "@/lib/sanitize";

export function buildInfoWindowHTML(store: Store, isFavorite = false): string {
  const genreTags = store.genre
    .map(
      (g) =>
        `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:9999px;background:#eef2ff;color:#4338ca;font-size:12px;">${genreLabels[g]}</span>`
    )
    .join("");

  const seriesTags = (store.series ?? [])
    .slice(0, 2)
    .map(
      (s) =>
        `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:9999px;background:#fdf2f8;color:#db2777;font-size:12px;">${escapeHtml(s)}</span>`
    )
    .join("");

  const tags = genreTags + seriesTags;

  const naverMapUrl = buildNaverMapUrl(store);
  const directionsUrl = buildDirectionsWebUrl(store);
  const tier = getFreshness(store.lastVerified);
  const fc = freshnessConfig[tier];

  const favFill = isFavorite ? "#facc15" : "none";
  const favStroke = isFavorite ? "#facc15" : "#9ca3af";

  const popup = getPopupStatus(store);
  const popupBadge = popup !== "none"
    ? (() => {
        const colors = { upcoming: "#1d4ed8;background:#eff6ff", active: "#15803d;background:#f0fdf4", ended: "#6b7280;background:#f3f4f6" };
        const cfg = popupStatusConfig[popup];
        return `<span style="margin-left:6px;padding:1px 6px;border-radius:4px;color:${colors[popup].split(";")[0]};${colors[popup].split(";")[1]};font-size:11px;font-weight:500;">${cfg.label}</span>`;
      })()
    : "";
  const popupPeriod = store.type === "popup" && formatPopupPeriod(store)
    ? `<p style="margin:0 0 4px;font-size:11px;color:#9ca3af;">${formatPopupPeriod(store)}</p>`
    : "";

  return `
    <div style="padding:12px;min-width:200px;max-width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111;flex:1;">${escapeHtml(store.name)}${popupBadge}</h3>
        <button onclick="window.__toggleFavorite && window.__toggleFavorite('${store.id}')" style="background:none;border:none;cursor:pointer;padding:2px;flex-shrink:0;" aria-label="즐겨찾기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${favFill}" stroke="${favStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </button>
      </div>
      <p style="margin:0 0 6px;font-size:13px;color:#555;">${escapeHtml(store.address)}</p>
      ${popupPeriod}
      <div style="margin-bottom:6px;">${tags}</div>
      ${store.openingHours ? (() => {
        const biz = getBusinessStatus(store.openingHours, store.businessHours);
        const bizBadge = biz === "open"
          ? `<span style="margin-left:6px;padding:1px 6px;border-radius:4px;background:#f0fdf4;color:#15803d;font-size:11px;font-weight:500;">영업중</span>`
          : biz === "closing-soon"
          ? `<span style="margin-left:6px;padding:1px 6px;border-radius:4px;background:#fffbeb;color:#b45309;font-size:11px;font-weight:500;">곧 마감</span>`
          : biz === "closed"
          ? `<span style="margin-left:6px;padding:1px 6px;border-radius:4px;background:#fef2f2;color:#dc2626;font-size:11px;font-weight:500;">영업종료</span>`
          : "";
        return `<p style="margin:0 0 4px;font-size:12px;color:#666;">🕐 ${escapeHtml(store.openingHours)}${bizBadge}</p>`;
      })() : ""}
      ${store.phone ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">📞 ${escapeHtml(store.phone)}</p>` : ""}
      ${store.description ? `<p style="margin:0 0 4px;font-size:12px;color:#888;">${escapeHtml(store.description)}</p>` : ""}
      <p style="margin:0 0 4px;font-size:11px;color:${fc.inlineColor};">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${fc.inlineColor};margin-right:4px;vertical-align:middle;"></span>
        ${formatVerifiedDate(store.lastVerified)}
      </p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#4338ca;text-decoration:none;font-weight:500;">길찾기</a>
        <span style="color:#d1d5db;">|</span>
        <a href="${naverMapUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#03c75a;text-decoration:none;font-weight:500;">네이버 지도</a>
        <span style="color:#d1d5db;">|</span>
        <a href="#store/${store.id}" style="font-size:12px;color:#4338ca;text-decoration:none;font-weight:500;">자세히 &rarr;</a>
      </div>
    </div>
  `;
}
