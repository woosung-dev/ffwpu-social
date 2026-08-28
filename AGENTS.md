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

> **머지된 작업은 여기 적지 않는다.** 결정은 `docs/decisions.md`(ADR), 경과는 `git log`, plan 은 merge 시 삭제 (`.ai/common/global.md` §2 plans 라이프사이클). 중복 저장은 drift 원천 — 실제로 이 섹션이 머지된 PR 5건을 "완료(미머지)"로 붙들고 있었다 (2026-07-16 정리).

- 진행 중: **쌀나눔 시트 → StorySection 통계 자동 반영** (branch `feat/rice-sheet-sync`) — 디테일 `docs/plans/active/TASK-20260828-rice-sheet-sync.md`. ADR-058. 배포 시 마이그레이션 0020 + `RICE_SHEET_CSV_URL` + GHA 수동 1회 필요.
- 진행 중: **홈 팝업 후속** (branch `feat/home-popup`) — 디테일 `docs/plans/active/TASK-20260718-home-popup.md`. PR #92 머지(마이그레이션 0015 prod 적용 완료) 후에도 브랜치에 미반영 커밋이 남아 있다.
- 진행 중: **랜딩 실데이터화 + 반응형 4-BP 정합** (branch `feat/client-foundation`) — 디테일 `docs/plans/active/2026-06-03-landing-data-responsive.md`. 🔴 사진 11장 수령 대기(`src/db/seed-assets/`) · Gmarket Sans 라이선스 확인.
- 종료된 PR (2026-08-08, 사용자 판단 — 브랜치는 남아 있어 reopen 가능): **#87** SEO 하드닝(ADR-044) · **#78** EC2 배포 Phase 1 · **#55** GHA Node 24.
- 어드민 surface (12): /admin · /admin/news · /admin/news-hero · /admin/main-story · /admin/categories · /admin/press · /admin/press-categories · /admin/kpi · /admin/landing · /admin/accounts · /admin/notices · /admin/popups
- 임시 어드민: `admin@ffwpu-social.local` / `bRhHR2CWkqrMnj0L` (배포 전 변경 필수)
- 후속·미해결·사회공헌국 escalation: `docs/TODO.md`

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
