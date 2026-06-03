---
status: active
opened: 2026-06-03
branch: feat/client-foundation
slice_id: TASK-20260603-landing-data-responsive
spec_status: confirmed
brainstorming_done: 2026-06-03
related_adr:
---

# 랜딩 실데이터화 + 반응형 4-BP 정합

> 개인 brainstorm 본문: `~/.claude/plans/abstract-sauteeing-fox.md` (탐색 4회 + Plan 에이전트 2개 + RQ 자료조사 전문)
> 승격 사유: 사용자 승인 plan (2026-06-03). Explore×4 + Plan×2 + TanStack 공식 Advanced SSR 조사 기반.

## 배경

Story·ArticleGrid 섹션은 DB 배선(news.storySlot/featuredRank + kpi_metrics)이 이미 존재하나, **시드에 커버·슬롯이 비어 placeholder(1×1 회색 PNG)가 렌더**되어 하드코딩처럼 보임. 사용자 제공 사진 11장으로 시드를 실데이터화하고, 랜딩 7면을 디자이너 4-BP(1920~1440/1439~1025/1024~768/767~375)에 서지컬 정합. TanStack Query는 /news 목록 캐시 한정 도입.

## 확정 결정 (2026-06-03 사용자 합의)

| 항목 | 결정 |
|---|---|
| Story·ArticleGrid 실데이터화 | 시드 확충으로 해결 — 신규 스키마·마이그레이션 0 |
| 섹션 카피 | 브랜드 고정(코드 유지). 편집화 = YAGNI |
| CSS 스택 | Tailwind v4 유지. clamp·@container·has-·color-mix·starting-style = arbitrary value·variant + @theme 토큰. 긴 연출만 `@utility`·`@layer components`. CSS Modules 금지 |
| 적용 깊이 | 서지컬 — BP 정합으로 손대는 곳만 모던 기법 |
| 히어로 폰트 | SUIT 폴백 유지 + clamp 재튜닝. Gmarket Sans 라이선스 확인 후 결정 |
| TanStack Query | /news 목록 캐시 한정 — prefetch(no await)+HydrationBoundary+useSuspenseQuery (공식 안정 패턴). experimental 패키지 미채택. 랜딩 RSC 유지(Data Ownership 권고). 하트 현행 유지 |
| 자료 | 현장 사진 11장 사용자 제공 대기. 파트너 로고 미제공 → Partners 스코프 외 |

## 사진 11장 매핑 (docs/TODO.md 2026-05-30 항목 정합)

| 용도 | 장수 | 처리 |
|---|---|---|
| Story 슬롯 카드 2 + ArticleGrid 6 + Featured 1 | 9 | **MinIO 업로드 → news 커버 + 슬롯 배정** (`src/db/seed-assets/`) |
| KPI 보라 카드 장식 1 | 1 | `public/images/` 회색 placeholder 동일 파일명 덮어쓰기 (news 아님) |
| 예비 1 | 1 | 잔여 소식 커버 |

## 작업 그룹

- **WS1** 시드 실데이터화 — seed-assets → MinIO `news/seed/` 업로드(`getPublicUrl` 재사용 = `isAllowedImagePublicUrl` 통과 보장), 소식 9→14건(쌀나눔 8), storySlot 1·2 / featuredRank 1~6 / heroRank 1~4 명시 배정, Tiptap 본문 리치화. 사진 미도착 시 경고 + 커버 없이 진행(비차단)
- **WS2** /admin/landing 슬롯 커버 썸네일 — `listRiceSharingCandidates` select에 coverImageUrl + LandingSlotManager 행 썸네일
- **WS3** ArticleGridSection 내부 fetch → page.tsx 래퍼 호이스트 (Kpi/Story props 패턴 통일)
- **WS4** TanStack Query /news 목록 — `get-query-client`(cache()+staleTime 60s+pending dehydrate), QueryProvider, newsKeys factory(`features/news/api.ts`), 읽기 액션 `listNewsAction`, NewsListClient useSuspenseQuery. URL driver 불변
- **WS5** 반응형 4-BP — 7면 병렬 디자인 제안(fan-out) → synthesis(BP 정책 통일·서지컬 필터·question_flags) → 순차 적용(Footer→Header→ArticleGrid→Partners→Story→Hero→KPI) → Playwright 9폭(1920/1440/1280/1025/1024/768/767/375/320) + 가로스크롤 어서션

## 체크리스트

- [x] WS1 seed-assets 스캔 + MinIO 업로드 + 슬롯 배정 + 본문 리치화 (d1cd86f — 14건·커버 9·슬롯 전배정, 랜딩·/news 렌더 검증)
- [x] WS2 슬롯 썸네일 (ed00c35)
- [x] WS3 ArticleGrid fetch 호이스트 (a0fb23b — getLandingData 고아 제거 포함)
- [x] WS4 RQ /news 목록 (acbd03f + e277af6 — 캐시 왕복 POST 0건 검증, ADR-034)
- [x] WS5-A fan-out(7면 병렬·텍스트) + synthesis — 768 H-scroll 범인=KPI 별 아이콘 확정, 매트릭스 5셀 오류 발견
- [x] WS5-B 섹션 적용 + Playwright 9폭(320~1920) 검증 — Partners(0231cbc)·Story(741eb2e)·KPI 버그픽스(42c2b51)·ArticleGrid 배너(8988ef7)·KPI side-by-side(58f65ba). 전 폭 가로스크롤 0
- [x] 문서 Atomic Update — ADR-034(RQ)·ADR-035(BP 정책)·design.md 매트릭스 정정+날짜·AGENTS.md 포인터·TODO.md
- [x] 최종 게이트: tsc 0 · lint 0 · test 31 · build 그린(15p, /news PPR)

