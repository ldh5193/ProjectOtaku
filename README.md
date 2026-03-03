# ProjectOtaku (오덕로드)

오프라인 굿즈샵 지도 웹 서비스 - 설치 없이 브라우저에서 사용 가능한 정적 웹 기반 지도 서비스

## 프로젝트 구조

```
ProjectOtaku/
├── .env.local                          # 환경변수 (git 제외)
├── .env.example                        # 환경변수 템플릿
├── CLAUDE.md                           # AI 작업 규칙
├── PLANNING.md                         # 프로젝트 기획서
├── README.md                           # 프로젝트 구조 및 개발 가이드 (현재 파일)
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── public/
│   └── data/
│       └── stores.json                 # 매장 데이터 (정적 JSON)
└── src/
    ├── app/
    │   ├── layout.tsx                  # 루트 레이아웃 (NaverMapProvider 적용)
    │   ├── page.tsx                    # 홈 - stores.json → HomeClient 전달
    │   └── globals.css                 # 글로벌 스타일 + scrollbar-hide 유틸
    ├── hooks/
    │   └── useStoreFilter.ts           # 장르 필터 + 검색 상태/로직 (filteredStores, groupedStores)
    ├── components/
    │   ├── NaverMapProvider.tsx         # "use client" - 네이버맵 SDK 로딩
    │   ├── Header.tsx                  # 서비스명 표시
    │   ├── HomeClient.tsx              # "use client" - 메인 오케스트레이터 (필터/지도/리스트 조합)
    │   ├── filter/
    │   │   ├── GenreFilterBar.tsx      # 장르 칩 토글 버튼 (8종, 멀티선택, 초기화)
    │   │   └── SearchBar.tsx           # 검색 입력 (300ms 디바운스)
    │   ├── list/
    │   │   └── StoreListPanel.tsx      # 지역 그룹별 매장 리스트 + 빈 결과 상태
    │   ├── layout/
    │   │   ├── MobileBottomSheet.tsx   # 모바일 슬라이드업 하단 시트 (55vh)
    │   │   └── DesktopSidePanel.tsx    # 데스크톱 사이드 패널 (md+, 360px)
    │   └── map/
    │       ├── MapSection.tsx          # "use client" - 지도 렌더링, diff 기반 마커 관리, actionRef
    │       └── InfoWindowContent.tsx   # 정보창 HTML 빌더
    └── types/
        ├── store.ts                    # Store, Genre, StoreType 타입 + genreLabels, areaLabels, 헬퍼
        └── naver-maps.d.ts            # 네이버맵 SDK 타입 선언
```

## 기능

### 지도 기반 매장 탐색
- 네이버맵에 매장 마커 표시 및 정보창
- 마커 클릭 시 매장 상세 정보 (장르 태그, 운영시간, 전화번호 등)

### 카테고리 필터
- 8개 장르 칩 버튼으로 필터링 (애니/피규어/굿즈/만화/게임/아이돌/TCG/가챠)
- 멀티 선택 가능 (OR 조건)
- 초기화 버튼으로 전체 복원

### 검색
- 매장 이름/주소 검색 (300ms 디바운스)
- 장르 필터와 AND 조합

### 매장 리스트
- 지역별 그룹 헤더로 정리된 리스트 뷰
- 리스트에서 매장 클릭 → 지도 이동 + 정보창 열림
- 빈 결과 시 안내 메시지

### 반응형 레이아웃
- **모바일**: 헤더 → 검색바+목록 토글 → 장르 칩 → 지도 (리스트는 하단 슬라이드업 시트)
- **데스크톱(md+)**: 헤더 → [좌측 사이드패널(검색+필터+리스트) | 우측 지도]

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| Map SDK | 네이버맵 JS SDK v3 (직접 로딩) |
| Data | Static JSON (`public/data/stores.json`) |
| Hosting | Vercel |

## 시작하기

### 사전 준비

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 가입
2. Console → AI/NAVER API → Application 등록
3. Web Dynamic Map 선택 → 서비스 URL에 `http://localhost:3000` 등록
4. 발급된 Client ID 복사

### 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 열어 Client ID를 입력
```

### 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 빌드

```bash
npm run build
npm start
```

## 매장 데이터 관리

`public/data/stores.json`을 직접 편집하여 매장 정보를 추가/수정할 수 있습니다.

```json
{
  "id": "지역-번호",
  "name": "매장명",
  "address": "도로명 주소",
  "lat": 37.0000,
  "lng": 127.0000,
  "genre": ["anime", "figure", "goods"],
  "type": "franchise",
  "phone": "02-000-0000",
  "openingHours": "12:00 - 22:00",
  "description": "매장 설명"
}
```

**장르 종류:** anime, figure, goods, manga, game, idol, tcg, gashapon
**매장 유형:** franchise, independent, popup
