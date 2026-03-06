# ProjectOtaku (오덕로드)

오프라인 굿즈샵 지도 웹 서비스 - 설치 없이 브라우저에서 사용 가능한 PWA 기반 지도 서비스

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
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── store-report.yml            # 정보 수정 제보 템플릿
│   │   └── store-suggestion.yml        # 매장 추가 제안 템플릿
│   └── workflows/
│       └── scrape-stores.yml           # 주간 스크래퍼 자동화 (매주 일요일)
├── scripts/
│   ├── import-naver-folder.ts          # 네이버 공유 폴더 → stores-naver.json 동기화
│   ├── fetch-hours.ts                 # 네이버 지도에서 영업시간 일괄 수집
│   └── scraper/
│       ├── run.ts                      # 스크래퍼 메인 엔트리포인트
│       ├── kakao-client.ts             # Kakao Local API 클라이언트
│       ├── search-queries.ts           # 검색 키워드 & 지역 설정
│       ├── genre-classifier.ts         # 장르 자동 분류
│       ├── id-generator.ts             # 매장 ID 생성 + 지역 감지 (전국)
│       └── merger.ts                   # 기존 데이터와 병합 (중복 방지)
├── public/
│   ├── manifest.json                   # PWA 매니페스트
│   ├── icons/                          # PWA 아이콘 (192, 512)
│   ├── lib/
│   │   └── MarkerClustering.js         # 네이버맵 마커 클러스터링 유틸 (Apache 2.0)
│   └── data/
│       ├── stores-manual.json          # 수동 관리 매장 데이터
│       ├── stores-naver.json           # 네이버 공유 폴더 동기화 매장 데이터
│       ├── stores-url.json             # URL 임포트로 추가된 매장 데이터
│       └── scraped-candidates.json     # 스크래퍼 발견 후보 (자동 생성)
└── src/
    ├── app/
    │   ├── layout.tsx                  # 루트 레이아웃 (PWA 메타태그, NaverMapProvider)
    │   ├── page.tsx                    # 홈 - manual+naver+url JSON 병합 → HomeClient 전달
    │   ├── globals.css                 # 글로벌 스타일 + scrollbar-hide 유틸
    │   └── api/
    │       ├── report/route.ts         # POST: 제보/제안 → GitHub Issue 자동 생성
    │       ├── naver-import/route.ts   # POST: 네이버 지도 URL → 장소 데이터 추출
    │       └── url-import/route.ts     # POST: URL 임포트 매장 → stores-url.json 저장
    ├── hooks/
    │   ├── useStoreFilter.ts           # 장르 + 시리즈 + 즐겨찾기 + 영업중 + 팝업 필터 + 검색
    │   ├── useFavorites.ts            # localStorage 기반 즐겨찾기 관리 훅
    │   ├── useHashRouter.ts            # URL hash 기반 라우팅 (#store, #suggest, #import)
    │   └── useGeolocation.ts           # 브라우저 Geolocation API 래핑 훅
    ├── lib/
    │   ├── report-urls.ts              # 네이버 지도 URL 빌더 + 길찾기 URL 빌더
    │   ├── opening-hours.ts             # 영업시간 파싱 + 영업 상태 판단
    │   ├── popup-status.ts             # 팝업스토어 상태 판단 (upcoming/active/ended)
    │   ├── freshness.ts                # 데이터 신선도 계산 (fresh/aging/stale)
    │   ├── sanitize.ts                 # HTML 이스케이프 + URL 검증
    │   └── github-api.ts               # GitHub Issue 생성 서버 유틸
    ├── components/
    │   ├── NaverMapProvider.tsx         # "use client" - 네이버맵 SDK 로딩
    │   ├── Header.tsx                  # 서비스명 + 매장 추가/URL 추가 버튼
    │   ├── HomeClient.tsx              # "use client" - 메인 오케스트레이터
    │   ├── filter/
    │   │   ├── FilterSection.tsx       # 필터 래퍼 (SearchBar + Genre + Series, compact 모드)
    │   │   ├── GenreFilterBar.tsx      # 장르 칩 토글 버튼 (8종, 멀티선택, 초기화)
    │   │   ├── SeriesFilterBar.tsx     # 시리즈 칩 필터 (핑크 테마, 접기/펼치기, 인라인 검색)
    │   │   ├── ProductTypeFilterBar.tsx # 상품 유형 칩 필터 (청록 테마)
    │   │   └── SearchBar.tsx           # 검색 입력 (300ms 디바운스)
    │   ├── list/
    │   │   └── StoreListPanel.tsx      # 지역 그룹별 매장 리스트 + 신선도 뱃지
    │   ├── detail/
    │   │   ├── StoreDetail.tsx         # 매장 상세 패널 (미니맵, 전체정보, 네이버맵 링크, 길찾기)
    │   │   ├── FreshnessBadge.tsx      # 신선도 뱃지 (녹/황/적 dot + 날짜)
    │   │   └── MiniMap.tsx             # 상세 뷰 미니 네이버맵
    │   ├── report/
    │   │   └── ReportModal.tsx         # 사이트 내 제보/제안 모달 폼
    │   ├── import/
    │   │   └── ImportModal.tsx         # 네이버 지도 URL 임포트 모달
    │   ├── layout/
    │   │   ├── MobileBottomSheet.tsx   # 모바일 슬라이드업 하단 시트 (55vh)
    │   │   └── DesktopSidePanel.tsx    # 데스크톱 사이드 패널 (md+, 360px)
    │   └── map/
    │       ├── MapSection.tsx          # "use client" - 지도 렌더링, 마커 클러스터링
    │       └── InfoWindowContent.tsx   # 정보창 HTML (신선도 표시, 상세 보기 링크)
    └── types/
        ├── store.ts                    # Store, Genre, StoreType, Area 타입
        └── naver-maps.d.ts            # 네이버맵 SDK 타입 선언
