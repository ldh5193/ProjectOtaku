"use client";

import type { Store } from "@/types/store";
import { genreLabels } from "@/types/store";
import { buildNaverMapUrl } from "@/lib/report-urls";
import FreshnessBadge from "./FreshnessBadge";
import MiniMap from "./MiniMap";

interface StoreDetailProps {
  store: Store;
  onBack: () => void;
  onReport: (store: Store) => void;
}

export default function StoreDetail({ store, onBack, onReport }: StoreDetailProps) {
  const naverMapUrl = buildNaverMapUrl(store);

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

      <MiniMap lat={store.lat} lng={store.lng} name={store.name} />

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
                href={store.website}
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
