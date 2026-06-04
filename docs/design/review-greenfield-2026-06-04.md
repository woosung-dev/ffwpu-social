<!-- 그린필드 재구현 차이점 리포트 (Phase 3) — Figma↔구현 델타·심각도·해결 + 검증 증거. branch feat/figma-greenfield-ui -->

# Difference Report — 그린필드 재구현 (2026-06-04)

> branch `feat/figma-greenfield-ui` (base `review/figma-fidelity-3`, baseline 태그 `baseline/figma-fidelity-3`).
> 방법: Figma 라이브 MCP 감사(audit-report.md) → 5-레이어 아키텍처(architecture.md) → 프레젠테이션 재구현 → 프로덕션 빌드 + Playwright per-BP 검증.
> 해결 enum: **FIX**(코드 수정) · **ACCEPT**(문서화된 트레이드오프) · **ASK**(사회공헌국 결정) · **INFERRED**(Figma SSoT 부재).

## 0. 결론

- **빌드/타입/린트/테스트 그린**: `pnpm build` 15/15 라우트(PPR), `tsc` 0, `lint` 0, `test` 31/31.
- **가로스크롤 0**: 랜딩 375/768/1024/1280/1440, /news 375/1440, /news/[id] 375/1440 전부 0.
- **하트 회귀 없음**: 토글 0→1 → 리로드 persist → 0 복귀(optimistic + 서버 reconcile + 세션 상태) 정상.
- **픽셀 정합 보존**: 라이브 렌더가 Figma ground truth(`figma-export/`·`screenshots/`)와 일치. 검증 캡처 `val-*.jpeg`.
- **핵심 판단**: 기존 구현이 이미 2-루프 정합 완료라 *외과적 클린 아키텍처 개선 + 재검증*으로 그린필드 수행. 검증된 반응형·하트·SSR 로직 보존(불필요 재작성 = 픽셀 회귀 위험, 사용자 #1 목표 침해).

## 1. 적용한 변경 (FIX — 아키텍처 개선)

| # | 변경 | 파일 | 근거 | 검증 |
|---|------|------|------|------|
| C1 | ArticleCard 슬림화 — 미사용 `state` prop·`none` 브랜치·hover 조건 제거 | `features/news/components/ArticleCard.tsx` | dead code(어디서도 `state` 미전달), anti-slop §1·§3 | /news 10 카드 정상, 동작 무변 |
| C2 | StoryCard → `MediaCard` 이동·리네임 | `client/components/media/MediaCard.tsx` (신) · `ArticleGridSection` · barrel | 랜딩 전용인데 features/news 에 있어 client→features 교차 의존. ADR-024/033 정합 | 랜딩 ArticleGrid 6 카드 마조네리 정상 |
| C3 | 소식 상세 DetailHeader 추출 | `[id]/detail-header.tsx` (신) | 200줄 페이지 가독성, 기존 colocation 패턴 일치 | 카테고리+제목+날짜+하트 렌더 |
| C4 | PrevNextNav 추출 + 이전/다음 4중 중복 DRY | `[id]/prev-next-nav.tsx` (신) | 중복 제거(AdjacentLink 헬퍼) | 목록/이전/다음 렌더 |
| C5 | 관련글 인라인 카드 → `ArticleCard size=3` | `[id]/page.tsx` | 중복 제거 + Figma 정합(관련글 = ArticleCard 인스턴스 `93:8868`) | 관련 3 카드 1440 3열/375 1열 |

> 신규 산출물: `audit-report.md`(Phase1) · `architecture.md`(Phase2) · 본 리포트(Phase3).

## 2. 의도적 비채택 (clean-architecture 후보 중 — YAGNI/경계/회귀 사유)

> architecture.md 초안이 제안했으나 *비용 < 위험*으로 보존 결정. CLAUDE.md §2(추상화 절제)·§3(외과적) 준수.

| 후보 | 비채택 사유 |
|------|------------|
| `CtaButton` 통합 | Hero(client/) ↔ Featured(features/news/) 2개가 **모듈 경계 분리**. 통합 시 ADR-033 위반(교차 import) 2회 사용 — 경계 넘을 가치 부족. 검증된 인라인 CTA 유지 |
| `SectionHeading` | 섹션별 사이즈/weight 의도적 변주(36/32/31) — 구조 추출의 실효 감소 + 단일 사용 |
| `StatList` | StorySection 단일 사용 → 추출 시 anti-slop 단일-사용 헬퍼 |
| `KpiCard` | KPI 카드 5종이 **구조적으로 이질**(smile/gray-stat/lime/yellow/purple-photo) + 모바일·데스크탑 2 트리. 슬롯 래퍼는 복잡도 비감소 + 검증된 벤토 BP 로직 회귀 위험(R6) |

## 3. Figma ↔ 구현 델타 (잔여 — ACCEPT/ASK/INFERRED)

| ID | 영역 | BP | Figma | 구현 | 심각도 | 해결 |
|----|------|----|-------|------|--------|------|
| D1 | Hero h1 폰트 | 전 | Gmarket Sans Medium 60 | SUIT 폴백 | medium | **ACCEPT** — 폰트 파일 미보유. 라이선스 확보 후 후속(D1-followup) |
| D2 | Header 텍스트 대비 | 전 | 흰 글자 on `#b769ff` (3.24:1) | 동일 | high(a11y) | **ACCEPT** — 사용자 "Figma 정확 우선" 결정. WCAG AA 미달 부채 명시 |
| D3 | Hero CTA 터치타깃 | 375 | py 작음(~40px) | 동일 | medium(a11y) | **ACCEPT** — Figma 정확 우선(사용자) |
| D4 | Story 데코(별·하트) | 375~1023 | 전 BP 존재 | `lg+`만 노출 | low(fidelity) | **ACCEPT** — 모바일 좁은 폭 overflow 회피(가로스크롤 0 우선). 데코 축소배치 재도입은 v1.1 |
| D5 | 소식 카드 cover | 목록 | 사진 | seed `news/seed/*.png` 미적재 → 400 → 그라디언트 placeholder | medium(data) | **ASK** — 사회공헌국 사진 11장 + MinIO 적재. 코드 정상(상세 cover 있는 글은 정상 렌더 확인) |
| D6 | 파트너 로고 | Partners | 무배경 | PNG baked-in 라벤더 배경 | low(asset) | **ASK** — 무배경 에셋 재요청 |
| D7 | 소식 상세 모바일 | 375/768 | **시안 부재**(1440 only) | 구조·가로스크롤 0 보장 | — | **INFERRED** — Figma SSoT 없음. 1440 + 검증된 모바일 컴포넌트 거동 기반 |
| D8 | News Featured 상단 엠블럼 | 목록 | 가정연합 엠블럼 | 카테고리 pill | low | **ASK** — 데이터/에셋 결정(carry-forward, review-final §알려진 한계) |

## 4. 심각도 매트릭스 (영역 × 잔여)

| 영역 | high | medium | low | 비고 |
|------|------|--------|-----|------|
| Header | D2(a11y) | — | — | 사용자 Figma 우선 |
| Hero | — | D1·D3 | — | 폰트 에셋·a11y |
| Story | — | — | D4 | 모바일 데코 |
| 소식 목록 | — | D5(data) | D8 | seed 적재 |
| Partners | — | — | D6 | 무배경 에셋 |
| 소식 상세 | — | — | — | 1440 정합 ✅ / 모바일 INFERRED(D7) |
| 토큰·구조 | — | — | — | 코드 > Figma(60+ 토큰) |

→ **코드 결함(FIX 필요) 잔여 0.** high/medium 전부 *사용자 결정* 또는 *에셋/데이터 차단*.

## 5. Carry-forward 수용 한계 (review-final-2026-06-04 계승)

D1(Gmarket)·D2(헤더 대비)·D4(Story 좌측 캘리그래피 → star/heart 대체)·D6(파트너 로고 배경)·D7(상세 모바일 추론)·KPI 375 데코 미노출·매직 px(ADR-035). 변동 없이 유지.

## 6. 검증 증거 (Playwright 라이브, 프로덕션 빌드 :3100)

| 페이지 | 1440 | 768/1024/1280 | 375 | 비고 |
|--------|------|---------------|-----|------|
| 랜딩 `/` | overflow 0 · 5섹션·MediaCard 6·KPI 12·Story 통계 | overflow 0 (전부) | overflow 0 | `val-landing-{1440,375}.jpeg` |
| 소식 목록 `/news` | overflow 0 · 카드 10·탭·페이지네이션 | — | overflow 0 · 카드 10 | `val-news-1440.jpeg` |
| 소식 상세 `/news/[id]` | overflow 0 · DetailHeader·태그 3·관련 3·PrevNext | — | overflow 0 · 관련 1열 | `val-detail-{1440,375}.jpeg` |
| 하트 | 0→1→reload persist→0 ✅ | — | — | optimistic+서버 reconcile |
| 콘솔 | 에러 = seed 이미지 400(D5)만, 코드 에러 0 | — | — | 사전 데이터 갭 |

> 검증은 프로덕션 빌드(`pnpm start` :3100) 라이브 Playwright 캡처로 수행(세션 임시 — 리포 미커밋). baseline 비교 오라클 = `baseline/figma-fidelity-3` 태그로 재현 가능.
