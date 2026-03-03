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
  const [loaded, setLoaded] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  return (
    <NaverMapContext.Provider value={loaded}>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      {children}
    </NaverMapContext.Provider>
  );
}