```

## 기능

### 지도 기반 매장 탐색
- 네이버맵에 매장 마커 표시 및 정보창
- **마커 클러스터링**: 줌 레벨에 따라 인근 마커를 그룹화 (파랑→주황→빨강→보라 색상 단계)
- 클러스터 클릭 시 자동 줌인, 줌 레벨 14 이상에서 개별 마커 노출
- 마커 클릭 시 간략 정보 → "자세히 보기"로 상세 패널 전환
- 상세 패널에서 미니맵, 영업시간, 전화번호, 네이버 지도 링크 제공

### 매장 상세 뷰
- 사이드패널/바텀시트에서 리스트 ↔ 상세 모드 전환
- 미니 네이버맵으로 위치 확인
- "네이버 지도에서 보기" 버튼으로 외부 네이버맵 연동
- "길찾기" 버튼 - 현재 위치 기반 네이버 지도 길찾기 (모바일 앱/웹 자동 전환)
- 데이터 신선도 표시 (녹색: 최근 확인, 황색: 확인 필요, 적색: 오래된 정보)

### 카테고리 필터
- 8개 장르 칩 버튼으로 필터링 (애니/피규어/굿즈/만화/게임/아이돌/TCG/가챠)
- 작품/시리즈 칩 필터 (핑크 테마, 빈도순 정렬, 접기/펼치기)
- 상품 유형 칩 필터 (청록 테마): 아크스탠드, 랜덤박스, 넨도로이드, 스케일피규어, 봉제인형, 의류, 포토카드, 키링, 문구, 이타백, 포스터
- 멀티 선택 가능 (장르 OR, 시리즈 OR, 상품유형 OR, 상호간 AND)
- 초기화 버튼으로 전체 복원

### 검색
- 매장 이름/주소/시리즈 검색 (300ms 디바운스)
- 장르·시리즈 필터와 AND 조합

### 매장 리스트
- 지역별 그룹 헤더로 정리된 리스트 뷰
- 리스트에서 매장 클릭 → 지도 이동 + 상세 뷰
- 신선도 뱃지로 데이터 신뢰도 확인

### 사이트 내 제보
- **정보 수정**: 매장 상세 뷰에서 "정보 수정 제보" → 모달 폼 → GitHub Issue 자동 생성
- **매장 추가 제안**: 헤더의 "매장 추가" → 모달 폼 → GitHub Issue 자동 생성
- **네이버 지도 URL 임포트**: 헤더의 "URL 추가" → 네이버맵 URL 붙여넣기 → 자동 정보 추출 → 제안

### "지금 영업중" 필터
- 네이버 지도에서 구조화된 요일별 영업시간 자동 수집 (`npm run fetch:hours`)
- "영업중" / "곧 마감" (마감 30분 전) / "영업종료" 상태 자동 판단
- 매장 리스트, 상세 뷰, 지도 인포윈도우에서 상태 뱃지 표시
- 필터 토글로 현재 영업중인 매장만 표시
- 구조화 데이터 우선, 문자열 폴백 파싱 지원

### 팝업스토어 트래커
- 매장 type이 `popup`인 경우 `popupStartDate`/`popupEndDate` 기반 자동 상태 판단
- 상태: 오픈 예정(파랑), 운영중(초록), 종료(회색)
- 매장 리스트, 상세 뷰, 지도 인포윈도우에 상태 뱃지 + 기간 표시
- 지도에서 팝업스토어는 보라색 "P" 핀으로 구분
- 종료된 팝업은 기본 필터에서 숨김, "종료 팝업" 토글로 표시 가능

### 즐겨찾기
- 매장 상세, 매장 목록, 지도 인포윈도우에서 별 아이콘으로 즐겨찾기 토글
- 즐겨찾기한 매장은 지도에서 별 핀 마커로 구분 표시
- 필터 영역에서 즐겨찾기만 보기 토글 (즐겨찾기가 있을 때만 노출)
- localStorage 기반으로 비로그인 상태에서도 유지

### PWA (모바일 지원)
- 모바일 "홈 화면에 추가" 지원
- 반응형 레이아웃 (모바일 바텀시트 / 데스크톱 사이드패널)

### 데이터 관리
- **이중 데이터 소스**: 수동 관리(`stores-manual.json`)와 네이버 동기화(`stores-naver.json`) 분리
- **네이버 폴더 동기화**: 공유 폴더 API로 매장 데이터 자동 임포트 (`npm run import:naver`)
- **스크래퍼**: Kakao Local API 기반 자동 매장 검색 (`npm run scrape`)
- **GitHub Actions**: 매주 일요일 자동 실행 → 새 매장 발견 시 자동 커밋
- **중복 처리**: 수동/동기화 파일 간 중복 발생 시 최신 갱신 쪽으로 자동 이동
- **데이터 신선도**: 매장별 lastVerified 날짜로 정보 신뢰도 판단

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| Map SDK | 네이버맵 JS SDK v3 (직접 로딩) |
| Data | Static JSON (수동: `stores-manual.json`, 동기화: `stores-naver.json`, URL: `stores-url.json`) |
| API Routes | Next.js Route Handlers (제보, URL 임포트) |
| Scraper | Kakao Local API + tsx |
| CI/CD | GitHub Actions (주간 스크래핑) |
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
```

