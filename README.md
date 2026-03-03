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
    │   ├── page.tsx                    # 홈 - stores.json → MapSection 전달
    │   └── globals.css
    ├── components/
    │   ├── NaverMapProvider.tsx         # "use client" - 네이버맵 SDK 로딩
    │   ├── Header.tsx                  # 서비스명 표시
    │   └── map/
    │       ├── MapSection.tsx          # "use client" - 지도 렌더링, 마커, 정보창
    │       └── InfoWindowContent.tsx   # 정보창 HTML 빌더
    └── types/
        ├── store.ts                    # Store, Genre, StoreType 타입
        └── naver-maps.d.ts            # 네이버맵 SDK 타입 선언
```

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
