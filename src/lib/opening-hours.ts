/**
 * 영업시간 데이터를 바탕으로 현재 영업 상태를 판단합니다.
 *
 * 우선순위:
 * 1. businessHours (구조화된 요일별 데이터) — 정확
 * 2. openingHours (문자열) — 파싱 기반 추정
 */

import type { DayHours } from "@/types/store";

export type BusinessStatus = "open" | "closing-soon" | "closed" | "unknown";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const CLOSING_SOON_MINUTES = 30;

function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

function parseTime(time: string): { h: number; m: number } | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return { h: parseInt(match[1]), m: parseInt(match[2]) };
}

/** 구조화된 businessHours에서 상태 판단 */
function getStatusFromStructured(hours: DayHours[]): BusinessStatus {
  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  const nowMin = toMinutes(now.getHours(), now.getMinutes());

  const today = hours.find((h) => h.day === dayName);
  if (!today || today.off) return "closed";

  const openTime = parseTime(today.open);
  const closeTime = parseTime(today.close);
  if (!openTime || !closeTime) return "unknown";

  const openMin = toMinutes(openTime.h, openTime.m);
  const closeMin = toMinutes(closeTime.h, closeTime.m);

  if (nowMin < openMin) return "closed";
  if (nowMin >= closeMin) return "closed";
  if (closeMin - nowMin <= CLOSING_SOON_MINUTES) return "closing-soon";
  return "open";
}

/** 문자열 openingHours에서 상태 추정 (기존 폴백) */
function getStatusFromString(text: string): BusinessStatus {
  const now = new Date();
  const dayIndex = now.getDay();
  const dayName = DAY_NAMES[dayIndex];
  const nowMin = toMinutes(now.getHours(), now.getMinutes());

  // 휴무 체크
  if (text.includes(`${dayName}요일 휴무`)) return "closed";
  const rangeMatch = text.match(/([일월화수목금토])~([일월화수목금토])/);
  if (rangeMatch) {
    const startIdx = DAY_NAMES.indexOf(rangeMatch[1]);
    const endIdx = DAY_NAMES.indexOf(rangeMatch[2]);
    if (startIdx >= 0 && endIdx >= 0) {
      const inRange =
        startIdx <= endIdx
          ? dayIndex >= startIdx && dayIndex <= endIdx
          : dayIndex >= startIdx || dayIndex <= endIdx;
      if (text.includes("휴무") && inRange) return "closed";
    }
  }

  // 평일/주말 구분
  const isWeekend = dayIndex === 0 || dayIndex === 6;
  let timeText = text;
  if (text.includes("평일") && text.includes("주말")) {
    const parts = text.split(",").map((p) => p.trim());
    for (const part of parts) {
      if (isWeekend && part.includes("주말")) { timeText = part; break; }
      if (!isWeekend && part.includes("평일")) { timeText = part; break; }
    }
  }

  const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})/);
  if (!timeMatch) return "unknown";

  const openMin = toMinutes(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
  const closeMin = toMinutes(parseInt(timeMatch[3]), parseInt(timeMatch[4]));

  if (nowMin < openMin) return "closed";
  if (nowMin >= closeMin) return "closed";
  if (closeMin - nowMin <= CLOSING_SOON_MINUTES) return "closing-soon";
  return "open";
}

export function getBusinessStatus(
  openingHours?: string,
  businessHours?: DayHours[]
): BusinessStatus {
  if (businessHours && businessHours.length > 0) {
    return getStatusFromStructured(businessHours);
  }
  if (openingHours) {
    return getStatusFromString(openingHours);
  }
  return "unknown";
}

export const statusConfig: Record<
  BusinessStatus,
  { label: string; color: string; bgColor: string }
> = {
  open: { label: "영업중", color: "text-green-700", bgColor: "bg-green-50" },
  "closing-soon": {
    label: "곧 마감",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  closed: { label: "영업종료", color: "text-red-600", bgColor: "bg-red-50" },
  unknown: { label: "", color: "", bgColor: "" },
};
