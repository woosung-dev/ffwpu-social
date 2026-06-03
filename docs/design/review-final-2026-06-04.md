<!-- Figma 픽셀 정합 최종 검수 — 2-루프 적대적(Playwright 캡처 ↔ 고해상 Figma SSoT 컨테이너 대조) + 수정 + CSS 현대화. branch review/figma-fidelity-3 → PR base feat/client-foundation -->

# Figma 픽셀 정합 최종 검수 리포트 (2026-06-04)

> 브랜치 `review/figma-fidelity-3` (분기점 `review/landing-fidelity-2`). base=`feat/client-foundation` PR.
> 방법: Playwright MCP 라이브 캡처(10 뷰포트) ↔ 고해상 Figma SSoT(`figma-export/` 8 BP, `screenshots/` 소식) **컨테이너 단위** 대조 + 2-루프 적대적 검증(메인 세션 + 60·16 에이전트 워크플로우).

## 핵심 루트 코즈 (이번 검수의 최대 발견)

**데스크탑 side-column 레이아웃이 `lg`(1024)에서 너무 일찍 전환됐다.** Figma 는 1024~1439 까지 stacked(헤딩/배너 top + 풀폭 콘텐츠), **1440(`wide`)에서만** side-column. content max-width(1264) 상 2-col 이 1440 미만에선 안 들어가기 때문. KPI·ArticleGrid 두 섹션이 동일 증상 → `lg`→`wide` 로 정정. (1024~1439 구간 "디자인이 안 맞는다"의 주원인)

## 수정 내역 (commit 단위)

| # | 섹션 | 수정 | 검증 |
|---|------|------|------|
| 1 | **Story** | 통계 3컬럼 라벨/값 세로 순서 swap (Figma=라벨 위·값 아래) | 1440 zoom·v3 ✅ |
| 2 | **KPI** | 2단 전환 `lg`→`wide`(1024~1439 stacked 복원) · 375 헤딩 `text-center md:text-left`+`text-2xl md:text-3xl` · 누적봉사자수 +/꽃 데코 `lg`↑ 노출 · 보라 사진카드 높이 `clamp(<wide)`+`wide:423`(lime 과대높이 완화) | 375/1024/1280/1440 ✅ |
| 3 | **Hero** | `lg:items-end`→items-center(상중단) · `lg:py-[100px]`→`lg:py-[60px]` · flower `clamp 560`→`420(28vw)`. 1440 711→554px, 1024 574→428px | 1024/1440 ✅ |
| 4 | **Header** | nav+드롭다운+검색 우측 클러스터화(justify-between 2분할) · 검색 아이콘 `white/60`→`brand-primary/70`(Figma 어두운 아이콘) | 1440 ✅ |
| 5 | **ArticleGrid** | 다크블록 side 전환 `lg`→`wide`(1024 풀폭 배너) · 마조네리 `md:columns-2`→`3`(768 3열) · 카드 portrait aspect `lg`→`md` · 헤딩 `break-keep` | 768/1024/1440 ✅ |
| 6 | **CSS 현대화** | 하드코딩 hex → 토큰: `GRADIENT_STYLE`→`var(--color-gradient-*)` · `#959ba9`→`text-ink-date`(WCAG) · `bg-[#fafafa]`→`bg-surface-card` · `bg-[#f2eff4]`→신규 `--color-surface-news-banner` | 시각 무변 ✅ |

## 검증 (완료 기준) ✅

- `pnpm tsc --noEmit` **0** · `pnpm lint` **0** · `pnpm test` **31 통과** · `pnpm build` **그린**
- 가로스크롤 **0**: 랜딩 320/375/640/767/768/1024/1280/1440/1920 · /news 375/767/768/1025/1440 · 상세 375/768/1440 전부 0
- 회귀 가드: **1440 KPI 952px(2단·헤딩 251px)·Story 612px·ArticleGrid 954px·Footer 전부 보존** 확인 (loop-2 의 "1440 lime 회귀" 주장은 1024 크롭 기반 오추론 — 실측 반증).

