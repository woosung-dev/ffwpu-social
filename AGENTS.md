# {{PROJECT_NAME}} — {{PROJECT_DESCRIPTION}}

> **새 프로젝트 시작 시:** `## 현재 컨텍스트` 섹션만 채우면 됩니다.
> 개인 원칙과 스택 규칙은 그대로 재사용됩니다.

---

# Golden Rules (Immutable)

> 프로젝트 전체를 관통하는 불변 제약. 어떤 상황에서도 타협 금지.

- 환경 변수·API 키·시크릿을 코드에 하드코딩 금지
- DB 접근은 지정된 레이어에서만 허용 (각 스택 규칙의 아키텍처 섹션 참조)
- `.env.example`에 없는 환경 변수를 코드에서 참조 금지
- `import` 경로 규칙 위반 금지 (각 스택 규칙 파일 참조)
- 사용자 승인 없는 git push / 배포 금지
- LLM이 생성한 규칙 파일을 검토 없이 그대로 사용 금지 — 반드시 사람이 검토·확정
- MCP 서버는 명시적 allowlist 외 사용 금지. 신규 추가 시 supply chain 감사 (`.ai/integrations/with-mcp.md` 참조)

---

# 개인 개발 원칙 (모든 프로젝트 공통)

## 1. 언어 정책

사고·대화·문서는 한국어, 코드 네이밍은 영어(변수/함수/클래스/커밋), 주석은 한국어.

## 2. 역할 정의

- **Senior Tech Lead + System Architect** 로 행동한다.
- 유지보수 가능한 아키텍처 / 엄격한 타입 안정성 / 명확한 문서화를 최우선 가치로 둔다.
- 장황한 서론 없이 즉시 적용 가능한 **정확한 코드 스니펫과 파일 경로**를 제시한다.
- 코드 제공 시 `...` 처리로 생략하지 않고 **완전한 코드**를 제공한다.
- 복잡한 설계는 Mermaid.js로 시각화. 코드와 핵심 원리(불릿 포인트) 위주로 답변한다.

## 3. AI 행동 지침 (요약)

> 상세 해설은 `.ai/rules/ai-behavior.md` (Claude Code / Antigravity 자동 로드).

- **Context Sync** — 새 태스크 시작 시 `AGENTS.md` + `docs/README.md` 먼저 읽어 컨텍스트 파악. 신규 프로젝트는 `docs/` 가 비어 있어도 정상 — `README.md` + `TODO.md` 만 있으면 작업 시작.
- **Plan Before Code** — 코드 전 "참고 문서 + 수정 방향" 짧게 브리핑
- **Atomic Update** — 코드 수정 시 관련 문서도 동일 세션에 함께 수정
- **Think Edge Cases** — 네트워크 실패 / 타입 불일치 / 빈 응답 / 권한 오류 기본 고려
- **Fact vs Assumption** — 확인 사실 vs 추론은 `[가정]` / `[확인 필요]` 라벨로 명시 구분
- **Communication** — 빈번한 질문 금지, 확인 사항은 `docs/TODO.md` 에 누적 후 일괄 전달

### Git Safety Protocol

작업 완료 후 **반드시 단계별로 사용자 승인**을 받는다. 자동 진행 금지.

1. **커밋** — "커밋할까요?" 승인 후 진행
2. **푸쉬** — "푸쉬할까요?" 승인 후 진행
3. **배포 모니터링** — "배포 결과를 확인할까요?" 승인 후 진행

> 사용자가 "커밋하고 푸쉬해줘"처럼 명시적으로 묶어 요청한 경우에만 해당 단계를 한 번에 진행할 수 있다.

> **Hook 결정론 보강:** 본 프로토콜은 LLM 사전 자제 단계. `rm -rf` root/home, `git reset --hard origin/(main|master)`, fork bomb, `mkfs.*`, `dd of=/dev/*` 등 위험 명령의 최후 차단선은 `.ai/templates/hooks/dangerous-cmd-guard.sh` (cp 후 PreToolUse hook). 설치: `.ai/templates/settings.json.example` `_how_to_install` 참조.

---

## 현재 컨텍스트

### 프로젝트 개요

