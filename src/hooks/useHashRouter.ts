"use client";

import { useState, useEffect, useCallback } from "react";

type HashRoute =
  | { type: "none" }
  | { type: "store"; storeId: string }
  | { type: "suggest" }
  | { type: "import" };

function parseHash(hash: string): HashRoute {
  if (!hash || hash === "#") return { type: "none" };
  const storeMatch = hash.match(/^#store\/(.+)$/);
  if (storeMatch) return { type: "store", storeId: storeMatch[1] };
  if (hash === "#suggest") return { type: "suggest" };
  if (hash === "#import") return { type: "import" };
  return { type: "none" };
}

function clearHash() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

export function useHashRouter() {
  const [route, setRoute] = useState<HashRoute>({ type: "none" });

  useEffect(() => {
    function handleHash() {
      setRoute(parseHash(window.location.hash));
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const selectStore = useCallback((storeId: string) => {
    window.location.hash = `#store/${storeId}`;
  }, []);

  const clearRoute = useCallback(() => {
    clearHash();
    setRoute({ type: "none" });
  }, []);

  return { route, selectStore, clearRoute };
}
