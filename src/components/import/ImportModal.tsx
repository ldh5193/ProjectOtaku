"use client";

import { useState } from "react";
import type { Genre } from "@/types/store";
import { ALL_GENRES, genreLabels } from "@/types/store";

interface PlaceData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  originalUrl: string;
  naverPlaceId?: string;
  imageUrl?: string;
}

interface ImportModalProps {
  onClose: () => void;
}

export default function ImportModal({ onClose }: ImportModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceData | null>(null);

  // Submission state
  const [selectedGenres, setSelectedGenres] = useState<Set<Genre>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleResolve() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/naver-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlace(data.place);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!place) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/url-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          phone: place.phone,
          naverPlaceId: place.naverPlaceId,
          imageUrl: place.imageUrl,
          genres: Array.from(selectedGenres),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleGenre(g: Genre) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-base font-bold text-gray-900">
            네이버 지도 URL로 매장 추가
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Success */}
          {submitted ? (
            <div className="py-6 text-center">
              <p className="text-green-600 font-medium">
                매장이 추가되었습니다!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                페이지를 새로고침하면 지도에 표시됩니다.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                닫기
              </button>
            </div>
          ) : !place ? (
            /* URL input step */
            <>
              {/* 안내 문구 */}
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 space-y-1.5">
                <p className="font-medium">사용 방법</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600">
                  <li>네이버 지도 앱/웹에서 매장을 검색합니다</li>
                  <li>매장 상세 페이지에서 <span className="font-semibold">공유</span> 버튼을 누릅니다</li>
                  <li><span className="font-semibold">링크 복사</span>를 선택합니다</li>
                  <li>복사된 URL을 아래에 붙여넣으세요</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  네이버 지도 URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://naver.me/... 또는 https://map.naver.com/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleResolve()}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleResolve}
                disabled={loading || !url.trim()}
                className="w-full py-2.5 bg-[#03c75a] text-white rounded-lg text-sm font-medium hover:bg-[#02b350] disabled:opacity-50 transition-colors"
              >
                {loading ? "확인 중..." : "매장 정보 확인"}
              </button>
            </>
          ) : (
            /* Preview + genre selection step */
            <>
              {/* Preview card */}
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                {place.imageUrl && (
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-3 space-y-1">
                  <p className="font-medium text-gray-900">{place.name}</p>
                  <p className="text-sm text-gray-500">{place.address}</p>
                  {place.phone && (
                    <p className="text-sm text-gray-500">{place.phone}</p>
                  )}
                </div>
              </div>

              {/* Genre selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  장르 선택
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_GENRES.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                        selectedGenres.has(g)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {genreLabels[g]}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPlace(null);
                    setError(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  다시 입력
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedGenres.size === 0}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "저장 중..." : "매장 추가"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
