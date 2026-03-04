"use client";

import { useState } from "react";
import type { Store, Genre } from "@/types/store";
import { ALL_GENRES, genreLabels } from "@/types/store";

interface ReportModalProps {
  store?: Store;
  onClose: () => void;
}

const REPORT_TYPES = [
  "영업시간 변경",
  "전화번호 변경",
  "주소 변경",
  "폐업",
  "장르/카테고리 오류",
  "기타",
];

export default function ReportModal({ store, onClose }: ReportModalProps) {
  const isReport = !!store;
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Report fields
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [details, setDetails] = useState("");

  // Suggestion fields
  const [suggestedName, setSuggestedName] = useState("");
  const [suggestedAddress, setSuggestedAddress] = useState("");
  const [naverMapUrl, setNaverMapUrl] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<Set<Genre>>(new Set());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const body = isReport
        ? {
            type: "report" as const,
            storeId: store!.id,
            storeName: store!.name,
            reportType,
            details,
          }
        : {
            type: "suggestion" as const,
            suggestedName,
            suggestedAddress,
            naverMapUrl: naverMapUrl || undefined,
            genres: Array.from(selectedGenres).map((g) => genreLabels[g]),
            details,
          };

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "제보 전송에 실패했습니다");
      }
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
            {isReport ? "정보 수정 제보" : "매장 추가 제안"}
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

        {/* Success state */}
        {submitted ? (
          <div className="px-4 py-8 text-center">
            <p className="text-green-600 font-medium">제보가 접수되었습니다!</p>
            <p className="text-sm text-gray-500 mt-2">
              관리자 확인 후 반영됩니다.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
            {isReport ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">
                    매장: <strong>{store!.name}</strong> ({store!.id})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수정 유형
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    매장명
                  </label>
                  <input
                    type="text"
                    value={suggestedName}
                    onChange={(e) => setSuggestedName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    value={suggestedAddress}
                    onChange={(e) => setSuggestedAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    네이버 지도 URL (선택)
                  </label>
                  <input
                    type="url"
                    value={naverMapUrl}
                    onChange={(e) => setNaverMapUrl(e.target.value)}
                    placeholder="https://naver.me/..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    장르
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
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상세 내용
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="수정이 필요한 내용을 구체적으로 작성해 주세요"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "전송 중..." : "제보하기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
