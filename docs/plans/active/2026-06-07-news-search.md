---
status: active
opened: 2026-06-07
branch: feat/news-search
slice_id: TASK-20260607-news-search
spec_status: confirmed
brainstorming_done: 2026-06-07
related_adr: 036-news-search
---

# /news 소식 검색 + 768 그리드 정정 — Generator·Evaluator 워크플로우

> plan 원본(brainstorm): `~/.claude/plans/steady-snuggling-sunbeam.md`. 결정: `docs/decisions.md` ADR-036. 검증: `docs/design/review-news-search-2026-06-07.md`.

## confirmed (사용자 확정)

- 검색 대상 = **제목 + 태그** (본문 jsonb 는 v1.1)
- 헤더 검색 아이콘 = **현행 disabled 유지** (검색은 `/news` 툴바 인라인만)
- 디자인 검증 범위 = **`/news` 목록 중심** (상세 제외)
- `q × category` = AND, 둘 다 page=1 리셋
- 워크플로우 = Evaluator(디자인 검증, 2-pass) + Generator(검색 구현) + Codex 선별 수락 + docs 정리

## assumptions / undecided

- 우리 Figma `/news` 에 검색 UI 없음 → familyfed 1323-8705 패턴을 우리 토큰으로 이식(의도적 추가, ADR-016 갱신). `[확인 필요]` 사회공헌국 디자인 최종 승인.
- seed 커버 11장 미수령 → placeholder. 레이아웃 검증엔 무방.

## 체크리스트

- [x] Phase 1 Baseline 검증 (4 BP) — 검색 UI 부재 확인 · **P0: 768 카드 3열→2열(코드 drift, skeleton 은 이미 lg:3)**
- [x] Phase 2 구현 — schemas.q / db(likePattern·searchWhere EXISTS) / service / route / api(q 필터·키) / page / 툴바(SearchInput·news-search) / 768 그리드 수정
- [x] 단위테스트 — search-query(4) · api(q·키·배열, 4). tsc 0 · lint 0 · test 47
- [x] Phase 3 2-pass 적대 검증 — 전 BP 정합·회귀 0·768=2열 확정. 라이브 인터랙션(결과/빈/overflow) 통과, 콘솔 0 error
- [x] 적대 수락 — F1 key 리셋(P1) · F2 page overflow 재조회(P1) · F3 onSubmit IME 가드(P2) · F4 빈결과 role=status(P2). F5(input box-ring) 비수락
- [x] Phase 4 Codex — C1 반복 q(string[]) 서버 500 → firstParam 흡수. 수락·수정·재검증(라이브 200)
- [x] Phase 5 docs — ADR-036 · AGENTS.md · design.md · TODO.md · 본 plan · 검증 리포트
- [ ] 커밋·PR (사용자 승인 흐름)

## 변경 파일

- 신규: `features/news/search-query.ts(.test)` · `features/news/components/SearchInput.tsx` · `app/(public)/news/news-search.tsx` · `features/news/api.test.ts`
- 변경: `features/news/{schemas,db,service,api}.ts` · `app/api/news/route.ts` · `app/(public)/news/{page,news-list-client}.tsx` · `features/news/components/index.ts`
- **DB 스키마·마이그레이션 변경 0**

## 후속 (v1.1)

본문(jsonb) 검색 · 검색어 하이라이트 · 자동완성/추천검색어 · 헤더 검색 모달(familyfed SearchPanel) · 사회공헌국 디자인 최종 승인.
