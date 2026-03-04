"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { useStoreFilter } from "@/hooks/useStoreFilter";
import { useHashRouter } from "@/hooks/useHashRouter";
import type { Store } from "@/types/store";
import type { MapAction } from "@/components/map/MapSection";
import Header from "@/components/Header";
import MapSection from "@/components/map/MapSection";
import GenreFilterBar from "@/components/filter/GenreFilterBar";
import SearchBar from "@/components/filter/SearchBar";
import StoreListPanel from "@/components/list/StoreListPanel";
import StoreDetail from "@/components/detail/StoreDetail";
import DesktopSidePanel from "@/components/layout/DesktopSidePanel";
import MobileBottomSheet from "@/components/layout/MobileBottomSheet";
import ReportModal from "@/components/report/ReportModal";
import ImportModal from "@/components/import/ImportModal";

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

  const { route, selectStore, clearRoute } = useHashRouter();

  const mapActionRef = useRef<MapAction | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [reportStore, setReportStore] = useState<Store | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Resolve selected store from hash route
  const selectedStore = useMemo(() => {
    if (route.type !== "store") return null;
    return stores.find((s) => s.id === route.storeId) ?? null;
  }, [route, stores]);

  // Pan map when store is selected
  useEffect(() => {
    if (selectedStore) {
      mapActionRef.current?.panToStore(selectedStore);
    }
  }, [selectedStore]);

  const handleStoreClick = useCallback(
    (store: Store) => {
      mapActionRef.current?.panToStore(store);
      selectStore(store.id);
      setListOpen(false);
    },
    [selectStore]
  );

  const handleBack = useCallback(() => {
    clearRoute();
  }, [clearRoute]);

  const handleReport = useCallback((store: Store) => {
    setReportStore(store);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // Side panel / bottom sheet content
  const panelContent = selectedStore ? (
    <StoreDetail
      store={selectedStore}
      onBack={handleBack}
      onReport={handleReport}
    />
  ) : (
    <>
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
    </>
  );

  return (
    <>
      <Header
        onImport={() => setShowImportModal(true)}
        onSuggest={() => setShowSuggestModal(true)}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop side panel */}
        <DesktopSidePanel>{panelContent}</DesktopSidePanel>

        {/* Main map area */}
        <div className="flex-1 flex flex-col relative">
          {/* Mobile top bar */}
          {!selectedStore ? (
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
          ) : (
            <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                목록으로
              </button>
            </div>
          )}

          {/* Map */}
          <MapSection
            stores={filteredStores}
            actionRef={mapActionRef}
            onMapClick={handleBack}
            className="flex-1"
          />
        </div>

        {/* Mobile bottom sheet */}
        <MobileBottomSheet
          open={listOpen || !!selectedStore}
          onClose={() => {
            setListOpen(false);
            if (selectedStore) clearRoute();
          }}
        >
          {selectedStore ? (
            <StoreDetail
              store={selectedStore}
              onBack={() => {
                clearRoute();
                setListOpen(false);
              }}
              onReport={handleReport}
            />
          ) : (
            <StoreListPanel
              groupedStores={groupedStores}
              totalCount={filteredStores.length}
              onStoreClick={handleStoreClick}
            />
          )}
        </MobileBottomSheet>
      </div>

      {/* Modals — overflow-hidden 밖에서 렌더링 */}
      {reportStore && (
        <ReportModal
          store={reportStore}
          onClose={() => setReportStore(null)}
        />
      )}
      {showSuggestModal && (
        <ReportModal onClose={() => setShowSuggestModal(false)} />
      )}
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </>
  );
}
