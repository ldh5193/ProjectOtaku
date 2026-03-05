"use client";

import Script from "next/script";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

const NaverMapContext = createContext<boolean>(false);

export function useNaverMapLoaded() {
  return useContext(NaverMapContext);
}

export default function NaverMapProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  return (
    <NaverMapContext.Provider value={loaded}>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof naver !== "undefined" && naver.maps) {
            setSdkLoaded(true);
          } else {
            console.error("네이버맵 SDK 로드 실패: naver.maps 객체 없음");
          }
        }}
        onError={() => {
          console.error("네이버맵 SDK 스크립트 로드 실패");
        }}
      />
      {sdkLoaded && (
        <Script
          src="/lib/MarkerClustering.js"
          strategy="afterInteractive"
          onLoad={() => setLoaded(true)}
          onError={() => {
            console.error("MarkerClustering 스크립트 로드 실패");
            // Fallback: still mark as loaded so map works without clustering
            setLoaded(true);
          }}
        />
      )}
      {children}
    </NaverMapContext.Provider>
  );
}
