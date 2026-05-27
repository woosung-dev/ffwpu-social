<!-- 현재 세션 미해결 항목 — global.md §2 형식 (Completed / Blocked / Questions / Next Actions) -->

# docs/TODO.md

> **목적:** AI ↔ 사용자 매개. 차단 상태가 아닌 질문·확인 항목은 여기에 누적 후 자연스러운 타이밍에 일괄 전달.

## Completed (최근 3개)

- [x] Sprint 1 D-3 — 랜딩 5섹션(Hero/KPI/Story/ArticleGrid/Partners) Figma 정합 + (public)/page.tsx 조립 + SEO metadata + cacheComponents 적용 + designer P1 토큰화 (2026-05-28, 4 commits)
- [x] Sprint 1 D-4 — F3 폴더 + 디자인 토큰 + SUIT 폰트 + 공통 컴포넌트 11종 + Route Group (2026-05-27, 9 commits)
- [x] D-4 Multi-Agent 검증 + ITERATE verdict → P0 7건 처리 완료

## Blocked

- 없음

## Questions / 사회공헌국 escalation

### H-2 — 푸터 종교 법인명 위치 ([확인 필요, 미회신 유지])

> 출처: D-4 multi-agent 검증 human 페르소나 narrative (CONFUSED 모드, 신뢰 4/10).

- 현재 (D-3 정합 후): `src/client/layouts/PublicFooter.tsx`는 BI 로고 + 세로 라인 + "COPYRIGHT 2026 © Sow Good All rights reserved." 만 표시 (Figma 126:10897 정합). **법인명은 미표시 상태 유지.**
- **갈등:** ADR-004 (포교 금지 절대 제약) vs 법적 의무 (법인명 표시 투명성).
- **옵션:**
  - A) 미표시 유지 — Figma 시안 정합, 포교 금지 가장 강하게 준수.
  - B) 푸터 최하단 작은 글씨 추가 — 법적 표시 충족.
  - C) About 페이지 분리 (v1.1) — 1차 범위 외.
- **결정 주체:** 사회공헌국 단독 (ADR-004 절대 제약). **D-3 시점 회신 없음 = A 옵션 유지.**

### H-3 — Banner "참여하기" 카피 ([Resolved 2026-05-28])

- **결정:** Figma 원본 카피 "이야기 보러가기" 적용 (사용자 결정, D-3 plan v3).
- Banner는 D-2 소식 페이지(목록·상세)에서 본격 작성 — D-3 범위 아님. /news 라우팅 의미 정합 확보.

### 추가 escalation (D-3 진행 상태 갱신)

- [x] **Pagination active 색** — H-1 결정 완료 (2026-05-27).
- [x] **홈 페이지 placeholder 카피** — D-3 본격 구현 완료 (5섹션 Figma SSoT 정합). placeholder 제거.
- [x] **favicon 자산** — `src/app/icon.svg` + `public/favicon.ico` (Sow Good 로고 SVG 기반 임시). 추후 ICO 변환 권고.
- [x] **헤더 배경 디자인** — D-4 완료 (`bg-brand-bright` #B769FF Figma 정합).

### 신규 escalation 후보 (D-2 진입 전)

- [ ] **Gmarket Sans Medium woff2 폰트 자산** — HeroBanner 슬로건 60px 전용. 현재는 SUIT Heavy fallback chain. 라이센스·조달 후 `public/fonts/`에 추가 + `src/app/layout.tsx` `next/font/local` 등록.
- [ ] **KPI 값 운영자 편집 분리 (v1.1)** — 현재 KpiSection은 Figma 시안 값 인라인 상수 (45,217 / 38년 5개월 / 3,614 / 80,257). admin에서 편집 가능하도록 분리.
- [ ] **ArticleGridSection coverImageUrl seed 정상화** — DB news의 cover_image_url을 articlegrid-card{1~6}.png으로 seed 또는 시안 fallback 제거.

## Next Actions

### 즉시 (이 세션)

- [x] D-4 Atomic Update — checklist / design.md 토큰 / context-notes / AGENTS.md 동기화
- [x] **Figma SSoT 정합 작업 (2026-05-27 사용자 지적)** — Banner 삭제 + 홈 placeholder 빈화 + Footer Figma news-detail 정합 + `docs/design/README.md` 신규
- [ ] D-4 git push 사용자 승인 (현재 11 commits, `feat/sprint-1-d4-components` 브랜치)
- [ ] PR 생성 (사용자 승인 시)

### 다음 세션 (D-3 진입)

- [ ] ADR 후보 2건 작성 — ADR-025 (client/server barrel 분리) + ADR-026 (토큰 명명 namespace `--color-brand-*` `--color-ink-*` `--color-surface-*`) 또는 ADR-024 보강.
- [ ] `docs/tech.md` F3 다이어그램 마커 🆕 D-4 → ✅ D-4 전환 + `app/(public)/dev/components/` 추가.
- [ ] `src/client/sections/` 6 섹션 신규 생성 (HeroBanner + KpiSection + StorySection + FeaturedSection + ArticleGrid + Pre-Footer).
- [ ] `src/app/(public)/page.tsx` 빈 div → 디자인 시안 구현 (Figma 1920 landing 정합).
- [ ] **PublicHeader 2단 구조 도입** — Figma news-detail (93:8810) 명세: 상단 작은 회색 NAV (캠페인 CTA "함께 동행하기" 등) + 아래 흰 영역 큰 로고/4메뉴/검색.
- [ ] PublicHeader 배경 시안 정합 (현재 단순화 → Figma 실제 톤) + 비선택 메뉴 alpha 정합.
- [ ] 1920 landing 푸터 직전 보라/SNS 영역을 별도 섹션으로 분리 도입 (현재 PublicFooter 는 news-detail 단순 카피라이트만).
- [ ] Gmarket Sans Medium woff2 도입 (HeroBanner 슬로건 60px 전용).
- [ ] favicon 적용 (사회공헌국 BI 자산).

### 다음 세션 (D-2 진입)

- [ ] **Banner 컴포넌트 재작성** — Figma `125:8915` 명세 정합 (1440×132 가로 띠, 카피 "Sow Good — 따뜻한 진심을 담아 / 나누는 진실의 활동들을 소개합니다"). 소식 페이지 (목록·상세) 전용으로 layout 분리.

### D-4 후속 디자인 P1 (D-3 진입과 병행 가능)

- [ ] `ArticleCard.tsx:132-133` shadow rgba(80,31,126,0.25) hex literal → `--shadow-card-hover` 토큰 추출.
- [ ] `FeaturedStoryCard.tsx:112` inactive 인디케이터 그레이 톤 `rgba(75,85,99,0.15)` 복원 + `--color-carousel-inactive` 토큰화.
- [ ] `FeaturedStoryCard.tsx:111` `transition-all` → `transition-[width,background-color]` 명시화.
- [ ] `StoryCard.tsx:22-25` Wrapper conditional href prop 누설 — `{...(href ? { href } : {})}` 패턴.
- [ ] `ArticleCard.tsx:102,112` "보도자료" hardcode → 중립 표현 (ADR-007 더미 라벨).
- [ ] `AdminSidebar.tsx:67-68` active matching `startsWith` → exact match (codex P3).

### v1.1+ 백로그

- [ ] PublicFooter © 연도 자동 갱신 — BUILD_TIME 환경변수 또는 빌드 스크립트.
- [ ] HeroBanner 60px 슬로건에 Gmarket Sans Medium 본격 도입.
- [ ] PublicHeader 검색 기능 본격 구현 (ADR-011 1차 범위 외).
