<!-- 현재 세션 미해결 항목 — global.md §2 형식 (Completed / Blocked / Questions / Next Actions) -->

# docs/TODO.md

> **목적:** AI ↔ 사용자 매개. 차단 상태가 아닌 질문·확인 항목은 여기에 누적 후 자연스러운 타이밍에 일괄 전달.

## 진행 중 (2026-06-03)

- **랜딩 실데이터화 + 반응형 4-BP 정합** — `docs/plans/active/2026-06-03-landing-data-responsive.md` (branch `feat/client-foundation`). WS1 시드 실데이터화(사진 11장→MinIO) + WS2 슬롯 썸네일 + WS3 ArticleGrid 호이스트 + WS4 RQ /news 목록 캐시(useSuspenseQuery 안정 패턴) + WS5 7면 4-BP 정합. **스키마 변경 없음.**
  - 🔴 **사진 11장 수령 대기** — `src/db/seed-assets/`에 넣으면 시드가 자동 업로드 (아래 2026-05-30 조달 항목과 동일 건). KPI 보라 카드 1장만 `public/images/` 덮어쓰기.
  - Gmarket Sans Medium: **라이선스 확인 필요** (사용자 결정 2026-06-03) — 확보 시 next/font/local 로드, 그 전까지 SUIT 폴백 + clamp 재튜닝.

