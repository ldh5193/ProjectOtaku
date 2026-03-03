"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNaverMapLoaded } from "@/components/NaverMapProvider";
import { buildInfoWindowHTML } from "./InfoWindowContent";
import type { Store } from "@/types/store";

interface MapSectionProps {
  stores: Store[];
}

export default function MapSection({ stores }: MapSectionProps) {
  const mapLoaded = useNaverMapLoaded();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const handleMarkerClick = useCallback(
    (store: Store, marker: naver.maps.Marker) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (activeStoreId === store.id) {
        infoWindowRef.current?.close();
        setActiveStoreId(null);
        return;
      }

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
      setActiveStoreId(store.id);
    },
    [activeStoreId]
  );

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

  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clean up previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;

    stores.forEach((store) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(store.lat, store.lng),
        map,
        title: store.name,
      });

      naver.maps.Event.addListener(marker, "click", () => {
        handleMarkerClick(store, marker);
      });

      markersRef.current.push(marker);
    });
  }, [mapLoaded, stores, handleMarkerClick]);

  if (!mapLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">지도를 불러오는 중...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="flex-1 w-full" />;
}
