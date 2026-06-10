<!-- Figma 정합 스윕 측정 기록 — 3개 캔버스 섹션별 Figma값/라이브값/Δ/조치 (Playwright getBoundingClientRect 스크롤바 숨김 4앵커 ±2px) -->

# Figma 정합 스윕 측정 기록 (2026-06-08~09)

> 측정: Playwright `getBoundingClientRect`(스크롤바 숨김) 4앵커 375/768/1024/1440. 허용 ±2px.
> Figma fileKey `lmjjU4UxUpK2pDi67BGRiW`. 코드 BP→Figma 밴드: base→375 / md→768 / lg→1025 / wide→1440.
> 브랜치 `feat/figma-fidelity-sweep`.

## 선행 — Gmarket Sans
- SIL OFL 확인(corp.gmarket.com) → Medium woff2 셀프호스팅(`next/font/local`), Hero 헤드라인 적용.
- Hero 헤드라인 1440 박스 553×150 = Figma 554×150 ±2 (SUIT 폴백 글자폭 차이 해소).

## A. 헤더 (Figma 컴포넌트 97:9431) — 전 BP PASS
| BP | height | 콘텐츠 grid | 로고 | 검색아이콘 | 결과 |
|---|---|---|---|---|---|
| 375 | 54 | px16 | 63×42 | pill+🔍 gap16 | ✓ |
| 768 | 70 | 60/648 | 63×42 | 4nav gap4+🔍 | ✓ |
| 1024 | 88 | 60/905 | 80×53 | 4nav gap24+🔍 | ✓ |
| 1440 | 88 | 120/1200 | 80×53 | 4nav gap24+🔍 | ✓ |
- 수정: height 64/64/80/80→54/70/88/88 · `container px-20`→SectionContainer grid · 로고 40/48→42/53 · nav gap/padding/폰트.
- ⚠️ **2026-06-10 정정** — 위 표·수정의 "검색 아이콘 전 BP 복원"은 **취소**됨(사용자 결정 재확인). ADR-037 "검색 아이콘 제거"(1차 범위 밖) 유지가 최종 — 헤더에 검색 아이콘 없음. 표의 검색아이콘 칸(🔍)은 06-08 당시 복원 상태 기록이며 현행 아님. `search-icon.svg`는 미참조 자산으로 잔존(v1.1 검색 재도입 대비, ADR-037 결정).

## B. 랜딩 (96:5908) — 섹션 높이 측정 (Figma / 라이브 / Δ)
| 섹션 | 375 | 768 | 1024(=1025밴드) | 1440 | 조치 |
|---|---|---|---|---|---|
| Hero(콘텐츠) | 187/187 | 340/340 | 405/405 | 612/612 | criteria PASS 유지(헤더 별도) |
| KPI | 544/543 | 840/839 | 1058/1057 | 952/952 | py 64/64/96/96→**44/58/90/96** |
| Story | 673/689(+16) | 682/683 | 479/479 | 573/571 | py→**79/79/73/73**·이미지↔텍스트 갭 40→50·내부 tag→title 14/18·title→desc 4/12. 375 +16=텍스트 line-height 잔차 |
| ArticleGrid | content-driven(실사진 마조네리) | — | — | 982/~ | wide 좌우갭 32→16(카드폭 277.67 정합). 높이는 실이미지 비율 가변 |
| Partners | 698/698 | 547/546 | 510/510 | 457/456 | py 64/64/96/96→**75/44/76/49**(비단조) |
| Footer | 70/70 | 99/99 | 99/99 | 99/99 | 데스크탑 사이즈 lg→**md** 전환(768 70→99) |
- 콘텐츠폭(마진): 전 섹션 343/648/905/1200, left 16/60/60/120 ✓.

### 잔차/메모
- Story 375 +16px: 텍스트 블록 line-height·줄바꿈 차이(폰트 렌더). 패딩·주요 갭은 정합. 허용 범위로 판단.
- KPI/Hero 내부(카드·타원·꽃)는 `kpi-hero-fidelity-criteria.md`(2026-06-08 PASS) governed — 섹션 패딩만 본 스윕에서 보정.
- ArticleGrid 총 높이는 실업로드 이미지 비율 기반(content-driven) — 구조(좌319·우865·갭16·컬럼16)만 정합.

## C. 소식 목록 (95:9359)
| 요소 | Figma | 라이브 | 결과 |
|---|---|---|---|
| SubBanner | 132(768+)/160(375) | 132/173(+13) | ✓ / 375 +13=mobile 텍스트 leading-relaxed(접근성 우선 유지) |
| 카드 그리드 열·갭 | 384·3열 24/48 (1440) · 313·2열 18/48 (768) · 288·3열 18/48 (1025) · 343·1열 –/48 (375) | 1440 384 24/48·768 315 18/48·375 343 –/48·1025 290 18/48 | ✓ **행간 24→48 수정**(375), 카드폭 ±2 |
| 카테고리 탭 height | 56(1440)/46(375) | 56 | ✓ |
| Featured 이미지 aspect | 612/411=1.489 | 1.489 | ✓ 이미지 정합 |
| **Featured 섹션 높이** | 646(1440)·503(768)·content 556/423 | 646/503·375 stack | ✓ **재구조화**(items-stretch+min-h 423/556·버튼 mt-auto 하단앵커) — 1440 646 정확, 오버플로0 |

