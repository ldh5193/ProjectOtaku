"use client";

import { useState } from "react";
import type { Review } from "@/types/store";

interface ReviewSectionProps {
  storeId: string;
  storeName: string;
  reviews: Review[];
}

export default function ReviewSection({ storeId, storeName, reviews }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeReviews = reviews.filter((r) => r.storeId === storeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "review",
          storeId,
          storeName,
          nickname: nickname.trim() || undefined,
          details: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "리뷰 전송에 실패했습니다");
      }
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          한줄 리뷰 {storeReviews.length > 0 && `(${storeReviews.length})`}
        </h3>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-indigo-600 font-medium hover:text-indigo-700"
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* 리뷰 작성 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 bg-gray-50 rounded-lg p-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택, 최대 20자)"
            maxLength={20}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 200))}
              placeholder="매장에 대한 팁이나 한줄평을 남겨주세요"
              rows={2}
              required
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm resize-none"
            />
            <span className="absolute bottom-2 right-2 text-[10px] text-gray-400">
              {content.length}/200
            </span>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "전송 중..." : "등록"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 제출 완료 메시지 */}
      {submitted && (
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm text-green-700 font-medium">리뷰가 접수되었습니다!</p>
          <p className="text-xs text-green-600 mt-0.5">관리자 확인 후 반영됩니다.</p>
        </div>
      )}

      {/* 리뷰 목록 */}
      {storeReviews.length > 0 ? (
        <div className="space-y-2">
          {storeReviews.map((review) => (
            <div key={review.issueNumber} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-800">{review.content}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-gray-500 font-medium">{review.nickname}</span>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : !submitted && !showForm ? (
        <p className="text-xs text-gray-400">아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요!</p>
      ) : null}
    </div>
  );
}
