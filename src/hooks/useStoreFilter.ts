"use client";

import { useState, useMemo, useCallback } from "react";
import type { Store, Genre } from "@/types/store";
import { getStoreArea, areaLabels } from "@/types/store";

export function useStoreFilter(allStores: Store[]) {
  const [activeGenres, setActiveGenres] = useState<Set<Genre>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredStores = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allStores.filter((store) => {
      // Genre filter: if any genres selected, store must match at least one
      if (activeGenres.size > 0) {
        const hasMatch = store.genre.some((g) => activeGenres.has(g));
        if (!hasMatch) return false;
      }

      // Search filter: query must match name or address
      if (query) {
        const inName = store.name.toLowerCase().includes(query);
        const inAddress = store.address.toLowerCase().includes(query);
        if (!inName && !inAddress) return false;
      }

      return true;
    });
  }, [allStores, activeGenres, searchQuery]);

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
    searchQuery,
    filteredStores,
    groupedStores,
    toggleGenre,
    clearGenres,
    setSearchQuery,
  };
}
