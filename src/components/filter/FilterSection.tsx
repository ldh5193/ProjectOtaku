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
  compact = false,
  listButton,
}: FilterSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <SearchBar onSearch={onSearch} />
        </div>
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
