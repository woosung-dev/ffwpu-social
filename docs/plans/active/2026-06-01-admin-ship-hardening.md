---
status: active
opened: 2026-06-01
branch: feat/admin-ship-hardening
slice_id: TASK-20260601-admin-ship-hardening
spec_status: confirmed
brainstorming_done: 2026-06-01
related_adr: 0030-slot-eligibility, 0031-jwt-session-invalidation, 0032-action-result-unify
---

# 어드민 v1.0 ship-전 하드닝

> 개인 brainstorm 본문: `~/.claude/plans/distributed-roaming-knuth.md` (다단 검토 + codex v2 교정 전문)
> 승격 사유: PR #14(어드민 v1.0) 머지 후 ship-전 마감. 다단 검토(ui-ux-pro-max·vercel-react-best-practices·codex 독립·6축+evaluator) GO-WITH-FIXES.

## 배경

어드민 v1.0 기능(4-1 KPI·4-2 랜딩 큐레이션·4-3 히어로·4-4 소식 CRUD·계정)은 모두 구현 완료(critical 0). 절대제약(접근성 AA·운영자율성·개인정보) 직결 HIGH 6건 + 접근성 보강 + 모바일 카드뷰 + 아키텍처 옵션1 소폭 정리가 잔여. **DB 스키마 변경 없음 → 신규 마이그레이션 불필요.**

codex(gpt-5.5) v2 교정 3건: A1 TOCTOU(최종 UPDATE WHERE에 eligibility), A1b 발행해제/카테고리변경 시 슬롯 고아화(updateNews 경로·히어로도 보유), A3 무효화는 `return null`(빈 객체 아님), D1 도메인 메시지 보존(DomainError 분리).

## 작업 그룹

- **D0** 시작 전 문서화 (이 파일·checklist·TODO·CLAUDE 포인터)
- **A1/A1b/A2** 랜딩 슬롯 eligibility 서버 강제 + 상태전이 시 고아 슬롯 정리(hero·landing 공통) + advisory lock. 재사용: `setHeroOrder`/`acquireHeroOrderLock`/`clearHeroRank` 패턴
- **A3** JWT 세션 무효화 — `auth.ts` jwt 콜백서 DB 재조회, 삭제/role 변경 시 `return null`
- **A4/A5** ink-date 색대비 AA + 대시보드 카테고리 칩
- **A6** landing `NOT IN` → `notInArray` / **A8** 사이드바 카테고리 NAV
- **B1~B4** 접근성 (필드에러 aria·Select 접근명·필수표시·비번 토글)
- **C1** 모바일 테이블 카드뷰 폴백
- **D1** `src/lib/action-result.ts` 통합 + DomainError 분리 + mutation id z.uuid()
- **D2** landing page 인라인 Drizzle 이관 + 어드민 pinned-only 쿼리 분리
- **A7** 로그인 rate limit — Vercel Firewall 룰(배포 설정, 코드 0)
- **DX** 완료 후 문서화 (ADR-030/031/032·context-notes·TODO·CLAUDE·lessons·메모리)

## 위험 (codex 발굴)

R1 A1 set-time만 검증 시 TOCTOU → UPDATE WHERE에 박기. R2 상태전이 고아 슬롯 → updateNews 경로 clear. R3 A3 `{}` 반환 시 forbidden 루프 → null. R4 동시저장 23505 → 별도 LANDING_SLOT_LOCK_KEY. R5 D1 generic화로 도메인 메시지 소실 → DomainError. R6 D2 fallback 글 no-op 해제 → pinned-only 분리. **R7 [확인 필요] story 슬롯이 공개 StorySection에 미연결**(정적 이미지+stats만 렌더) — 사회공헌국 확인 대상, ship-전엔 데이터 일관성만 보장.

## 검증

`pnpm tsc/lint/test/build` + 로컬 docker/dev 수동(A1 5케이스·A2 동시저장·A3 쿠키/루프/Server Action·C1 375px). 가드 전이판정은 순수 헬퍼로 추출해 단위 테스트(DB 통합 하니스 부재 → SQL WHERE는 수동 검증).
