export interface SearchRegion {
  name: string;
  x: string; // longitude center
  y: string; // latitude center
  radius: number;
}

export const REGIONS: SearchRegion[] = [
  { name: "홍대", x: "126.9234", y: "37.5563", radius: 3000 },
  { name: "강남", x: "127.0276", y: "37.4979", radius: 3000 },
  { name: "신촌", x: "126.9370", y: "37.5560", radius: 2000 },
  { name: "종로", x: "126.9920", y: "37.5700", radius: 3000 },
  { name: "동대문", x: "127.0090", y: "37.5710", radius: 2000 },
  { name: "용산", x: "126.9654", y: "37.5326", radius: 3000 },
];

export const KEYWORDS: string[] = [
  "피규어 매장",
  "피규어샵",
  "가챠 매장",
  "가챠샵",
  "만화책 전문점",
  "TCG 카드샵",
  "트레이딩카드 매장",
  "애니메이션 굿즈",
  "애니굿즈 매장",
  "아이돌 굿즈",
  "아이돌 포토카드",
  "프라모델 매장",
  "오타쿠 매장",
];
