"use client";

import { useState, useCallback } from "react";

interface Position {
  lat: number;
  lng: number;
}

export type GeoErrorType = "denied" | "unavailable" | "timeout" | "unsupported" | null;

interface UseGeolocationReturn {
  loading: boolean;
  error: string | null;
  errorType: GeoErrorType;
  position: Position | null;
  requestPosition: () => Promise<Position>;
}

function getErrorInfo(error: GeolocationPositionError): { msg: string; type: GeoErrorType } {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        msg: "위치 권한이 거부되었습니다.",
        type: "denied",
      };
    case error.POSITION_UNAVAILABLE:
      return { msg: "현재 위치를 확인할 수 없습니다.", type: "unavailable" };
    case error.TIMEOUT:
      return { msg: "위치 확인 시간이 초과되었습니다. 다시 시도해주세요.", type: "timeout" };
    default:
      return { msg: "위치를 가져오는 중 오류가 발생했습니다.", type: null };
  }
}

export function useGeolocation(): UseGeolocationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<GeoErrorType>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const requestPosition = useCallback((): Promise<Position> => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    if (!navigator.geolocation) {
      const msg = "이 브라우저에서는 위치 서비스를 지원하지 않습니다.";
      setError(msg);
      setErrorType("unsupported");
      setLoading(false);
      throw new Error(msg);
    }

    return new Promise<Position>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(result);
          setLoading(false);
          resolve(result);
        },
        (err) => {
          const { msg, type } = getErrorInfo(err);
          setError(msg);
          setErrorType(type);
          setLoading(false);
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }, []);

  return { loading, error, errorType, position, requestPosition };
}
