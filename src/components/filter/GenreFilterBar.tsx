"use client";

import type { Genre } from "@/types/store";
import { ALL_GENRES, genreLabels } from "@/types/store";

interface GenreFilterBarProps {
  activeGenres: Set<Genre>;
  onToggle: (genre: Genre) => void;
  onClear: () => void;
}

export default function GenreFilterBar({
  activeGenres,
  onToggle,
  onClear,
}: GenreFilterBarProps) {
  const hasActive = activeGenres.size > 0;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1">
      {hasActive && (
        <button
          onClick={onClear}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 transition-colors"
        >
          초기화
        </button>
      )}
      {ALL_GENRES.map((genre) => {
        const active = activeGenres.has(genre);
        return (
          <button
            key={genre}
            onClick={() => onToggle(genre)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              active
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {genreLabels[genre]}
          </button>
        );
      })}
    </div>
  );
}
