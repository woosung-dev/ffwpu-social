<!-- 변경 이력 — Sprint 단위 entry. Atomic Update (.ai/common/ai-behavior.md) — 동일 세션 갱신 -->

# CHANGELOG

> Sprint 단위 의미 단위 변경 누적. 본 파일은 `docs/plans/active/` 머지 시점에 갱신.

## [Unreleased] - 2026-05-28 — Sprint 1 D-3

### Added

- `src/client/sections/` 신규 5섹션 — `HeroBanner` `KpiSection` `StorySection` `ArticleGridSection` `PartnersSection` (Figma 96:7690·7773·7834·7877·7897 정합).
- `src/app/(public)/page.tsx` 랜딩 5섹션 조립 + SEO `metadata` + OpenGraph.
- `src/app/(public)/news/page.tsx` placeholder (PublicHeader RSC prefetch 404 회피. D-2에서 본격 작성).
- `src/app/icon.svg` + `public/favicon.ico` — Sow Good 로고 기반 favicon.
- `globals.css` 토큰 4종 — `--color-ink-strong-mid` `--color-ink-on-lime` `--color-ink-on-purple` `--color-surface-tint-soft` `--color-surface-tint-faint` (designer P1 인라인 hex 통합).
- `docs/design/screenshots/d3/` — 5 BP 검증 스크린샷 5장.

### Changed

- `src/client/layouts/PublicFooter.tsx` Figma 126:10897 정합 — BI 로고 39 + 세로 라인 + SemiBold 16px (1200px 가운데).
- `src/app/(public)/layout.tsx` `overflow-x-hidden` (5 BP 가로 스크롤 0 강제).
- `src/features/news/service.ts` `"use cache"` + `cacheTag` + `cacheLife` 적용 (Next.js 16 cacheComponents 모드 필수. mutation에서 `revalidateTag`로 무효화).
- `src/features/news/components/Pagination.tsx` 외 — 인라인 hex → 신규 토큰 utility 일괄 교체 (5섹션 + Footer).
- `PartnersSection` BP 1px 보정 — `lg:grid-cols-5` → `min-[1025px]:grid-cols-5` (매트릭스 L154 정합).

### Resolved

- **H-3** Banner "참여하기" 카피 → Figma 원본 "이야기 보러가기" (사용자 결정).
- favicon 404 console.error → `src/app/icon.svg` + `public/favicon.ico`.
- `/news` prefetch 404 → placeholder 페이지 추가.

### Tech Debt (D-2 시작 전 또는 v1.1 처리)

- Gmarket Sans Medium 60px 폰트 자산 — 현재 SUIT Heavy fallback chain. 라이센스·조달 후 `public/fonts/` 추가.
- KPI 값 운영자 편집 분리 (현재 Figma 시안 인라인 상수).
- ArticleGridSection coverImageUrl seed 정상화 (현재 자산 fallback cycle).
- HeroBanner 1440 우측 일러스트 시안 정합 (max-w 탈출 검토).

### Verification

- `pnpm tsc --noEmit` — 0 error
- `pnpm lint` — 0 warning
- `pnpm build` — Static prerender 8/8 (`/` revalidate 1m / expire 1h)
- 5 BP overflow 0 (1920·1440·1024·768·375)
- console.error 0 (favicon·`/news` 모두 해결)
- Designer review: Figma 정합 95%+, Anti-slop §3 7/8, P0 0건. PR 진행 가능.

---

## [Unreleased] - 2026-05-27 — Sprint 1 D-4

D-4: F3 폴더 + 디자인 토큰 9단계 + SUIT 폰트 + 공통 컴포넌트 11종 (ArticleCard·StoryCard·FeaturedStoryCard·KpiCard·Heart·CategoryTabs·Pagination·Banner·PublicHeader·PublicFooter·useScrollSpy). Route Group `(public)`. PR #2 머지.

## [Unreleased] - 2026-05-26 — Sprint 1 D-5

D-5: Docker Compose + Drizzle 5 테이블 + NextAuth v5 Credentials(super 단일) + 3-Layer 골격 (actions/service/db). PR #1 머지.

## [Unreleased] - 2026-05-27 — D-4 후속 DB·domain

`categories` 테이블 전환(ADR-025) + 익명 좋아요 sessionId 단순화(ADR-026, ip_hash 제거). Drizzle migration `0001_categories_and_heart_simplify.sql` + seed.
