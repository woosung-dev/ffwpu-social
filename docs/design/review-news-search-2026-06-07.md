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
