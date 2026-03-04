"use client";

import { useState, useCallback } from "react";

interface Position {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  loading: boolean;
  error: string | null;
  position: Position | null;
  requestPosition: () => Promise<Position>;
}

function getErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
    case error.POSITION_UNAVAILABLE:
      return "현재 위치를 확인할 수 없습니다.";
    case error.TIMEOUT:
      return "위치 확인 시간이 초과되었습니다. 다시 시도해주세요.";
    default:
      return "위치를 가져오는 중 오류가 발생했습니다.";
  }
}

export function useGeolocation(): UseGeolocationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const requestPosition = useCallback(async (): Promise<Position> => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const msg = "이 브라우저에서는 위치 서비스를 지원하지 않습니다.";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }

    // Permissions API로 사전 확인 (지원하는 브라우저만)
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        if (status.state === "denied") {
          const msg =
            "위치 권한이 차단되어 있습니다. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 위치 권한을 허용해주세요.";
          setError(msg);
          setLoading(false);
          throw new Error(msg);
        }
      } catch (e) {
        // Permissions API 실패 시 무시하고 getCurrentPosition으로 진행
        if (e instanceof Error && e.message.includes("위치 권한이 차단")) throw e;
      }
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
          const msg = getErrorMessage(err);
          setError(msg);
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

  return { loading, error, position, requestPosition };
}
