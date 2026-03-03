"use client";

import { useRef, useState, useCallback } from "react";
import { useStoreFilter } from "@/hooks/useStoreFilter";
import type { Store } from "@/types/store";
import type { MapAction } from "@/components/map/MapSection";
import MapSection from "@/components/map/MapSection";
import GenreFilterBar from "@/components/filter/GenreFilterBar";
import SearchBar from "@/components/filter/SearchBar";
import StoreListPanel from "@/components/list/StoreListPanel";
import DesktopSidePanel from "@/components/layout/DesktopSidePanel";
import MobileBottomSheet from "@/components/layout/MobileBottomSheet";

interface HomeClientProps {
  stores: Store[];
}

export default function HomeClient({ stores }: HomeClientProps) {
  const {
    activeGenres,
    filteredStores,
    groupedStores,
    toggleGenre,
    clearGenres,
    setSearchQuery,
  } = useStoreFilter(stores);

  const mapActionRef = useRef<MapAction | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const handleStoreClick = useCallback(
    (store: Store) => {
      mapActionRef.current?.panToStore(store);
      setListOpen(false);
    },
    []
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Desktop side panel */}
      <DesktopSidePanel>
        <div className="p-3 space-y-2 border-b border-gray-200">
          <SearchBar onSearch={handleSearch} />
          <GenreFilterBar
            activeGenres={activeGenres}
            onToggle={toggleGenre}
            onClear={clearGenres}
          />
        </div>
        <StoreListPanel
          groupedStores={groupedStores}
          totalCount={filteredStores.length}
          onStoreClick={handleStoreClick}
        />
      </DesktopSidePanel>

      {/* Main map area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile filter bar */}
        <div className="md:hidden bg-white border-b border-gray-200 px-3 pt-2 pb-1 space-y-2">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <button
              onClick={() => setListOpen(true)}
              className="shrink-0 px-3 py-2 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              목록
            </button>
          </div>
          <GenreFilterBar
            activeGenres={activeGenres}
            onToggle={toggleGenre}
            onClear={clearGenres}
          />
        </div>

        {/* Map */}
        <MapSection
          stores={filteredStores}
          actionRef={mapActionRef}
          className="flex-1"
        />
      </div>

      {/* Mobile bottom sheet */}
      <MobileBottomSheet open={listOpen} onClose={() => setListOpen(false)}>
        <StoreListPanel
          groupedStores={groupedStores}
          totalCount={filteredStores.length}
          onStoreClick={handleStoreClick}
        />
      </MobileBottomSheet>
    </div>
  );
}
