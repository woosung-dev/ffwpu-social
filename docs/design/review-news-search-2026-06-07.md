# /news 검색 추가 — 디자인 검증 + 코드 검토 리포트 (2026-06-07)

> Generator-Evaluator 워크플로우 산출. plan: `docs/plans/active/2026-06-07-news-search.md` · 결정: ADR-036.
> 방법: Figma ground-truth(`docs/design/screenshots/news-list-*.png`) ↔ Playwright 라이브 캡처(`live-news-search-*.png`) BP별 대조 + 적대적 2-pass + Codex 교차 검토.

## 종합 판정: **PASS** (회귀 0, P0 1건 동반 수정, 적대 P1 2·P2 2 + Codex 1 수락·수정 완료)

## Phase 1 — Baseline (구현 전, BP 4종)

- 검색 input 은 우리 Figma `/news` 4 BP **모두에 없음**(1440 마스터 확대 확인) → 검색행은 신규 추가(familyfed 1323-8705 패턴 + 우리 토큰). ADR-016 갱신(ADR-036).
- 1440 마스터: 탭 좌측 정렬 + 우측 ~60% 공백 → 검색을 우측에 채우는 familyfed 패턴이 자연 정합.
- **P0 발견**: 카드 그리드가 768(`md:`)에서 3열. Figma 768 = **2열**. 로딩 skeleton 은 이미 `lg:grid-cols-3`(=2열까지 md) → 실 그리드 `md:grid-cols-3` 만 drift. → `lg:grid-cols-3` 으로 정정.

## Phase 3 — Regression (구현 후, 2-pass 적대적)

라이브 캡처 BP: 375 / 768 / 1025 / 1440 + 검색결과·빈결과·overflow.

| BP | 툴바 | 그리드 | 판정 |
|---|---|---|---|
| 375 | 탭 / 검색 **세로 스택** (검색은 탭 스크롤 영역 밖) | 1열 | PASS |
| 768 | 탭(좌)+검색(우) 한 줄, 하단선 정렬 | **2열** (P0 수정 확인) | PASS |
| 1025 | 탭(좌)+검색(우) 한 줄 | 3열 | PASS |
| 1440 | 탭(좌)+검색(우), 우측 공백 자연 충전 | 3열 | PASS |

- 인터랙션: `?q=` URL 반영 · 결과 필터 · 빈결과 "'…' 에 대한 검색 결과가 없습니다" · category+q+page 결합. 콘솔 **0 error**(1 warning = 기존 Hero LCP 힌트, 검색 무관).

**Pass 2 적대적 — 시각이 못 보는 결함(수락/적용):**
- **F1 (P1)** input 표시-상태 불일치 — `useState(defaultValue)` + key 부재. URL q 외부 변경 시 검색어 잔존 → `key={filters.q}` 리셋. *라이브 확인*: `?q=리셋테스트`→헤더 링크 클릭→input 비워짐.
- **F2 (P1)** page overflow 막다른 빈 화면 — `?q=x&page=5`(결과 1p) → service.listNews 마지막 페이지 재조회. *라이브*: `q=쌀&page=5`→8건/page=1.
- **F3 (P2)** 돋보기 클릭 IME 가드 우회 → `onSubmit` 에도 조합 가드.
- **F4 (P2)** 빈결과 `aria-live` 부재 → `role="status"`.
- **F5 (P2) 비수락** — input box-ring. underline 입력엔 `focus-within:border-brand-vivid` 색변화가 적합한 AA 인디케이터, 박스 링은 밑줄 스타일 충돌·AAA 미요구.

## Phase 4 — Codex 교차 검토

- **C1 (수락)** 반복 `q` 파라미터(`?q=a&q=b`)가 App Router 서버에서 `string[]` → `.trim()` throw → `/news` **500**. `firstParam` 으로 첫 값 흡수(category·page 동일 보강). *라이브*: 반복 q → HTTP **200**.
- 그 외(searchWhere EXISTS·likePattern 이스케이프·RQ 키 정규화·IME·N+1) 결함 미발견.

## 검증 증거

- tsc 0 · lint 0 · **vitest 47 pass**
- 라이브(PORT=3100): 전체 14 · q=쌀 8 · q=zzxq 0 · q=현장+rice_sharing 1(태그 매칭) · overflow clamp · 반복 q 200
- 스크린샷: `docs/design/screenshots/live-news-search-{375,768,1025,1440,1440-query,1440-empty}.png`

## 후속 정합 (사용자 피드백 2차, 2026-06-07)

