<!-- 현재 세션 미해결 항목 — global.md §2 형식 (Completed / Blocked / Questions / Next Actions) -->

# docs/TODO.md

> **목적:** AI ↔ 사용자 매개. 차단 상태가 아닌 질문·확인 항목은 여기에 누적 후 자연스러운 타이밍에 일괄 전달.

## Completed (최근 3개)

- [x] Sprint 1 D-4 — F3 폴더 + 디자인 토큰 + SUIT 폰트 + 공통 컴포넌트 11종 + Route Group (2026-05-27, 9 commits)
- [x] D-4 Multi-Agent 검증 + ITERATE verdict → P0 7건 처리 완료
- [x] Sprint 1 D-5 — 셋업 + DB + Auth + 3-Layer 골격 (2026-05-27, PR #1 머지)

## Blocked

- 없음

## Questions / 사회공헌국 escalation

### H-2 — 푸터 종교 법인명 위치 ([확인 필요])

> 출처: D-4 multi-agent 검증 human 페르소나 narrative (CONFUSED 모드, 신뢰 4/10).

- 현재: `src/client/layouts/PublicFooter.tsx` 푸터 최하단 작은 글씨에 "세계평화통일가정연합 신한국협회 사회공헌국" 단 1회 표시.
- **갈등:** ADR-004 (포교 금지 절대 제약) vs 법적 의무 (법인명 표시 투명성).
- **옵션:**
  - A) 푸터 최하단 작은 글씨 유지 — 법적 표시 충족, 사용자 첫인상 영향 미미.
  - B) 푸터 별도 섹션 또는 About 페이지 이동 — 포교 금지 강하게 준수, 단 법적 의무 위치 검토 필요.
- **결정 주체:** 사회공헌국 단독 (ADR-004 절대 제약).

### H-3 — Banner "참여하기" 카피 의미 합의 ([확인 필요])

> 출처: D-4 multi-agent 검증 human 페르소나 narrative + designer Banner 카피 D-3 확정 항목.

- 현재: `src/client/layouts/Banner.tsx` 의 "참여하기" 링크가 `/news` (소식 목록) 로 라우팅. 사용자는 봉사 신청 폼/캠페인 참가를 기대해 의미 불일치.
- **1차 범위 제약:** ADR-011 — 회원가입·문의 폼 없음, 검색 미구현.
- **옵션:**
  - A) "참여하기" 유지 + /news 라우팅 — 행동 유도 강함, 단 의미 불일치.
  - B) "소식 보기" 또는 "이야기 보러가기" 카피 변경 — 의미 정합, 행동 유도 약간 약화. **(권고)**
  - C) "참여하기" 유지 + 향후 봉사 신청 폼(v1.1) 라우팅 준비 — 미래 정합, 현재는 1차 범위 외.
- **처리 시점:** D-3 디자인 시안 적용 단계에서 Banner 카피 일괄 확정 시.

### 추가 escalation 후보 (D-3 진입 전 확정 권장)

- [ ] **Pagination active 색** — H-1 결정 완료 (Figma 명세 `text-brand-primary` 무배경, 2026-05-27 사용자 확정). [확정됨]
- [ ] **홈 페이지 placeholder 카피** — D-4 의 "준비 중" 임시 카피는 D-3 디자인 시안 적용 시 본격 구현으로 교체 예정. 시안 미수령 시 사회공헌국 카피 확정 필요.
- [ ] **favicon 자산** — Sow Good BI 기반 favicon 사회공헌국 제공 또는 사내 제작.
- [ ] **헤더 배경 디자인** — 코드 현재 `bg-white/90` vs Figma 명세 `#B769FF` (brand-bright 보라). D-3 시안 적용 시 Figma 정합 권고.

## Next Actions

### 즉시 (이 세션)

- [x] D-4 Atomic Update — checklist / design.md 토큰 / context-notes / AGENTS.md 동기화
- [ ] D-4 git push 사용자 승인 (현재 9 commits, `feat/sprint-1-d4-components` 브랜치)
- [ ] PR 생성 (사용자 승인 시)

### 다음 세션 (D-3 진입)

- [ ] ADR 후보 2건 작성 — ADR-025 (client/server barrel 분리) + ADR-026 (토큰 명명 namespace `--color-brand-*` `--color-ink-*` `--color-surface-*`) 또는 ADR-024 보강.
- [ ] `docs/tech.md` F3 다이어그램 마커 🆕 D-4 → ✅ D-4 전환 + `app/(public)/dev/components/` 추가.
- [ ] `src/client/sections/` 6 섹션 신규 생성 (Hero + KpiSection + ArticleGrid + StorySection + FeaturedSection + Footer).
- [ ] `src/app/(public)/page.tsx` placeholder → 디자인 시안 구현.
- [ ] PublicHeader 배경 `bg-brand-bright` (`#B769FF`) 정합 + 비선택 메뉴 `text-foreground/60` alpha.
- [ ] Banner 카피 사회공헌국 확정 + Gmarket Sans Medium woff2 도입.
- [ ] favicon 적용.

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
