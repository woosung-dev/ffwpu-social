---
status: active
opened: 2026-06-10
branch: feat/news-heart-bottom-fidelity
slice_id: TASK-20260610-news-heart-bottom-fidelity
spec_status: confirmed
brainstorming_done: 2026-06-10
related_adr:
---

# 소식 상세 하트 B 시안 + Figma 정합 전수 감사

> plan 본문: `~/.claude/plans/implement-expressive-hearth.md` (승인됨 2026-06-10)
> 산출물: `docs/design/audit-2026-06-10/` (specs / measured / figma-shots / allowlist.md / report.md)

## 사용자 확정 결정

1. **하트 위치 = B 시안** (Figma 749:7920) — 상세 페이지 상단 날짜줄 하트 제거, 하단 공유줄 우측에 Heart 필 버튼(컴포넌트 114:8303, Default ♡/Click ♥). 현재 코드는 A 시안(93:8810, 상단) 상태였음.
2. **검증 범위 = 전체 3면 × 4BP** — 홈 랜딩(96:5908) + 소식 목록(95:9359) + 소식 상세(1440만 존재) + 컴포넌트 시트(97:10250).
3. **diff 처리 = 자동 수정 루프** — ±2px 수렴, 최대 3라운드. 의도적 이탈(allowlist.md)은 보존.

## 실행 중 결정 로그

- **2026-06-10 PR #40 머지 편입**: 본 브랜치 = main + `feat/figma-fidelity-sweep`(PR #40, OPEN). 이유 — PR #40 이 동일 성격(헤더 4BP·랜딩 패딩·카드 그리드·Featured·Gmarket Sans)의 정합 수정이라 main 기준 감사 시 전부 재검출·중복 수정·충돌 확정. 충돌 1건(`src/app/layout.tsx` — SEO 주석 vs Gmarket Sans 블록, 양쪽 보존) 해소. **PR #40 이 먼저 머지되어야 함** (본 PR 은 그 위에 스택).
- **2026-06-10 사용자 커밋 8cb0995 공존**: 세션 중단 중 사용자가 본 브랜치에 "관리자 분석·예약 발행"(마이그레이션 0007 포함) 커밋. 정합 작업(워킹트리)과 파일 3개 겹치나 충돌 없이 레이어링 확인 (NewsViewTracker 등 보존, tsc·테스트 통과). **본 브랜치는 이제 스키마 변경 포함** (analytics-events — 배포 시 migrate 필요).
- **정책 기각 (Figma 와 다르게 유지)**: 본문성 14px 4곳(접근성 16px 제약) · heroEllipse x 오프셋(디자이너 노이즈) · SubBanner 행간/상세 905/태그 h38(PR #40 수용) · 상세 +4px 들여쓰기(노이즈). 상세는 `docs/design/audit-2026-06-10/report.md` §3.

## 체크리스트

- [x] Stage 0 — 브랜치·dev(3100)·allowlist
- [x] Stage 1 — Figma 스펙 추출 6 에이전트 (specs/*.md)
- [x] Stage 2 — Generator: 하트 B 구현 (공감해요 pill·하단 이동)
- [x] Stage 3 — 측정 하니스 (Playwright, 3면×15표면)
- [x] Stage 4 — Evaluator 비교 + 적대 검증 (confirmed 108)
- [x] Stage 5 — 수정 루프 (2.5라운드 — fixed 90+5, Round 3 표적 5/5 PASS)
- [x] Stage 6 — tsc 0·lint 0·vitest 52·build ✓ + report.md
- [x] 커밋 3건(a7f60b2·31b7cc3·b0a2423)·푸쉬·**PR #45** (base = feat/figma-fidelity-sweep, #40 선머지 후 main 자동 재타게팅)
- [ ] 사회공헌국/디자이너 escalation 6건 (report.md §4)

## 서버/데이터

- dev: PORT=3100 (백그라운드), postgres 5433 + minio 가동
- 측정용 상세 ID: `/news/5f5c181c` 등 (발행 소식 존재 확인됨)
