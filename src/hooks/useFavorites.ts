"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "otaku-road-favorites";

function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {
    // corrupted data
  }
  return new Set();
}

function saveFavorites(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // storage full or unavailable
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const toggleFavorite = useCallback((storeId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
      }
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (storeId: string) => favorites.has(storeId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
