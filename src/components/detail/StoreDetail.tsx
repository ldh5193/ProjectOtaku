"use client";

import { useState } from "react";
import type { Store } from "@/types/store";
import { genreLabels } from "@/types/store";
import { buildNaverMapUrl, buildDirectionsAppUrl, buildDirectionsWebUrl } from "@/lib/report-urls";
import { sanitizeUrl } from "@/lib/sanitize";
import FreshnessBadge from "./FreshnessBadge";
import MiniMap from "./MiniMap";

interface StoreDetailProps {
  store: Store;
  onBack: () => void;
  onReport: (store: Store) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (storeId: string) => void;
}

export default function StoreDetail({ store, onBack, onReport, isFavorite, onToggleFavorite }: StoreDetailProps) {
  const naverMapUrl = buildNaverMapUrl(store);
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = store.thumbnailUrls && store.thumbnailUrls.length > 0 && !imgError;

  const directionsUrl = buildDirectionsWebUrl(store);
  const directionsAppUrl = buildDirectionsAppUrl(store);
  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|Android/i.test(navigator.userAgent);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(store.id)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            <svg
              className={`w-5 h-5 ${isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}
      </div>

      {hasThumbnail ? (
        <a href={naverMapUrl} target="_blank" rel="noopener noreferrer" className="block relative">
          <img
            src={store.thumbnailUrls![0]}
            alt={store.name}
            className="w-full h-48 object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
            <span className="text-white text-xs font-medium">네이버 지도에서 보기</span>
          </div>
        </a>
      ) : store.naverPlaceId ? (
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gray-100 h-32 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-[#03c75a]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.273 12.845 7.376 24H0l8.852-11.076L1.224 0h7.205L13.899 8.41 21.932 0H24l-7.727 9.664L24 24h-7.2l-4.527-7.155z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">네이버 지도에서 보기</span>
        </a>
      ) : (
        <MiniMap lat={store.lat} lng={store.lng} name={store.name} />
      )}

      <div className="px-4 py-4 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{store.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{store.address}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {store.genre.map((g) => (
            <span
              key={g}
              className="px-2.5 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600 font-medium"
            >
              {genreLabels[g]}
            </span>
          ))}
          {store.series?.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 text-xs rounded-full bg-pink-50 text-pink-600 font-medium"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="space-y-2 text-sm">
          {store.openingHours && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 shrink-0 w-14">영업시간</span>
              <span className="text-gray-700">{store.openingHours}</span>
            </div>
          )}
          {store.phone && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 shrink-0 w-14">전화</span>
              <a href={`tel:${store.phone}`} className="text-indigo-600">
                {store.phone}
              </a>
            </div>
          )}
          {store.website && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 shrink-0 w-14">웹사이트</span>
              <a
                href={sanitizeUrl(store.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 truncate"
              >
                {store.website}
              </a>
            </div>
          )}
          {store.description && (
            <p className="text-gray-600 pt-1">{store.description}</p>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <FreshnessBadge lastVerified={store.lastVerified} />
        </div>

        <div className="space-y-2 pt-2">
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 bg-[#03c75a] text-white rounded-lg text-sm font-medium hover:bg-[#02b350] transition-colors"
          >
            네이버 지도에서 보기
          </a>
          <a
            href={isMobile ? directionsAppUrl : directionsUrl}
            onClick={isMobile ? (e) => {
              e.preventDefault();
              window.location.href = directionsAppUrl;
              setTimeout(() => {
                window.open(directionsUrl, "_blank");
              }, 1500);
            } : undefined}
            target={isMobile ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            네이버 지도로 길찾기
          </a>
          <button
            onClick={() => onReport(store)}
            className="block w-full text-center py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            정보 수정 제보
          </button>
        </div>
      </div>
    </div>
  );
}