## 사용자 결정 로그 (2026-06-03)

- ArticleGrid 다크블록 768~1023: **Figma 가로 배너 정합** 선택 → md:flex 배너 구현.
- KPI 1024~1279: **풀 side-by-side 정합** 선택 → 벤토 lg 하향 + flex-[1.7]/[2.4] 유동 + 값 clamp + 데코 xl 한정.
- 그 외(Hero flower 축소·Story xl 상향·매직 clamp 등)는 critic 이 "억지 CSS/Figma 1024 깨짐"으로 기각 — 사용자 "억지 CSS 금지" 규약 정합.

## 측정 사실 (WS5 입력)

- 라이브 768px 가로 스크롤 발생 (scrollWidth 763 > clientWidth 753) — fan-out 에 원인 추적 지시 포함. 타 폭 클린.
- /news 히어로 LCP 이미지 `loading="eager"` 권고 경고 (next/image priority 미지정) — WS5 또는 후속에서 처리.

## Context Notes (작업 중 결정 누적)

- 2026-06-03: `/public` 커버 금지 결정 — `isAllowedImagePublicUrl`이 S3 public URL prefix만 허용. 시드도 MinIO 경유로 프로덕션과 동일 형태 유지.
- 2026-06-03: `ReactQueryStreamedHydration` 미채택 — experimental + 네비게이션 워터폴. 안정 prefetch+HydrationBoundary 패턴 채택 (TanStack Advanced SSR 가이드).
- 2026-06-03: 커스텀 브레이크포인트(2xl=1440) 철회 — 1440~1920 여백 확장은 clamp (사용자 모던 CSS 규약 정합).
- 2026-06-03: KPI 보라 카드 사진은 news 커버가 아닌 public 자산 — 시드 스코프 분리.

## 2차 충실도 (2026-06-03 후속 — 같은 브랜치/PR #20)

WS5 가 768 가로스크롤 0 을 우선하느라 일부 시안 충실도를 희생한 것을 Figma 노드 크롭 직접 대조로 교정. **SSoT = Figma 노드 스크린샷**(design.md 매트릭스/정정 노트 불신).

### 작업 그룹
- **WS6 KPI 375~1023 벤토 복원** — WS5 의 "768=2x2 단순그리드" 가 오류였음(Figma 는 375/768/1024/1440 전 BP 벤토). `lg:hidden` 단순그리드 블록을 데스크탑 동형 유동 벤토로 교체(고정폭→clamp/%/aspect, 640↑ 2열·<640 1열, 데코 640↑). 데스크탑 벤토(lg:flex) 무수정. dead 가 된 KpiCard 제거.
- **WS7 Hero 전 BP 단색 보라** — Figma 에 곡선/그라디언트 없음. lg+ `lg:bg-gradient` + 곡선 `hero-banner-background.svg`(상단 흰 코너 노치 유발) 제거 → 헤더와 seamless.
- **WS8 ArticleGrid 768 헤딩** — 다크배너 헤딩 md 24px→31px(Figma 크기). 구조·2열 마조네리·카드는 이미 정합.
- **WS9 재대조** — Story(768·375 3열 통계)·Partners(768 3+2)·Footer·Header(768 풀내비/375 pill) Figma 일치 확인. 미변경 → 회귀 0.

### 체크리스트
- [x] WS6 KPI 전 BP 벤토 복원 (41400b9) — 320~1023 가로스크롤 0, 1440 데스크탑 픽셀 무회귀 확인
- [x] WS7 Hero 단색 보라 (8a23924) — 1440/768/375 헤더 seamless 확인
- [x] WS8 ArticleGrid 768 헤딩 31px (34ab442)
- [x] WS9 Story/Partners/Footer/Header 재대조 — 변경 불필요(이미 정합)
- [x] 문서 2차 재정정 — design.md KPI·Hero 매트릭스 + 정정 노트, plan(본 섹션)
- [x] 게이트: tsc 0 · lint 0 · test 31 · build 그린 · Playwright 10폭(320/375/767/768/773/1024/1025/1280/1440/1920) 가로스크롤 0

### 사용자 결정 로그 (2차)
- KPI 벤토 복원 범위: **375~1023 전체 (Figma 충실)** 선택 — <640 1열 스택, 640~1023 2열 reflow, 1024↑ 데스크탑 벤토 보존.
- Hero: **전 구간 재점검** 선택 → 곡선/그라디언트가 Figma 에 없음을 확인하고 제거(전 BP 단색 보라).
- ArticleGrid 768 헤딩 2줄 강제(max-width)는 "억지 CSS"라 미적용 — 크기(31px)만 정합.

### Context Notes (2차)
- 아키텍처: KPI 는 데스크탑 블록 무수정 보존(Arch A) — sub-lg 별도 유동 벤토 신설. 회귀 표면 0 우선(사용자 "서지컬" 규약). 카드 콘텐츠 일부 중복은 의도적 비용.
- Figma 참조는 로컬 export 가 저해상 썸네일(768=426px폭)이라 python PIL 로 KPI/Hero 영역 크롭·확대해 컴포지션 확정 + 라이브 렌더로 정밀 반복(사용자 "Figma=스티커, 렌더 보고 추론" 규약).
- 미참조 에셋: `public/icons/hero-banner-background.svg` (Hero 곡선 제거로 고아). `globals.css` surface-tint-soft 주석 "Hero·Partners" → 이제 Partners 만 사용. 후속 정리 대상(docs/TODO.md).
- Figma MCP(`plugin:figma:figma`) 인증 시도(URL 발급) — 미완료. 신규 노드 `332:8837`(사용자 제공) 미보유.