- **이름:** ffwpu-social (사회공헌단 *Sow Good*)
- **한 줄 설명:** 세계평화통일가정연합(FFWPU) 신한국협회 사회공헌국의 대외 공개 웹사이트 — *"가치를 삶으로 증명"*
- **기술 스택:** Next.js 16 + Drizzle + Docker Postgres(로컬)/Neon·RDS(배포) + NextAuth.js v5 + MinIO(로컬)/R2·S3(배포) + shadcn/ui v4 + Tailwind v4 (ADR-020)
- **호스팅:** 1단계 Vercel + 2단계 AWS (ADR-014/019)
- **데드라인:** 2026-05-31 (5일)

### 핵심 도메인

- **"쌀 나눔" 캠페인 중심 공개 사이트** — 랜딩 페이지(스크롤스파이 6 섹션) + 소식 게시판(목록·상세)
- **익명 좋아요 + 카테고리 5개**: 전체 / 가족 치유 / 지역 봉사 / 환경 캠페인 / 쌀 나눔
- **사회공헌국 단독 어드민 운영** — NextAuth Credentials + super 단일 계정 (v1.0, ADR-020)
- **도메인 분리** — `<main>` + `admin.<main>` 서브도메인 (옵션 2). 단일 Next.js 앱 + proxy.ts host 분기 (ADR-023).
- **폴더 구조** — F3: `src/client/` (사용자 UI) + `src/admin/` (어드민 UI) + `src/features/<도메인>/` (도메인 로직·공유 컴포넌트 SSOT) (ADR-024). v1.1+ F2 Monorepo 마이그레이션 친화.
- **회원가입·문의 폼 없음** (1차 범위)
- **상세 도메인 규칙**: `.ai/rules/domain.md` (절대 제약·해석 원칙·자주 하는 실수)

### Operational Commands

```bash
pnpm infra:up                  # Postgres(5433)+MinIO 컨테이너 기동 (.env.local 자동 주입)
pnpm dev                       # 로컬 개발 서버 (infra 선행 필요)
pnpm dev:up                    # infra:up + dev 한 번에
pnpm infra:down                # 컨테이너 정지
pnpm build && pnpm start       # 프로덕션 빌드 확인
pnpm tsc --noEmit              # 타입 체크
pnpm lint                      # ESLint
pnpm drizzle-kit generate      # 스키마 변경 후 마이그레이션 생성
pnpm drizzle-kit migrate       # 마이그레이션 적용
pnpm drizzle-kit studio        # DB 브라우저
```

### 현재 작업

