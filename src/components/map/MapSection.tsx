"use client";

import { useEffect, useRef, useCallback, type MutableRefObject } from "react";
import { useNaverMapLoaded } from "@/components/NaverMapProvider";
import { buildInfoWindowHTML } from "./InfoWindowContent";
import type { Store } from "@/types/store";

export interface MapAction {
  panToStore: (store: Store) => void;
}

interface MapSectionProps {
  stores: Store[];
  actionRef?: MutableRefObject<MapAction | null>;
  className?: string;
}

export default function MapSection({
  stores,
  actionRef,
  className,
}: MapSectionProps) {
  const mapLoaded = useNaverMapLoaded();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markerMapRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const activeStoreIdRef = useRef<string | null>(null);
  const storesMapRef = useRef<Map<string, Store>>(new Map());

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

      infoWindowRef.current.setContent(buildInfoWindowHTML(store));
      infoWindowRef.current.open(map, marker);
      activeStoreIdRef.current = store.id;
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
        const marker = markerMapRef.current.get(store.id);
        if (!map || !marker) return;

        map.setCenter(new naver.maps.LatLng(store.lat, store.lng));
        map.setZoom(15);
        openInfoWindow(store, marker);
      },
    };
  }, [actionRef, openInfoWindow]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(37.5563, 126.9234),
      zoom: 13,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    });

    mapInstanceRef.current = map;
  }, [mapLoaded]);

  // Diff-based marker management
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;
    const currentIds = new Set(stores.map((s) => s.id));
    const existingIds = new Set(markerMapRef.current.keys());

    // Remove markers that are no longer in the store list
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        markerMapRef.current.get(id)!.setMap(null);
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

    // Add markers for new stores
    for (const store of stores) {
      if (existingIds.has(store.id)) continue;

      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(store.lat, store.lng),
        map,
        title: store.name,
      });

      naver.maps.Event.addListener(marker, "click", () => {
        const currentStore = storesMapRef.current.get(store.id);
        if (currentStore) {
          handleMarkerClick(currentStore, marker);
        }
      });

      markerMapRef.current.set(store.id, marker);
    }
  }, [mapLoaded, stores, handleMarkerClick]);

  if (!mapLoaded) {
    return (
      <div
        className={`flex-1 flex items-center justify-center bg-gray-100 ${className ?? ""}`}
      >
        <p className="text-gray-500">지도를 불러오는 중...</p>
      </div>
    );
  }

  return <div ref={mapRef} className={`flex-1 w-full ${className ?? ""}`} />;
}
