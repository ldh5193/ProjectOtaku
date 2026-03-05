"use client";

import { useEffect, useRef, useState, useCallback, type MutableRefObject, type RefObject } from "react";
import { useNaverMapLoaded } from "@/components/NaverMapProvider";
import { buildInfoWindowHTML } from "./InfoWindowContent";
import type { Store } from "@/types/store";
import { getPopupStatus } from "@/lib/popup-status";

declare global {
  // eslint-disable-next-line no-var
  var MarkerClustering: new (options: MarkerClusteringOptions) => MarkerClusteringInstance;
}

interface MarkerClusteringOptions {
  map: naver.maps.Map;
  markers: naver.maps.Marker[];
  disableClickZoom: boolean;
  minClusterSize: number;
  maxZoom: number;
  gridSize: number;
  icons: naver.maps.HtmlIcon[];
  indexGenerator: number[];
  stylingFunction: (clusterMarker: naver.maps.Marker, count: number) => void;
}

interface MarkerClusteringInstance {
  setMap: (map: naver.maps.Map | null) => void;
  getMap: () => naver.maps.Map | null;
  setMarkers: (markers: naver.maps.Marker[]) => void;
  getMarkers: () => naver.maps.Marker[];
  _redraw: () => void;
}

export interface MapAction {
  panToStore: (store: Store) => void;
}

interface MapSectionProps {
  stores: Store[];
  actionRef?: MutableRefObject<MapAction | null>;
  onMapClick?: () => void;
  className?: string;
  favorites?: Set<string>;
  onToggleFavorite?: (storeId: string) => void;
}

declare global {
  interface Window {
    __toggleFavorite?: (storeId: string) => void;
  }
}

function createPopupIcon(): naver.maps.HtmlIcon {
  return {
    content: `<div style="
      position:relative;width:28px;height:36px;
    ">
      <svg viewBox="0 0 24 32" width="28" height="36">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#8b5cf6" stroke="#fff" stroke-width="1.5"/>
        <text x="12" y="15" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="sans-serif">P</text>
      </svg>
    </div>`,
    size: new naver.maps.Size(28, 36),
    anchor: new naver.maps.Point(14, 36),
  };
}

function createFavoriteIcon(): naver.maps.HtmlIcon {
  return {
    content: `<div style="
      position:relative;width:28px;height:36px;
    ">
      <svg viewBox="0 0 24 32" width="28" height="36">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/>
        <path d="M12 7l1.5 3 3.3.5-2.4 2.3.6 3.2L12 14.3 8.9 16l.6-3.2-2.4-2.3 3.3-.5z" fill="#fff"/>
      </svg>
    </div>`,
    size: new naver.maps.Size(28, 36),
    anchor: new naver.maps.Point(14, 36),
  };
}

function createClusterIcons(): naver.maps.HtmlIcon[] {
  return [
    // Small cluster (2-9)
    {
      content: `<div style="
        display:flex;align-items:center;justify-content:center;
        width:36px;height:36px;border-radius:50%;
        background:rgba(59,130,246,0.85);color:#fff;
        font-size:13px;font-weight:700;
        border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        cursor:pointer;
      "><span></span></div>`,
      size: new naver.maps.Size(36, 36),
      anchor: new naver.maps.Point(18, 18),
    },
    // Medium cluster (10-49)
    {
      content: `<div style="
        display:flex;align-items:center;justify-content:center;
        width:44px;height:44px;border-radius:50%;
        background:rgba(245,158,11,0.85);color:#fff;
        font-size:14px;font-weight:700;
        border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        cursor:pointer;
      "><span></span></div>`,
      size: new naver.maps.Size(44, 44),
      anchor: new naver.maps.Point(22, 22),
    },
    // Large cluster (50-99)
    {
      content: `<div style="
        display:flex;align-items:center;justify-content:center;
        width:52px;height:52px;border-radius:50%;
        background:rgba(239,68,68,0.85);color:#fff;
        font-size:15px;font-weight:700;
        border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        cursor:pointer;
      "><span></span></div>`,
      size: new naver.maps.Size(52, 52),
      anchor: new naver.maps.Point(26, 26),
    },
    // Very large cluster (100+)
    {
      content: `<div style="
        display:flex;align-items:center;justify-content:center;
        width:60px;height:60px;border-radius:50%;
        background:rgba(139,92,246,0.85);color:#fff;
        font-size:16px;font-weight:700;
        border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        cursor:pointer;
      "><span></span></div>`,
      size: new naver.maps.Size(60, 60),
      anchor: new naver.maps.Point(30, 30),
    },
  ];
}

