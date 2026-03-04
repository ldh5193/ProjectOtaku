"use client";

import { useState, useCallback } from "react";
import type { Store } from "@/types/store";
import { genreLabels } from "@/types/store";
import { buildNaverMapUrl, buildDirectionsAppUrl, buildDirectionsWebUrl } from "@/lib/report-urls";
import { sanitizeUrl } from "@/lib/sanitize";
import { useGeolocation } from "@/hooks/useGeolocation";
import FreshnessBadge from "./FreshnessBadge";
import MiniMap from "./MiniMap";

interface StoreDetailProps {
  store: Store;
  onBack: () => void;
  onReport: (store: Store) => void;
}

export default function StoreDetail({ store, onBack, onReport }: StoreDetailProps) {
  const naverMapUrl = buildNaverMapUrl(store);
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = store.thumbnailUrls && store.thumbnailUrls.length > 0 && !imgError;
  const { loading: geoLoading, error: geoError, requestPosition } = useGeolocation();

  const handleDirections = useCallback(async () => {
    try {
      const pos = await requestPosition();
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

      if (isMobile) {
        const appUrl = buildDirectionsAppUrl(store, pos.lat, pos.lng);
        const webUrl = buildDirectionsWebUrl(store, pos.lat, pos.lng);

        let appOpened = false;
        const onVisibilityChange = () => {
          if (document.hidden) appOpened = true;
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        window.location.href = appUrl;

        setTimeout(() => {
          document.removeEventListener("visibilitychange", onVisibilityChange);
          if (!appOpened) {
            window.open(webUrl, "_blank");
          }
        }, 1500);
      } else {
        const webUrl = buildDirectionsWebUrl(store, pos.lat, pos.lng);
        window.open(webUrl, "_blank");
      }
    } catch {
      // error is already set in useGeolocation state
    }
  }, [store, requestPosition]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>
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
          <button
            onClick={handleDirections}
            disabled={geoLoading}
            className="block w-full text-center py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-60 transition-colors"
          >
            {geoLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                위치 확인 중...
              </span>
            ) : (
              "길찾기"
            )}
          </button>
          {geoError && (
            <p className="text-xs text-red-500 text-center">{geoError}</p>
          )}
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
