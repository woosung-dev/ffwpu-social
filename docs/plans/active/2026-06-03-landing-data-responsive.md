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
- [ ] WS5-A fan-out + synthesis (question_flags → 사용자 확인) — 진행 중 (wf_f73f55d6)
- [ ] WS5-B 섹션 7건 순차 적용 + Playwright 검증 (섹션당 1커밋)
- [ ] 문서 Atomic Update (decisions.md ADR-035 · design.md 날짜 · TODO.md · CLAUDE.md 포인터) — ADR-034 완료
- [ ] 최종 게이트: tsc 0 · lint · test · build 그린

## 측정 사실 (WS5 입력)

- 라이브 768px 가로 스크롤 발생 (scrollWidth 763 > clientWidth 753) — fan-out 에 원인 추적 지시 포함. 타 폭 클린.
- /news 히어로 LCP 이미지 `loading="eager"` 권고 경고 (next/image priority 미지정) — WS5 또는 후속에서 처리.

## Context Notes (작업 중 결정 누적)

- 2026-06-03: `/public` 커버 금지 결정 — `isAllowedImagePublicUrl`이 S3 public URL prefix만 허용. 시드도 MinIO 경유로 프로덕션과 동일 형태 유지.
- 2026-06-03: `ReactQueryStreamedHydration` 미채택 — experimental + 네비게이션 워터폴. 안정 prefetch+HydrationBoundary 패턴 채택 (TanStack Advanced SSR 가이드).
- 2026-06-03: 커스텀 브레이크포인트(2xl=1440) 철회 — 1440~1920 여백 확장은 clamp (사용자 모던 CSS 규약 정합).
- 2026-06-03: KPI 보라 카드 사진은 news 커버가 아닌 public 자산 — 시드 스코프 분리.
