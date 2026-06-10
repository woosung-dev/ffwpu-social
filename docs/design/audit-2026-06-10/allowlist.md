<!-- Figma 정합 감사용 의도적 이탈 allowlist — Evaluator 오탐 필터 기준 (audit 2026-06-10) -->

# 의도적 이탈 Allowlist

> Figma 와 코드가 다르지만 **문서화된 결정에 의해 의도적으로 다른** 항목.
> Evaluator 는 아래 항목과 일치하는 diff 를 "버그"가 아닌 "의도적 이탈(allowlisted)"로 분류한다.
> 기반 브랜치: `feat/news-heart-bottom-fidelity` = main + PR #40(feat/figma-fidelity-sweep) 머지 — PR #40 의 정합 수정(헤더 4BP·검색 아이콘 복원·Gmarket Sans·섹션 패딩·Featured airy)은 이미 포함됨.

| # | 표면/요소 | Figma 명세 | 구현 결정 | 근거 |
|---|----------|-----------|---------|------|
| 1 | /news 검색·정렬 툴바 | Figma 미존재 (검색 UI 없음) | 탭 1행 + 검색·정렬 2행 추가 | ADR-036 · review-news-search-2026-06-07.md |
| 2 | /news 정렬 기능 | 정의 없음 | 최신순/제목순 추가 | ADR-036 Decision 2-bis |
| 3 | /news 검색 대상 | 정의 없음 | 제목+태그 ILIKE | ADR-036 Decision 1 |
| 4 | 헤더 메뉴 인터랙션 | 클릭 앵커 스크롤 + 스크롤스파이 | 위치 인디케이터(클릭 불가 span) + 스크롤 자동 활성화 | ADR-037 Decision 1·4·5 |
| 5 | 헤더 검색 아이콘 | 존재 | **PR #40 에서 복원됨** — 이 브랜치에는 존재. 없으면 버그 | PR #40 (ADR-037 Decision 3 을 PR #40 이 번복) |
| 6 | 헤더 메뉴↔섹션 매핑 | — | 임팩트데이터→KPI / 소식→Story / 프로젝트→ArticleGrid | ADR-037 Decision 4 |
| 7 | 랜딩 ArticleGrid 마조네리 | 3열 마조네리 | CSS `columns-*` 구현 (Grid masonry 미지원) | ADR-035 Decision 5 |
| 8 | KPI 섹션 2단 전환 | 1025 프레임 = stacked | side-column 2단은 wide(1440)부터, 1024~1439 stacked | review-final-2026-06-04.md · Figma 1025 프레임 기준 |
| 9 | ArticleGrid 다크블록 | 1440 side | wide(1440)부터 side, 1024 는 상단 배너 | review-final-2026-06-04.md |
| 10 | Story 통계 배열 | 1440 가로 2단 | 모바일/태블릿 세로 배열 | review-final-2026-06-04.md |
| 11 | 날짜 텍스트 색 | #959BA9 | #6F7682 (`--color-ink-date`, WCAG AA 4.58:1 상향) | audit-report.md §4 · 접근성 절대 제약 |
| 12 | 헤더 흰 글자 on #B769FF | AA 미달 3.24:1 | Figma 정확 우선으로 수용 (문서화) | review-final-2026-06-04.md 알려진 한계 |
| 13 | KPI 375 데코(+/꽃) | 노출 | sm(640)+ 에서만 노출 — 375 가로스크롤 0 우선 | review-final-2026-06-04.md |
| 14 | Story 데코 일러스트 | 전 BP 존재 | lg+ 에서만 노출 | audit-report.md §9 |
| 15 | /news 카드 그리드 열 | 768 = 2열 | 375 1열 / 640~767 2열(sm 예외) / 768 2열 / 1024+ 3열 | ADR-035·036 · news_responsive_bp |
| 16 | /news 히어로(Featured) 3단 | 768+ 정상 | 375 스택 / 640~767 좌우반전(sm 예외) / 768+ 정상 | news-landing-responsive 결정 |
| 17 | 토큰 체계 | Figma Variables 3개 | 코드 60+ 의미 토큰 (globals.css @theme) | audit-report.md §4 |
| 18 | discrete 구간 고정 | — | 구간 내 고정값 + BP 분기 (연속 vw 스케일 금지) | kpi-hero-fidelity-criteria.md §0 |
| 19 | Gmarket Sans | Hero 슬로건 60px | **PR #40 에서 셀프호스팅 적용됨** — 이 브랜치에서 실 렌더 | PR #40 (SIL OFL) |
| 20 | 소식 상세 하트 위치 | **B 시안 = 하단 공유줄 우측 필 버튼** | 본 감사에서 A(상단)→B(하단) 이동 구현 — 상단에 하트가 있으면 버그 | 사용자 결정 2026-06-10 · Figma 749:7920 |
| 21 | 소식 상세 공유 버튼 | 카카오톡·페이스북·링크 3개 원형 | navigator.share + 링크복사 2개 — 카카오 SDK 등 브랜드 버튼은 v1.1 보류 | share-row.tsx 코드 주석 (기존 결정) — 단 report 에 차이 명시 |

## 측정 시 주의 (아티팩트 — diff 가 아님)

1. **이미지 placeholder**: 사진 16장이 1×1 회색 PNG placeholder (사회공헌국 원본 조달 대기) — 이미지 내용·비율 비교 금지, 컨테이너 박스만 측정.
2. **스크롤바**: 측정 시 스크롤바 숨김 전제. 뷰포트 폭 측정값에 스크롤바 ~15px 오차 주의.
3. **폰트 렌더**: line-height 자동 계산 차이 ±1~2px 는 허용오차 내. 글리프 폭 차이는 diff 아님.
4. **Next.js dev 오버레이**: 좌하단 N 배지는 dev 전용 — 무시.
5. **카드 커버 비율**: 실 데이터 이미지 비율 가변 — aspect-ratio 어서션 금지, 그리드 칸 치수만.
6. **경계값**: 코드 BP 는 375(기본)/640(sm 예외)/768(md)/1024(lg)/1440(wide). Figma 1025 프레임 = lg(1024+) 구간 대표. 1px 경계 차이는 diff 아님.
7. **헤더 active 메뉴**: 스크롤 위치 기반 — 측정 시점 스크롤 위치에 따라 다름.

## 허용오차

- 박스 치수·간격·패딩: **±2px**
- 폰트 크기: **0px** (정확 일치), line-height ±2px
- 색: 토큰 매핑 후 정확 일치 (#11·#12 예외)
