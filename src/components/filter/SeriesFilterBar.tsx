"use client";

import { useState, useMemo } from "react";

interface SeriesFilterBarProps {
  allSeries: string[];
  activeSeries: Set<string>;
  onToggle: (series: string) => void;
  onClear: () => void;
}

const COLLAPSED_COUNT = 8;

export default function SeriesFilterBar({
  allSeries,
  activeSeries,
  onToggle,
  onClear,
}: SeriesFilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [inlineSearch, setInlineSearch] = useState("");

  const filtered = useMemo(() => {
    if (!inlineSearch.trim()) return allSeries;
    const q = inlineSearch.trim().toLowerCase();
    return allSeries.filter((s) => s.toLowerCase().includes(q));
  }, [allSeries, inlineSearch]);

  if (allSeries.length === 0) return null;

  const showSearch = allSeries.length > COLLAPSED_COUNT;
  const visible = expanded ? filtered : filtered.slice(0, COLLAPSED_COUNT);
  const hasMore = filtered.length > COLLAPSED_COUNT;
  const hasActive = activeSeries.size > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          작품/시리즈
        </span>
        {showSearch && expanded && (
          <input
            type="text"
            value={inlineSearch}
            onChange={(e) => setInlineSearch(e.target.value)}
            placeholder="시리즈 검색..."
            className="text-xs border border-gray-200 rounded px-2 py-0.5 w-32 focus:outline-none focus:ring-1 focus:ring-pink-400"
          />
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 flex-wrap">
        {hasActive && (
          <button
            onClick={onClear}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        )}
        {visible.map((series) => {
          const active = activeSeries.has(series);
          return (
            <button
              key={series}
              onClick={() => onToggle(series)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                active
                  ? "bg-pink-500 text-white"
                  : "bg-pink-50 text-pink-700 hover:bg-pink-100"
              }`}
            >
              {series}
            </button>
          );
        })}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            +{filtered.length - COLLAPSED_COUNT}개 더보기
          </button>
        )}
        {expanded && hasMore && (
          <button
            onClick={() => {
              setExpanded(false);
              setInlineSearch("");
            }}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            접기
          </button>
        )}
      </div>
    </div>
  );
}