## D. 소식 상세 (93:8810, Figma 1440 단독)
| 요소 | Figma | 라이브 | 결과 |
|---|---|---|---|
| 콘텐츠폭(1440) | 900(margin 270) | 905(margin 268) | +5(news 목록 lg밴드 905와 통일) |
| 본문 가로 오버플로(375) | 0 | 0 | ✓ |
| 모바일 콘텐츠폭(375) | 343(px16) | 343 | ✓ |
| 태그 알약 | 94×35 | 95×38 | ✓(h +3) |
| 관련글 그리드 | 3열(1440)/1열(375) | ✓ | ✓ |
- 반응형은 코드 보간(Figma 상세 프레임 1440 단독) — 오버플로 0·밴드폭 정합 확인.

## 컴포넌트 (97:10250)
- ArticleCard Size1~4 폭(384/313/288)은 목록·관련글 그리드에서 in-context 검증 ✓.
- Header 컴포넌트 = §A. Heart/Tag/Pagination 은 카드·상세 내 in-context 노출.

## 결정 반영
- **Featured 히어로**: 사용자 선택 = Figma 재현(airy/하단앵커). items-stretch + BP별 min-h(423/556) + 버튼 mt-auto 로 재구조화 완료. 1440 646px 정확 일치.

## 잔여(허용 범위·후속)
- 768 featured 섹션 pb +20(news-hero pt/pb 미세) · 상세 콘텐츠폭 905 vs 900(+5) · SubBanner 375 +13(leading-relaxed 접근성 우선) · Story 375 +16(텍스트 line-height) · ArticleGrid/마조네리 높이 content-driven.

## 2026-06-10 하드코딩 정리 (유지보수 스윕)

측정 px 를 4px 그리드 표준 유틸리티로 스냅 — 엣지당 ±2px(본 스윕 허용오차) 내, 섹션 총높이 최대 −4px 트레이드오프를 유지보수성 우선으로 수용 (사용자 결정).

- **헤더** 54/70/88 → **56/72/88** (`h-14 md:h-18 lg:h-22`). `src/client/layouts/header-height.ts` SSoT 신설 — PublicHeader 바·`(public)/layout.tsx` Suspense fallback·`useScrollSpy` 기준선(기존 64/80 stale) 3곳 동기. 밴드 폭은 SectionContainer 재사용으로 교체(인라인 복제 제거). 로고 42/53.3 → 40/52.
- **KPI** py 44/58/90/96 → **44/56/88/96** (`py-11 md:py-14 lg:py-22 wide:py-24`). `KPI_SECTION_SHELL` export — page.tsx 스켈레톤 패딩 동기화(기존 64/96 stale → 스트리밍 점프 제거).
- **Story** py 79/73 → **80/72** (`py-20 lg:py-18`), 이미지↔텍스트 갭 50 → 48(`gap-12`), tag→title 14/18 → 16 단일(`mt-4`). `STORY_SECTION_SHELL` export — 스켈레톤 동기. *(정정: tag→title 단일화는 이후 감사 r2(audit-2026-06-10)가 타이포 재측정(22/28/32·lh1.3)과 함께 14/18 차등을 복원하며 대체됨 — 머지 해소 2026-06-10.)*
- **Partners** py 75/44/76/49 → **76/44/76/48** (`py-19 md:py-11 lg:py-19 wide:py-12`). wide<lg 역전은 Figma 재확인 항목(docs/TODO.md).
- **Gmarket 폰트** — 로드 위치 루트 레이아웃 → HeroBanner 이동(512KB preload 가 어드민·/news 전 라우트에 주입되던 것을 랜딩 한정으로). 인라인 `style={{fontFamily}}` → globals.css `--font-display` 토큰 + `font-display font-medium` 유틸리티.
- Featured `min-h-[423px]/[556px]` 는 **유지** — 이미지 비율(≈390px)로는 Figma 콘텐츠 높이(556) 재현 불가, 텍스트 스테이지가 높이 드라이버인 디자인의 정직한 번역.

## 검증
- tsc 0 · lint 0 · test 48 · build ✓ (2026-06-09).
- 하드코딩 정리 후: tsc 0 · lint 0 · test 51 · build ✓ + 빌드 CSS 에서 신규 bare 유틸리티 전수 생성 확인 + Gmarket woff2 가 랜딩 외 라우트(/news·/admin/login) 미참조 확인 (2026-06-10).