`.env.local` 필수 항목:
```
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=xxx   # 네이버맵 표시
KAKAO_REST_API_KEY=xxx                # 스크래퍼 + URL 임포트
GITHUB_TOKEN=xxx                      # 사이트 내 제보 → Issue 생성
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

### 데이터 파일 구조

| 파일 | 설명 | 갱신 방법 |
|------|------|----------|
| `stores-manual.json` | 수동 관리 매장 | 직접 편집 또는 스크래퍼 |
| `stores-naver.json` | 네이버 공유 폴더 동기화 | `npm run import:naver` |
| `stores-url.json` | URL 임포트로 추가된 매장 | 사이트 내 "URL 추가" 기능 |

앱은 세 파일을 합쳐서 로드합니다. 중복 매장이 다른 파일에 존재할 경우, 갱신 시 최신 갱신된 파일 쪽으로 자동 이동됩니다.

### 수동 편집

`public/data/stores-manual.json`을 직접 편집하여 매장 정보를 추가/수정할 수 있습니다.

```json
{
  "id": "지역-번호",
  "name": "매장명",
  "address": "도로명 주소",
  "lat": 37.0000,
  "lng": 127.0000,
  "genre": ["anime", "figure", "goods"],
  "series": ["원피스", "체인소맨"],
  "type": "franchise",
  "phone": "02-000-0000",
  "openingHours": "12:00 - 22:00",
  "description": "매장 설명",
  "source": "manual",
  "lastVerified": "2026-03-04"
}
```

**장르 종류:** anime, figure, goods, manga, game, idol, tcg, gashapon
**상품 유형:** acrylstand, blindbox, figure-nendoroid, figure-scale, plush, apparel, photocard, keychain, stationery, itabag, poster
**매장 유형:** franchise, independent, popup
**지역 코드:** hongdae, gangnam, sinchon, jongno, dongdaemun, yongsan, songpa, gwangjin, etc-seoul, gyeonggi, incheon, busan, daegu, daejeon, gwangju, chungnam, chungbuk, jeonbuk, jeonnam, gyeongbuk, gyeongnam, gangwon, jeju, etc

### 네이버 공유 폴더 동기화

```bash
# 기본 공유 폴더에서 동기화
npm run import:naver

# 다른 공유 폴더 URL 지정
npm run import:naver -- --url "https://naver.me/xxxxx"

# 드라이런 (저장 없이 미리보기)
npm run import:naver -- --dry-run

# 썸네일 생략 (빠른 실행)
npm run import:naver -- --skip-thumbnails
```

### 네이버 지도 URL로 매장 추가

1. 네이버 지도에서 매장 페이지를 열고 공유 링크를 복사
2. 사이트 헤더의 "URL 추가" 클릭
3. URL 붙여넣기 → 자동으로 매장 정보 추출
4. 장르 선택 후 제안 전송 → GitHub Issue 생성 → 관리자 반영

### 스크래퍼 실행

```bash
KAKAO_REST_API_KEY=your_key npm run scrape
```

### 사이트 내 제보

- **정보 수정**: 매장 상세 뷰 → "정보 수정 제보" 버튼
- **매장 추가**: 헤더 → "매장 추가" 버튼
- 모든 제보는 자동으로 GitHub Issue로 생성됩니다
