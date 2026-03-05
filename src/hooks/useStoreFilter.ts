"use client";

import { useState, useMemo, useCallback } from "react";
import type { Store, Genre } from "@/types/store";
import { getStoreArea, areaLabels } from "@/types/store";

export function useStoreFilter(allStores: Store[], favorites?: Set<string>) {
  const [activeGenres, setActiveGenres] = useState<Set<Genre>>(new Set());
  const [activeSeries, setActiveSeries] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const toggleGenre = useCallback((genre: Genre) => {
    setActiveGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) {
        next.delete(genre);
      } else {
        next.add(genre);
      }
      return next;
    });
  }, []);

  const clearGenres = useCallback(() => {
    setActiveGenres(new Set());
  }, []);

  const toggleSeries = useCallback((series: string) => {
    setActiveSeries((prev) => {
      const next = new Set(prev);
      if (next.has(series)) {
        next.delete(series);
      } else {
        next.add(series);
      }
      return next;
    });
  }, []);

  const clearSeries = useCallback(() => {
    setActiveSeries(new Set());
  }, []);

  // Derive all unique series sorted by frequency
  const allSeries = useMemo(() => {
    const freq = new Map<string, number>();
    for (const store of allStores) {
      if (store.series) {
        for (const s of store.series) {
          freq.set(s, (freq.get(s) ?? 0) + 1);
        }
      }
    }
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [allStores]);

  const toggleFavoritesOnly = useCallback(() => {
    setFavoritesOnly((prev) => !prev);
  }, []);

  const filteredStores = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allStores.filter((store) => {
      // Favorites filter
      if (favoritesOnly && favorites && !favorites.has(store.id)) {
        return false;
      }

      // Genre filter: if any genres selected, store must match at least one (OR)
      if (activeGenres.size > 0) {
        const hasMatch = store.genre.some((g) => activeGenres.has(g));
        if (!hasMatch) return false;
      }

      // Series filter: if any series selected, store must match at least one (OR)
      if (activeSeries.size > 0) {
        const hasMatch = store.series?.some((s) => activeSeries.has(s));
        if (!hasMatch) return false;
      }

      // Search filter: query must match name, address, or series
      if (query) {
        const inName = store.name.toLowerCase().includes(query);
        const inAddress = store.address.toLowerCase().includes(query);
        const inSeries = store.series?.some((s) =>
          s.toLowerCase().includes(query)
        );
        if (!inName && !inAddress && !inSeries) return false;
      }

      return true;
    });
  }, [allStores, activeGenres, activeSeries, searchQuery, favoritesOnly, favorites]);

  const groupedStores = useMemo(() => {
    const groups = new Map<string, Store[]>();
    const areaOrder = Object.keys(areaLabels);

    for (const store of filteredStores) {
      const area = getStoreArea(store);
      if (!groups.has(area)) {
        groups.set(area, []);
      }
      groups.get(area)!.push(store);
    }

    // Sort by area order
    const sorted = new Map<string, Store[]>();
    for (const area of areaOrder) {
      if (groups.has(area)) {
        sorted.set(area, groups.get(area)!);
      }
    }
    return sorted;
  }, [filteredStores]);

  return {
    activeGenres,
    activeSeries,
    allSeries,
    searchQuery,
    filteredStores,
    groupedStores,
    toggleGenre,
    clearGenres,
    toggleSeries,
    clearSeries,
    setSearchQuery,
    favoritesOnly,
    toggleFavoritesOnly,
  };
}