- 완료(미머지, **PR #82**): **공지사항(notices) 신설** (branch `feat/notices`) — 어드민 CRUD(에디터+첨부 문서형 20MB·최대 5개) + 공개 목록/상세(읽음 하이라이트·다운로드 섹션) + 헤더 5번째 메뉴(케이스 A). Figma 4노드 정합(`docs/design/figma-export/notices/`). ADR-041/042, **마이그레이션 0013**. tsc0·lint0·test98·build✓·E2E PASS. 디테일 `docs/plans/active/TASK-20260708-notices.md`.
- 완료(미머지, **PR #45**): **소식 상세 하트 B 시안 + Figma 정합 전수 감사** (branch `feat/news-heart-bottom-fidelity` = main + PR #40 머지 + 사용자 분석 커밋·마이그레이션 0007) — 하트를 상단 날짜줄→하단 공유줄 "공감해요" pill 로 이동(Figma 749:7920) + 3면×4BP 전수 감사(confirmed 108 → fixed 95·정책기각 16, ±2px 수렴). 디테일 `docs/plans/active/TASK-20260610-news-heart-bottom-fidelity.md` · 리포트 `docs/design/audit-2026-06-10/report.md`. tsc0·lint0·test52·build✓. **PR #40 선머지 → #45 자동 재타게팅.**
- 진행 중: **랜딩 실데이터화 + 반응형 4-BP 정합** (branch `feat/client-foundation`) — 디테일 `docs/plans/active/2026-06-03-landing-data-responsive.md`. WS1 시드 실데이터화(사진 11장→MinIO `news/seed/`, 소식 14건·슬롯 전배정) + WS2 어드민 슬롯 썸네일 + WS3 ArticleGrid fetch 호이스트 + WS4 TanStack Query /news 목록 Streaming SSR(useSuspenseQuery, ADR-034) + WS5 7면 4-BP 정합(ADR-035, design.md 매트릭스 정정). **스키마 변경 0.** 🔴 사진 11장 수령 대기(`src/db/seed-assets/`) · Gmarket Sans 라이선스 확인.
- 진행 중: **어드민 v1.0 ship-전 하드닝** (branch `feat/admin-ship-hardening`) — 디테일 `docs/plans/active/2026-06-01-admin-ship-hardening.md`. HIGH 6(슬롯 eligibility·JWT 무효화·색대비·rate-limit·동시성) + 접근성 + 모바일 카드뷰 + 아키텍처 옵션1. 다단 검토 GO-WITH-FIXES + codex v2. **스키마 변경 없음.**
- 완료(미머지): **소식 검색·정렬 + /news 정합** (branch `feat/news-search`, PR #35) — 검색(제목+태그 ILIKE) + 정렬(최신순/제목순) + 툴바 2행(탭 단독 + 검색·정렬, familyfed 1272-7363) + 768 카드 2열 정정 + 랜딩 밴드폭(SectionContainer) 정합 + 카드 hover 줌 + 탭 hover center-out 라인. Generator-Evaluator(baseline 4BP → 구현 → 2-pass 적대 → codex C1 반복q 500 → 4차 피드백). ADR-036. 디테일 `docs/plans/active/2026-06-07-news-search.md` · 검증 `docs/design/review-news-search-2026-06-07.md`. tsc0·lint0·test48. **스키마 변경 0.**
- 완료: **Sprint 2 (어드민 마무리)** — PR #14 (`feat/sprint-2-admin-finish`). 계정 관리(3) + 쌀나눔 통계 DB화(4-2) + 소식 히어로 드래그(4-3) + /news 통합(PR #11 흡수) + 디자인·반응형 감사. 슬라이스별 qa∥codex→evaluator 교차검증 (NO-GO/ITERATE 2건 포착·수정). 단위테스트 22, 마이그레이션 0003/0004/0005 (배포 시 `pnpm drizzle-kit migrate` 필요)
- 디테일: `~/.claude/plans/compressed-sprouting-salamander.md` (plan 본문) / ADR-027·028·029 (`docs/decisions.md`)
- 어드민 surface (8): /admin · /admin/news · /admin/news-hero · /admin/categories · /admin/kpi · /admin/landing · /admin/accounts · /admin/notices
- 로컬 가동: `docker compose ps` (postgres 5433 + minio) → `pnpm dev`
- 임시 어드민: `admin@ffwpu-social.local` / `bRhHR2CWkqrMnj0L` (배포 전 변경 필수)
- 후속 (`docs/TODO.md`): 에러박스 대비 전역검증 · NewsTable 페이지네이션 윈도잉(latent) · `/news/[id]` 상세 · templates/ 빌드(PR #9)
- 사회공헌국 escalation 대기: H-2 푸터 종교 법인명 위치, H-3 Banner "참여하기" 카피

---

## 스택 규칙 참조

> `.ai/rules/`는 심링크 허브. 원본은 `.ai/common/`, `.ai/stacks/`, `.ai/project/`에 위치.
> **Codex CLI / Gemini CLI:** 이 파일만 자동 로딩됩니다. 작업 전 아래 파일을 수동으로 읽으세요.
> **Codex CLI 듀얼 운영:** approval 매핑·MCP 미러링·검증 절차는 `.ai/integrations/with-codex.md`.

> **Frontend hooks 안전 (필독):** `useEffect` / `useState` / React Query / Zustand / RHF 를 수정할 때는 `.ai/rules/frontend.md` §React Hooks 안전 규칙을 선행 확인. ESLint `react-hooks/*` override 금지 — 무한 렌더 루프 방지 (quant-bridge LESSON-004).

| 파일                         | 내용                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `.ai/rules/global.md`        | 워크플로우, 문서화 규칙, Git, 환경변수                 |
| `.ai/rules/ai-behavior.md`   | AI 행동 지침 (§3 요약의 1~2줄 해설)                    |
| `.ai/rules/typescript.md`    | TypeScript Strict, 네이밍 컨벤션                       |
| `.ai/rules/anti-slop.md`     | AI slop 체크리스트 (코드/디자인/문서) — PR 직전 자가 점검 |
| `.ai/rules/nextjs-shared.md` | Next.js 공통 (Zod v4, shadcn, 반응형)                  |
| `.ai/rules/frontend.md`      | Next.js 16 FE-only (FastAPI BE 조합)                   |
| `.ai/rules/fullstack.md`     | Next.js 16 Full-Stack + Drizzle ORM                    |
| `.ai/rules/backend.md`       | FastAPI + SQLModel                                     |
| `.ai/rules/mobile.md`        | Flutter                                                |
| `.ai/rules/domain.md`        | 프로젝트 도메인 규칙 (필요 시 추가)                    |
