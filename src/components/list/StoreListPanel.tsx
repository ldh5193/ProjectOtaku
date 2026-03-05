"use client";

import type { Store } from "@/types/store";
import { genreLabels, areaLabels } from "@/types/store";
import FreshnessBadge from "@/components/detail/FreshnessBadge";

interface StoreListPanelProps {
  groupedStores: Map<string, Store[]>;
  totalCount: number;
  onStoreClick: (store: Store) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (storeId: string) => void;
}

export default function StoreListPanel({
  groupedStores,
  totalCount,
  onStoreClick,
  favorites,
  onToggleFavorite,
}: StoreListPanelProps) {
  if (totalCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
        <svg
          className="w-12 h-12 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-sm">검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {Array.from(groupedStores.entries()).map(([area, stores]) => (
        <div key={area}>
          <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200 z-10">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {areaLabels[area as keyof typeof areaLabels] ?? area} ({stores.length})
            </h3>
          </div>
          {stores.map((store) => {
            const isFav = favorites?.has(store.id);
            return (
              <div
                key={store.id}
                className="flex items-stretch border-b border-gray-100"
              >
                <button
                  onClick={() => onStoreClick(store)}
                  className="flex-1 text-left px-4 py-3 hover:bg-gray-50 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{store.name}</p>
                    <FreshnessBadge lastVerified={store.lastVerified} compact />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{store.address}</p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {store.genre.map((g) => (
                      <span
                        key={g}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-50 text-indigo-600"
                      >
                        {genreLabels[g]}
                      </span>
                    ))}
                    {store.series?.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-pink-50 text-pink-600"
                      >
                        {s}
                      </span>
                    ))}
                    {(store.series?.length ?? 0) > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500">
                        +{store.series!.length - 3}
                      </span>
                    )}
                  </div>
                </button>
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(store.id)}
                    className="shrink-0 px-3 flex items-center hover:bg-gray-50 transition-colors"
                    aria-label={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    <svg
                      className={`w-4 h-4 ${isFav ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      fill={isFav ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