export default function MapSection({
  stores,
  actionRef,
  onMapClick,
  className,
  favorites,
  onToggleFavorite,
}: MapSectionProps) {
  const mapLoaded = useNaverMapLoaded();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markerMapRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const clusterRef = useRef<MarkerClusteringInstance | null>(null);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const activeStoreIdRef = useRef<string | null>(null);
  const activeMarkerRef = useRef<naver.maps.Marker | null>(null);
  const storesMapRef = useRef<Map<string, Store>>(new Map());
  const [mapError, setMapError] = useState(false);
  const onMapClickRef: RefObject<(() => void) | undefined> = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;
  const onToggleFavoriteRef = useRef(onToggleFavorite);
  onToggleFavoriteRef.current = onToggleFavorite;

  // Keep storesMap in sync
  useEffect(() => {
    const m = new Map<string, Store>();
    for (const s of stores) m.set(s.id, s);
    storesMapRef.current = m;
  }, [stores]);

  const openInfoWindow = useCallback(
    (store: Store, marker: naver.maps.Marker) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (!infoWindowRef.current) {
        infoWindowRef.current = new naver.maps.InfoWindow({
          maxWidth: 300,
          borderWidth: 0,
          borderColor: "transparent",
          backgroundColor: "white",
          anchorSize: new naver.maps.Size(12, 12),
          pixelOffset: new naver.maps.Point(0, -4),
        });
      }

      const isFav = favoritesRef.current?.has(store.id) ?? false;
      infoWindowRef.current.setContent(buildInfoWindowHTML(store, isFav));
      infoWindowRef.current.open(map, marker);
      activeStoreIdRef.current = store.id;
      activeMarkerRef.current = marker;
    },
    []
  );

  const handleMarkerClick = useCallback(
    (store: Store, marker: naver.maps.Marker) => {
      if (activeStoreIdRef.current === store.id) {
        infoWindowRef.current?.close();
        activeStoreIdRef.current = null;
        return;
      }
      openInfoWindow(store, marker);
    },
    [openInfoWindow]
  );

  // Expose panToStore action
  useEffect(() => {
    if (!actionRef) return;
    actionRef.current = {
      panToStore: (store: Store) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.setCenter(new naver.maps.LatLng(store.lat, store.lng));
        map.setZoom(15);

        // At zoom 15, markers should be unclustered (maxZoom=13).
        // Wait for idle event to ensure markers are rendered, then open info window.
        const waitForMarker = () => {
          const marker = markerMapRef.current.get(store.id);
          if (marker) {
            openInfoWindow(store, marker);
          }
        };
        // Small delay to allow clustering redraw after zoom change
        setTimeout(waitForMarker, 100);
      },
    };
  }, [actionRef, openInfoWindow]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current || mapError) return;

    try {
      const map = new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(37.5563, 126.9234),
        zoom: 13,
        zoomControl: true,
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      });

      naver.maps.Event.addListener(map, "click", () => {
        infoWindowRef.current?.close();
        activeStoreIdRef.current = null;
        onMapClickRef.current?.();
      });

      mapInstanceRef.current = map;
    } catch (e) {
      console.error("네이버맵 초기화 실패:", e);
      setMapError(true);
    }
  }, [mapLoaded, mapError]);

  // Marker + Clustering management
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;
    const currentIds = new Set(stores.map((s) => s.id));
    const existingIds = new Set(markerMapRef.current.keys());
    const hasClusteringSupport = typeof globalThis.MarkerClustering !== "undefined";

    // Remove markers that are no longer in the store list
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        const marker = markerMapRef.current.get(id)!;
        marker.setMap(null);
        markerMapRef.current.delete(id);
      }
    }

    // Close info window if active store was removed
    if (
      activeStoreIdRef.current &&
      !currentIds.has(activeStoreIdRef.current)
    ) {
      infoWindowRef.current?.close();
      activeStoreIdRef.current = null;
    }

    // Add markers for new stores (without map — clustering will manage visibility)
    const favIcon = createFavoriteIcon();
    const popupIcon = createPopupIcon();
    for (const store of stores) {
      if (existingIds.has(store.id)) continue;

      const isFav = favorites?.has(store.id) ?? false;
      const isPopup = getPopupStatus(store) !== "none";
      const icon = isFav ? favIcon : isPopup ? popupIcon : undefined;
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(store.lat, store.lng),
        map: hasClusteringSupport ? null : map,
        title: store.name,
        icon,
      });

      naver.maps.Event.addListener(marker, "click", () => {
        const currentStore = storesMapRef.current.get(store.id);
        if (currentStore) {
          handleMarkerClick(currentStore, marker);
        }
      });

      markerMapRef.current.set(store.id, marker);
    }

    // Update clustering
    if (hasClusteringSupport) {
      const allMarkers = Array.from(markerMapRef.current.values());

      if (clusterRef.current) {
        // Remove old clustering
        clusterRef.current.setMap(null);
      }

      clusterRef.current = new globalThis.MarkerClustering({
        map,
        markers: allMarkers,
        disableClickZoom: false,
        minClusterSize: 2,
        maxZoom: 13,
        gridSize: 120,
        icons: createClusterIcons(),
        indexGenerator: [10, 50, 100],
        stylingFunction: (clusterMarker: naver.maps.Marker, count: number) => {
          const el = clusterMarker.getElement();
          const span = el?.querySelector("span");
          if (span) span.textContent = String(count);
        },
      });
    }
  }, [mapLoaded, stores, handleMarkerClick]);

  // Register global favorite toggle callback for info window buttons
  useEffect(() => {
    window.__toggleFavorite = (storeId: string) => {
      onToggleFavoriteRef.current?.(storeId);
    };
    return () => {
      delete window.__toggleFavorite;
    };
  }, []);

  // Update marker icons and refresh info window when favorites change
  useEffect(() => {
    if (!mapLoaded) return;

    // Update all marker icons based on favorite/popup status
    const favIcon = createFavoriteIcon();
    const popupIcon = createPopupIcon();
    for (const [id, marker] of markerMapRef.current) {
      const isFav = favorites?.has(id) ?? false;
      const store = storesMapRef.current.get(id);
      const isPopup = store ? getPopupStatus(store) !== "none" : false;
      marker.setIcon(isFav ? favIcon : isPopup ? popupIcon : null);
    }

    // Refresh open info window
    const storeId = activeStoreIdRef.current;
    const marker = activeMarkerRef.current;
    const map = mapInstanceRef.current;
    if (!storeId || !marker || !map || !infoWindowRef.current) return;
    const store = storesMapRef.current.get(storeId);
    if (!store) return;
    const isFav = favorites?.has(storeId) ?? false;
    infoWindowRef.current.setContent(buildInfoWindowHTML(store, isFav));
    infoWindowRef.current.open(map, marker);
  }, [favorites, mapLoaded]);

  // Cleanup clustering on unmount
  useEffect(() => {
    return () => {
      if (clusterRef.current) {
        clusterRef.current.setMap(null);
      }
    };
  }, []);

  if (!mapLoaded || mapError) {
    return (
      <div
        className={`flex-1 flex flex-col items-center justify-center bg-gray-100 gap-2 ${className ?? ""}`}
      >
        {mapError ? (
          <>
            <p className="text-gray-600 font-medium">지도를 불러올 수 없습니다</p>
            <p className="text-xs text-gray-400">네이버맵 API 인증을 확인해주세요</p>
          </>
        ) : (
          <p className="text-gray-500">지도를 불러오는 중...</p>
        )}
      </div>
    );
  }

  return <div ref={mapRef} className={`flex-1 w-full ${className ?? ""}`} />;
}
