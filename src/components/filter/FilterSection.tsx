"use client";

import type { ReactNode } from "react";
import type { Genre } from "@/types/store";
import SearchBar from "./SearchBar";
import GenreFilterBar from "./GenreFilterBar";
import SeriesFilterBar from "./SeriesFilterBar";

interface FilterSectionProps {
  activeGenres: Set<Genre>;
  onToggleGenre: (genre: Genre) => void;
  onClearGenres: () => void;
  activeSeries: Set<string>;
  allSeries: string[];
  onToggleSeries: (series: string) => void;
  onClearSeries: () => void;
  onSearch: (query: string) => void;
  favoritesOnly?: boolean;
  onToggleFavoritesOnly?: () => void;
  hasFavorites?: boolean;
  compact?: boolean;
  listButton?: ReactNode;
}

export default function FilterSection({
  activeGenres,
  onToggleGenre,
  onClearGenres,
  activeSeries,
  allSeries,
  onToggleSeries,
  onClearSeries,
  onSearch,
  favoritesOnly = false,
  onToggleFavoritesOnly,
  hasFavorites = false,
  compact = false,
  listButton,
}: FilterSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <SearchBar onSearch={onSearch} />
        </div>
        {hasFavorites && onToggleFavoritesOnly && (
          <button
            onClick={onToggleFavoritesOnly}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
              favoritesOnly
                ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            aria-label="즐겨찾기만 보기"
          >
            <svg
              className={`w-3.5 h-3.5 ${favoritesOnly ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
              fill={favoritesOnly ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}
        {listButton}
      </div>
      <GenreFilterBar
        activeGenres={activeGenres}
        onToggle={onToggleGenre}
        onClear={onClearGenres}
      />
      {!compact && (
        <SeriesFilterBar
          allSeries={allSeries}
          activeSeries={activeSeries}
          onToggle={onToggleSeries}
          onClear={onClearSeries}
        />
      )}
    </div>
  );
}
