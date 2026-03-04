"use client";

import { useRef, useEffect } from "react";
import { useNaverMapLoaded } from "@/components/NaverMapProvider";

interface MiniMapProps {
  lat: number;
  lng: number;
  name: string;
}

export default function MiniMap({ lat, lng, name }: MiniMapProps) {
  const mapLoaded = useNaverMapLoaded();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);

  useEffect(() => {
    if (!mapLoaded || !containerRef.current) return;

    // Clean up previous instance
    if (mapRef.current) {
      mapRef.current = null;
      containerRef.current.innerHTML = "";
    }

    const map = new naver.maps.Map(containerRef.current, {
      center: new naver.maps.LatLng(lat, lng),
      zoom: 16,
      draggable: false,
      scrollWheel: false,
      keyboardShortcuts: false,
      disableDoubleTapZoom: true,
      disableDoubleClickZoom: true,
      disableTwoFingerTapZoom: true,
      zoomControl: false,
    });

    new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map,
      title: name,
    });

    mapRef.current = map;
  }, [mapLoaded, lat, lng, name]);

  return (
    <div
      ref={containerRef}
      className="w-full h-40 bg-gray-100"
      style={{ minHeight: 160 }}
    />
  );
}