## 알려진 한계 / 수용 (수정 안 함, 문서화)

| 항목 | 사유 |
|------|------|
| Hero h1 폰트(Gmarket Sans) | 파일 미보유 → SUIT 렌더. 라이선스/파일 확보 후 후속. |
| Story 좌측 "Sow Good" 캘리그래피 장식 | 디자인 에셋 미보유. 현재 star/heart SVG 로 대체. |
| News Featured 상단 가정연합 엠블럼(Figma) vs 카테고리 pill(Live) | 데이터/에셋 결정 필요 — 사회공헌국 확인. |
| 파트너 로고 PNG baked-in 라벤더 배경 | 원본 PNG 에 배경 포함 — 무배경 에셋 재요청 필요. |
| KPI 375 누적봉사자수 +/꽃 데코 | 375(<640) 좁은 카드 overflow 회피 위해 `sm:flex`(640↑) 유지. 가로스크롤 0 우선. |
| Hero CTA·모바일 pill 375 크기, 헤더 흰글자 대비 | Figma 정확 우선 결정(사용자) — 의도적 a11y 부채. |
| 소식 상세 375/768 | Figma ground truth 1440 만 존재 → 구조·가로스크롤만 보장(`[추론]`). |

## 디자인 아티팩트 주의

- 스크린샷의 검은 원형 **"N" 배지**는 Next.js dev-mode 오버레이 — **프로덕션 빌드에서 사라짐**(실제 결함 아님, 다수 오탐 정리).
- 소식 카드 일부 보라 그라디언트 = cover 이미지 없는 글의 placeholder(seed 미적재). 레이아웃은 정상.

## 2-루프 적대적 재검증 요약 (Phase 6, 16-에이전트 워크플로우)

### loop-2 가 확인한 해결(RESOLVED)
- Story 통계 라벨/값 순서 swap (375/768/1024 전부 ✅) · KPI 1024·768 stacked ✅ · ArticleGrid 768 풀폭 배너+3열 ✅ · HeaderHero nav 우측 클러스터·검색 색·hero 높이·flower 크기 ✅ · KPI 375 헤딩 중앙정렬 ✅.

### loop-2 가 추가로 잡아 **이번에 수정**한 것
- **Story 1024 구조** — KPI/ArticleGrid 와 동일 lg→wide 누락분. 이미지 상단 stacked 복원(commit `6722500`).
- **KPI 1024 lime 카드 과대** — 보라 사진카드 높이/gap 축소(<wide), 1440 보존(commit `274ae90`).
- **Hero flower 1024 과소축소** — 28vw→30vw 보정(commit `274ae90`).

### 잔여 (의식적 미수정 — POLISH/에셋/트레이드오프, 문서화)
| 항목 | 사유 |
|------|------|
| KPI 데스크탑 smile 카드 가로납작(Figma 정사각) | top-wrap 행 높이가 회색카드 콘텐츠에 종속 — 정사각화는 벤토 재구조 필요. POLISH. |
| KPI 375 +/꽃 데코 미노출 · 사진카드 제목 2줄 | 375(<640) 좁은 모바일 벤토 카드 — overflow 회피 `sm:flex` 유지. 가로스크롤 0 우선. |
| Hero 콘텐츠 1024 약간 낮음(items-center vs Figma top) | 시각 검수상 items-center 양호 판정 — top 과보정 시 768 에서 헤더 붙음(상충). 수용. |
| Hero 768 flower 헤더 일부 겹침 · nav 약간 우측 과밀 | 모바일 flower 절대배치(기존)·md 클러스터 미세. 사전 존재/경미. |
| Story 1024~1439 통계 위치(본문 아래 vs Figma 우측) | 이미지 상단 복원이 1차 — 통계 우측배치는 stacked 밴드 2차 분할 필요. 경미. |
| pill chevron · 검색 원형 보더 | 모바일 드롭다운 affordance(기능 필요)·검색 버튼 형태. 기능 우선. |
