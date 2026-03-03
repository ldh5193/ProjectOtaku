import type { Store } from "../../src/types/store";

function normalize(text: string): string {
  return text
    .replace(/\s+/g, "")
    .replace(/서울특별시/g, "서울")
    .replace(/[()-]/g, "")
    .toLowerCase();
}

function isDuplicate(existing: Store, candidate: { name: string; address: string }): boolean {
  const nameMatch = normalize(existing.name) === normalize(candidate.name);
  const addrMatch = normalize(existing.address) === normalize(candidate.address);

  // Exact name+address match
  if (nameMatch && addrMatch) return true;

  // Same name with very similar address (only differ in minor details)
  if (nameMatch && normalize(existing.address).includes(normalize(candidate.address).slice(0, 10))) {
    return true;
  }

  return false;
}

export interface CandidateStore {
  name: string;
  address: string;
  lat: number;
  lng: number;
  genre: string[];
  phone?: string;
  kakaoPlaceId: string;
}

export function mergeStores(
  existing: Store[],
  candidates: CandidateStore[]
): { merged: Store[]; newCount: number; candidates: CandidateStore[] } {
  const newCandidates: CandidateStore[] = [];

  // Track kakao IDs already seen to dedup within candidates
  const seenKakaoIds = new Set<string>();

  for (const candidate of candidates) {
    // Dedup within candidates batch
    if (seenKakaoIds.has(candidate.kakaoPlaceId)) continue;
    seenKakaoIds.add(candidate.kakaoPlaceId);

    // Check against existing stores
    const dup = existing.some((s) => isDuplicate(s, candidate));
    if (!dup) {
      newCandidates.push(candidate);
    }
  }

  return {
    merged: existing,
    newCount: newCandidates.length,
    candidates: newCandidates,
  };
}
