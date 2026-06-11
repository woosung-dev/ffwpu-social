---
status: active
opened: 2026-06-11
branch: feat/nav-consolidation-grid-category
slice_id: TASK-20260611-nav-grid-category
spec_status: confirmed
brainstorming_done: 2026-06-11
related_adr: 0038
---

# 헤더 내비 통합·클릭 가능화 + ArticleGrid 전 카테고리 개방

> 디테일·결정 근거는 ADR-038(`docs/decisions.md`). 본 파일은 실행 체크리스트 + context notes.

## 배경

사용자 스크린샷 3장(2026-06-11) — ① 헤더 4메뉴 클릭 불가(ADR-037) → 3메뉴 통합 + 클릭 가능(모바일 포함), ② "활동 스토리" = 하단 카드 그리드 식별, ③ 어드민 하단 ArticleGrid 슬롯 쌀 나눔 한정 → 전 카테고리.

## 확정 결정 (사용자 승인)

- 쌀 나눔 소식 클릭 → 랜딩 `#story` 스크롤(페이지 이동 아님).
- 모바일 = 현재 위치 알약(▾) → 드롭다운(option C).
- 어드민 = 하단 ArticleGrid(featured 7슬롯)만 전 카테고리, 상단 StorySection(story 2슬롯) 쌀 나눔 유지. 자동 fallback도 전 카테고리.
- 메뉴↔섹션: 임팩트 데이터→`#kpi` / 쌀 나눔 소식→`#story` / 활동 스토리→`#stories`. "활동 스토리" /news active 고정.

## 체크리스트

- [x] A. `PublicHeader.tsx` — MENU 3항목(section 필드) + 데스크탑 `<Link>` 클릭 + 모바일 Radix 드롭다운(현재 항목 체크·44px)
- [x] A. `globals.css` — `scroll-padding-top`(56/72/88) + `scroll-behavior: smooth` + prefers-reduced-motion
- [x] A. `useScrollSpy.ts` — `ResizeObserver` 추가(Suspense 스트리밍 후 active stale 버그 수정)
- [x] C. `slot-rules.ts` — `storySlotEligible`/`featuredSlotEligible` 분리 + `slotsToClearOnTransition {hero,story,featured}`
- [x] C. `news/db.ts` — `setLandingSlot` kind 분기 + `clearStorySlot`/`clearFeaturedRank`
- [x] C. `news/service.ts` — `updateNews` 정리 분기
- [x] C. `news/actions.ts` — ineligible 메시지 kind 분기
- [x] C. `landing/db.ts` — `listFeaturedGrid` rice 필터 제거 + `listAllPublishedCandidates` 신규
- [x] C. `LandingSlotManager.tsx` — 후보 2종 분리 + 카피
- [x] C. `admin/(panel)/landing/page.tsx` — 후보 2종 fetch + 슬롯 매핑 분리 + 카피
- [x] C. `slot-rules.test.ts` — 신규 형태 갱신
- [x] 문서 — ADR-038, domain.md §4·§5, page.tsx:65 주석
- [x] 검증 — tsc0·lint0·test54·build✓ + 헤더 데스크탑/모바일 라이브
- [ ] 커밋 → 푸쉬 → PR (사용자 승인 대기)

## Context Notes

- **eligibility 분리 이유**: story·featured가 단일 `landingSlotEligible`을 공유했음. 사용자는 하단(Image #3)만 전 카테고리 원함 → `storySlotEligible`(쌀 나눔 유지) / `featuredSlotEligible`(발행만)로 분리. `slotsToClearOnTransition` 반환을 `{hero,story,featured}`로 확장해 카테고리 변경 시 featured는 유지, story만 해제.
- **useScrollSpy stale 버그**: scroll/resize 에만 재계산 → Suspense 콘텐츠가 mount 후 스트리밍되며 섹션 위치가 바뀌면 초기 최상단 active가 잘못 잡힘(모바일 라벨 "활동 스토리"로 오표시). `ResizeObserver(document.documentElement)`로 문서 크기 변화 시 재계산해 해결. 라이브 확인: 최상단 "임팩트 데이터" 안정.
- **스키마 변경 0** — 컬럼 그대로, 쿼리 필터·eligibility만 완화. 마이그레이션 불필요.
- **라이브 검증 수치**: 데스크탑 클릭 시 `#stories` top=88(헤더 높이) 안착, active 전환 OK. 모바일 드롭다운 3항목 각 44px, 선택 시 `#story` top=56 안착·닫힘·라벨 동기화. 가로 오버플로 없음.

## Open Items (사용자 확인)

- Image #2: Hero/ArticleGrid CTA를 "활동스토리 살펴보기"로 리네임할지 — 현재 미변경.
- 메뉴 라벨 띄어쓰기: Figma 기준 "쌀 나눔 소식"·"활동 스토리"(공백 유지). 공백 없는 표기 원하면 1줄 수정.
- 어드민 라이브(로그인+데이터) 전 카테고리 노출은 코드·빌드·테스트로 검증 — 머지 전 운영자 1회 수동 확인 권장.