- **어드민 v1.0 ship-전 하드닝** — `docs/plans/active/2026-06-01-admin-ship-hardening.md` (branch `feat/admin-ship-hardening`). HIGH 6 + 접근성 + 모바일 카드뷰 + 아키텍처 옵션1. 다단 검토 GO-WITH-FIXES + codex v2 교정. **스키마 변경 없음.**
  - **상태: 코드 완료** — A1~A8·B1~B4·C1·D1·D2 구현. 자동 게이트 통과(src tsc 0·Next compile 성공·lint·단위테스트 31). ADR-030/031/032 기록. 커밋·수동 검증 대기.
  - 잔여 수동 검증(`pnpm dev`, docker 가동 중): A1 5케이스(draft/타카테고리/발행해제/카테고리변경/null해제)·A2 동시저장·A3 계정삭제 후 세션 무효화·C1 375px 카드뷰.
  - 아래 §"Sprint 2 후속"의 *에러박스 대비 AA*는 본 작업 A4(색대비 토큰 ink-date #959ba9→#6f7682)에서 함께 점검, *NewsTable 윈도잉*은 v1.1 유지(rank22 — flex-wrap 경미 완화만 적용).
  - **[해결] R7** — story 슬롯(어드민이 고르는 글 2개)이 공개 StorySection에 미연결이던 버그 수정. 사용자 확인 "변경하면 반영돼야 함" → StorySection이 지정 글 대표 이미지 노출(클릭 시 소식 이동), 미지정 시 기본 사진 폴백. `StorySectionWithData`가 `listStorySlots` 연결. 4-2 이제 완전 FULLY.

## 배포 전 필수 (🔴 차단성)

- [x] **`next build` 타입체크 블로커 해소 (2026-06-01)** — pre-existing `templates/` 스캐폴드(PR #9)가 tsconfig `**/*.ts` 에 포함돼 빌드 실패하던 것 → tsconfig `exclude` 에 `templates` 추가. `pnpm tsc`·`pnpm build` 모두 그린(exit 0). **후속(v1.1): templates monorepo 구조 재정비(PR #9) — 사용자 메모 "추후 구조 다시 잡아야".**
- [x] **모노레포/폴더 구조 결정 (2026-06-02, ADR-033)** — velog 4부작(Nx·Turbo·pnpm) 교차검증 + 5옵션 점수화(AI-DevX 우선). 결론: 현행 **F3 단일앱 유지**가 v1.0/근미래 최적(OPT-2 8.34 > OPT-1 8.13, OPT-3/5 fails·OPT-4 weakened). velog와 **갈리지 않음**(직교+철학 수렴), template과도 거의 일치. **마이그레이션 부채(v1.1+, 보류)** — 복합 트리거(팀≥3 OR CI 빌드병목 실측 OR web/admin 독립배포 케이던스) 발화 시에만 F2(pnpm→측정후 Turbo, **Nx 금지**)로. 도메인수 7개 단독으로는 발화 금지. 상세 `docs/decisions.md` ADR-033.
- [ ] **A7 — 로그인 rate limit** — Vercel Firewall rate-limit 룰을 `/api/auth/*` 에 적용(코드 0). 단일 super 브루트포스·credential stuffing 방어. 배포 대시보드 설정. (Vercel 배포 확정 — 2026-06-01)
- [ ] **AUTH_SECRET 강도** — 32바이트+ 시크릿 강제·회전(rank20). 임시 어드민 비번 변경(`admin@ffwpu-social.local`).

## Completed (최근 3개)

- [x] **Figma SSOT 재동기화 (2026-05-30)** — 사용자 3 노드 ID 재공유 기반. 홈 1920/1024 자식 frame ID 갱신 (`331:7984`·`332:9254`) + 1439 폐기 + 소식 Banner 정식 등장 카피 갱신. `docs/design.md` / `docs/design/README.md` / `docs/current.md` / `docs/TODO.md` 4파일 일관화. 사용자 조달 대기 항목 ↓ "Next Actions" 등록.
- [x] Sprint 1 D-4 — F3 폴더 + 디자인 토큰 + SUIT 폰트 + 공통 컴포넌트 11종 + Route Group (2026-05-27, 9 commits)
- [x] D-4 Multi-Agent 검증 + ITERATE verdict → P0 7건 처리 완료

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

### ~~H-3 — Banner "참여하기" 카피 의미 합의~~ ✅ 자동 종결 (2026-05-30)

> **종결 사유:** 신 Figma 동기화 (95-9359 Banner `125:8915` 외 4 BP 인스턴스) 결과 Banner 에 *CTA 자체가 제거*되고 안내 카피만 남음 — "참여하기" 링크의 의미 충돌이 *디자인에서 사라짐*.
> 신 카피 — `Sow Good 가족이 아니어도, 같은 동네가 아니어도, 밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다.`
> 코드 정합 작업은 아래 §"Next Actions" `Banner 컴포넌트 재작성` 으로 이관.

### 추가 escalation 후보 (D-3 진입 전 확정 권장)

- [ ] **Pagination active 색** — H-1 결정 완료 (Figma 명세 `text-brand-primary` 무배경, 2026-05-27 사용자 확정). [확정됨]
- [ ] **홈 페이지 placeholder 카피** — D-4 의 "준비 중" 임시 카피는 D-3 디자인 시안 적용 시 본격 구현으로 교체 예정. 시안 미수령 시 사회공헌국 카피 확정 필요.
- [ ] **favicon 자산** — Sow Good BI 기반 favicon 사회공헌국 제공 또는 사내 제작.
- [ ] **헤더 배경 디자인** — 코드 현재 `bg-white/90` vs Figma 명세 `#B769FF` (brand-bright 보라). D-3 시안 적용 시 Figma 정합 권고.

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

### 다음 세션 (D-3 + 소식 페이지)

- [ ] **Banner 컴포넌트 재작성** — Figma `125:8915` 명세 정합 (1440×132 가로 띠, 카피 **"Sow Good 가족이 아니어도, 같은 동네가 아니어도, 밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다."** — 2026-05-30 갱신, 옛 카피 "따뜻한 진심을 담아" 폐기). CTA 버튼 **없음** (디자인 변경). 소식 페이지 (목록·상세) 전용으로 layout 분리. 4 BP 인스턴스 = `106:9112` / `125:8915` / `125:10430` / `125:13075` / `135:11713` / `135:12492`.

### 2026-05-30 신 Figma 동기화 후속 — 사용자 조달 대기 (🔴 차단성)

> 사용자 결정 2026-05-30 — "사회공헌국 원본 + 파트너 BI 모두 사용자가 전달". 도메인 절대 제약 §7 "스톡이미지 가득한 기업 홍보 톤 금지" 정합.
>
> **현재 상태 (2026-05-30 23:06):** Figma 디자이너 더미 16장이 *이전 D-3·D-4 작업으로 이미 `public/images/` 에 배치돼 있었음*을 발견. 사용자 결정 (회색 placeholder 즉시 교체) 에 따라 **16 파일 모두 1×1 #E5E7EB 회색 PNG (69B) 로 교체 완료**. 원본 디자이너 더미는 `docs/design/figma-dummy-backup/` 에 영구 보존 (gitignore 등록 — repo 미반영, 7일 URL 만료 대비 로컬 캐시 차원). 시각 사이트는 D-3 시안 진행 시 빈 회색 자리로 표시되어 *교체 잊지 않게 강제*. 사용자 사진 수령 시 동일 파일명으로 덮어쓰면 production 반영.

- [ ] **사회공헌국 봉사 현장 원본 사진 11장** 사용자 조달 (Dropbox/Drive/zip 일괄 권장)
  - KPI 보라 카드 사진 1장 (`96:9925` 슬롯, 1920×2571 retina 권장)
  - Story 카드 사진 2장 (`97:7549` 916×786 + `97:7548` 572×768)
  - ArticleGrid 카드 사진 6장 (`96:7888`·`96:7889`·`96:7891`·`96:7892`·`96:7894`·`96:7895`, 556×436 ~ 556×830 다양)
  - Featured 카드 본문 이미지 1장 (`125:9054` image 50, 916×786 retina)
  - (별도) 소식 상세 본문 이미지는 어드민 Tiptap 업로드로 조달 — 슬롯 #18, 사용자 조달 대상 아님
- [ ] **파트너 BI 5장** 사용자 조달 (`image 37~42`, 86~218×31~53 PNG/SVG)
  - 노드 `96:7958` (218×31) / `96:7960` (183×53) / `96:7962` (164×38) / `96:7964` (86×33) / `96:7966` (173×52)
- [x] **1920 BP 자식 섹션 ID 재추출** (2026-05-31 완료) — `331:7985`/`8061`/`8123`/`8155`/`8174`/`8245` 로 `docs/design.md` 표 1920 컬럼 채움.
- [x] **1024 BP 자식 섹션 ID 재추출** (2026-05-31 완료) — `332:9255`/`9331`/`9393`/`9425`/`9444`/`9517`. *주의:* 1024 PartnersSection 은 6 슬롯 2×3 그리드로 표시되지만 `image 38` 이 슬롯 #3·#5 중복 — 디자이너 placeholder 채우기로 운영은 5장 유지.
- [x] **screenshots/ 갱신** (2026-05-31 완료) — `landing-331-7984-1920px.png` + `landing-332-9254-1024px.png` 신규 캡처. 옛 3장 (`landing-126-11815-1920px.png` / `landing-126-10980-1024px.png` / `landing-126-11398-1439px.png`) 은 `docs/design/screenshots/legacy/` 이동.

### D-4 후속 디자인 P1 (D-3 진입과 병행 가능)

- [ ] `ArticleCard.tsx:132-133` shadow rgba(80,31,126,0.25) hex literal → `--shadow-card-hover` 토큰 추출.
- [ ] `FeaturedStoryCard.tsx:112` inactive 인디케이터 그레이 톤 `rgba(75,85,99,0.15)` 복원 + `--color-carousel-inactive` 토큰화.
- [ ] `FeaturedStoryCard.tsx:111` `transition-all` → `transition-[width,background-color]` 명시화.
- [ ] `StoryCard.tsx:22-25` Wrapper conditional href prop 누설 — `{...(href ? { href } : {})}` 패턴.
- [ ] `ArticleCard.tsx:102,112` "보도자료" hardcode → 중립 표현 (ADR-007 더미 라벨).
- [ ] `AdminSidebar.tsx:67-68` active matching `startsWith` → exact match (codex P3).

### Sprint 2 (어드민 마무리) 후속 — 전역/저우선

- [ ] 에러 박스 대비 검증 — `text-destructive` on `bg-destructive/5` 가 WCAG AA(4.5:1) 경계선. NewsTable·KpiEditor·AccountManager·StoryStatsEditor·HeroOrderManager 공통 패턴 (신규 파일 고유 아님). 전역 1회 검증 후 필요 시 `font-medium` 또는 토큰 1단계 상향. (designer Slice4 Should-fix #2)
- [ ] `NewsTable.tsx` 페이지네이션 윈도잉 — 현재 `Array.from({length: totalPages})` 전체 렌더. 글이 30+ 페이지가 되면 모바일 가로 오버플로. 현재 9건(1페이지)이라 미발현. first/prev/…/next/last 윈도잉으로 교체. (latent, 데이터 증가 시)
- [ ] 랜딩 반응형 2차 후속 정리 — `public/icons/hero-banner-background.svg` 미참조 에셋 제거(Hero 곡선 제거로 고아). `globals.css` `--color-surface-tint-soft` 주석 "Hero·Partners" → "Partners" 로 정정(Hero 미사용). 저우선.

### v1.1+ 백로그

- [ ] PublicFooter © 연도 자동 갱신 — BUILD_TIME 환경변수 또는 빌드 스크립트.
- [ ] HeroBanner 60px 슬로건에 Gmarket Sans Medium 본격 도입.
- [ ] PublicHeader 검색 기능 본격 구현 (ADR-011 1차 범위 외).