사용자 지적: (1) 페이지 컨테이너가 랜딩의 밴드 고정폭 시스템과 불일치, (2) 카드 hover 모션 부재, (3) 검색 input focus 시 보라 밑줄이 familyfed와 불일치.

- **밴드 정합** — `/news` 3블록(SubBanner·Hero·"더 많은 소식")을 랜딩과 동일한 `SectionContainer`로 전환(기존 `container mx-auto px-4 lg:px-20` 폐기). 라이브 측정으로 밴드폭 일치 확인: **1440→1200 / 1025→905 / 768→648 / 375 유동**(SubBanner 내부 포함 동일). 그리드 열 3/3/2/1.
- **카드 hover** — `ArticleCard` 이미지 `group-hover:scale-105`(+`transition-transform`·`motion-reduce` 가드). 라이브 측정: hover 시 `scale` 1.0→**1.05** 부드러운 전환(v4 `scale` 속성, transition 에 scale 포함).
- **검색 input** — focus 시 보라 밑줄(`focus-within:border-brand-vivid`) 제거 → 밑줄 **중립 유지**(focus=blur 동일 색 확인). 키보드 포커스만 `has-[input:focus-visible]` subtle ring 으로 a11y 표시(마우스 비표시). familyfed PageSearchbar 일관.
- 검증: tsc 0 · lint 0 · test 47 · build green. 스크린샷 `live-news-search-v2-{1440,768,375}.png`.

### 탭 hover (사용자 피드백 3차, familyfed 463-2827)

- `CategoryTabs` — 하단 brand-vivid 라인을 `::after` + `origin-center scale-x` 로 전환. **inactive hover 시 라인이 가운데에서 양쪽으로 확장(center-out)** + 텍스트 Medium·ink-strong → **hover = active 동일 모습**. 라이브 측정: active `scale 1`(origin=탭 중앙) / inactive idle `scale 0 1` → hover `scale 1`, hover fontWeight 500.
- 높이 균일화 — 기존 active 56·inactive 46 고정 → **46(mobile)/56(md+) 균일**(familyfed 정합, hover 시 레이아웃 시프트 제거). `motion-reduce:after:transition-none` 가드.
- 스크린샷 `live-news-tab-hover.png`(전체=active·지역 봉사=hover 동일 모습).

### 검색 위치 이동 + 정렬 추가 (사용자 피드백 4차, familyfed 1272-7363)

사용자 지적: 카테고리가 많아(5개+) 탭+검색 한 줄이 좁다 → familyfed 뉴스룸처럼 검색을 아래 행으로 내리고, 최신순/제목순 정렬 추가.

- **툴바 2행** — (1행) CategoryTabs 전체 폭 단독, (2행) 검색(좌, `flex-1 max-w-440`) + 정렬(우, `items-end` 하단선 정렬). 라이브 1440/375 확인.
- **정렬** — `최신순`(기본, publishedAt DESC) / `제목순`(title ASC). db `newsOrderBy`, 스키마 `z.enum(["latest","title"])`, `?sort=` URL 드라이버(latest 생략). 라이브 API: title 정렬 가나다순 확인(가족 치유→갈등 회복→감사의…), q+sort 결합 정상. select 변경 시 URL `?sort=title` + 그리드 재정렬 확인.
- 검증: tsc 0 · lint 0 · **test 48** · build green · 콘솔 0 error. 스크린샷 `live-news-sort-{1440,375}.png` · `live-news-sort-title-1440.png`.

### 검색바·필터 디테일 정합 (사용자 피드백 5차, familyfed PageSearchbar/PageTabs 1248-6428·1248-6499)

familyfed 정본 컴포넌트(코드)에 맞춰 미세 정합. 라이브 측정값 = 사용자 지정 hex 정확 일치.

- **검색바** — 하단 stroke 기본 `#E5E7EB`(측정 `rgb(229,231,235)`) → **hover 시에만 `#BAC2D0`**(측정 `rgb(186,194,208)`). focus 변화·링 제거. 아이콘 색 `#4B5563`(측정 `rgb(75,85,99)`) 고정, 크기 **24×24**(20→24), 아이콘 버튼 회색 원형 hover 배경 없음. **active(focus) 시 placeholder 숨김**(측정 `rgba(0,0,0,0)`). webkit clear(X) 제거, IME 가드 유지.
- **필터(탭)** — px-6(24px) 여백, 베이스라인 `#D1D5DB`, 언더라인 reveal 을 `scale-x + opacity`(`transition-all`)로 보강, 텍스트 `transition-[color,font-weight]`. center-out·hover=active 유지.
- 검증: tsc 0 · lint 0 · test 48 · build green · 콘솔 0 error. 스크린샷 `live-news-refined-1440.png`.
