"use client";

import type { Store } from "@/types/store";
import { genreLabels, areaLabels } from "@/types/store";

interface StoreListPanelProps {
  groupedStores: Map<string, Store[]>;
  totalCount: number;
  onStoreClick: (store: Store) => void;
}

export default function StoreListPanel({
  groupedStores,
  totalCount,
  onStoreClick,
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
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => onStoreClick(store)}
              className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{store.name}</p>
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
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
