<!-- FFWPU 사회공헌국 대외 공개 웹사이트 프로젝트의 진입점 README -->

# FFWPU 사회공헌국 웹사이트 (Sow Good)

세계평화통일가정연합 신한국협회 **사회공헌국**(조직 브랜드: 사회공헌단, BI: *Sow Good*)의 대외 공개 웹사이트. 활동을 통합 기록·공개하여 *"가치를 삶으로 증명"*하는 공식 창구.

- **데드라인**: 2026-05-31 (1차 런칭)
- **클라이언트**: 사회공헌국
- **운영자**: super 단일 계정 (v1.0, ADR-016)

## 기술 스택

| 영역 | 선택 | ADR |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript Strict | ADR-001 |
| 스타일링 | Tailwind v4 + shadcn/ui v4 + SUIT 폰트 | ADR-008 |
| ORM | Drizzle (`strict: true`) + drizzle-zod | ADR-001b |
| DB | Docker Postgres 16-alpine (로컬) → Neon/RDS (배포) | ADR-020 |
| Storage | MinIO (로컬) → R2/S3 (배포) | ADR-020 |
| Auth | NextAuth.js v5 (Credentials Provider) | ADR-020 |
| 호스팅 | Vercel (1단계) → AWS (2단계) | ADR-014, ADR-019 |
| 도메인 | `<main>` + `admin.<main>` 서브도메인 (host 분기) | ADR-023 |
| 폴더 구조 | F3 (`src/client/` + `src/admin/` + `src/features/`) | ADR-024 |

## 빠른 시작

```bash
# 1. 의존성
pnpm install

# 2. 로컬 인프라 (Postgres 5433 + MinIO 9000/9001)
docker compose --env-file .env.local up -d

# 3. DB 마이그레이션 + 시드 (super admin + 9 news + 27 tags)
pnpm db:migrate
ADMIN_PASSWORD='your-password' pnpm db:seed

# 4. 개발 서버
pnpm dev
# → http://localhost:3000

# 5. 어드민
# → http://localhost:3000/admin/login
# email: admin@ffwpu-social.local
# password: (위 ADMIN_PASSWORD로 설정한 값)
```

### 검증 명령

```bash
pnpm tsc --noEmit              # 타입 체크
pnpm lint                      # ESLint (D-1에 정식 셋업)
pnpm build                     # 프로덕션 빌드 (Partial Prerender 출력 확인)
pnpm db:generate               # 스키마 변경 후 마이그레이션 생성
pnpm db:studio                 # DB 브라우저
```

## 문서 진입점

새로 합류한 사람·AI 에이전트는 **이 순서대로** 읽으면 5분 안에 컨텍스트를 잡을 수 있다.

1. [`AGENTS.md`](./AGENTS.md) — 프로젝트 컨텍스트·Golden Rules·개인 원칙·스택 규칙 인덱스
2. [`docs/current.md`](./docs/current.md) — **★ 지금 유효한 합의사항**. 코드 작업의 유일한 근거
3. [`docs/decisions.md`](./docs/decisions.md) — ADR 모음 (왜 그렇게 결정했나)
4. [`docs/tech.md`](./docs/tech.md) — 기술 스택·아키텍처·F3 폴더 구조·데이터 모델·API
5. [`docs/design.md`](./docs/design.md) — Figma 정리본, 디자인 토큰, 반응형 매트릭스
6. [`.ai/rules/domain.md`](./.ai/rules/domain.md) — 프로젝트 도메인 절대 제약·자주 하는 실수

## 디렉토리 구조 (요약)

```
.
├── AGENTS.md                       프로젝트 컨텍스트·규칙 (= .claude/CLAUDE.md)
├── README.md                       이 파일
├── checklist.md                    Sprint 작업 체크리스트
├── context-notes.md                결정의 *왜* (append-only)
├── docker-compose.yml              postgres + minio
├── drizzle.config.ts               strict: true
├── next.config.ts                  output: 'standalone' + cacheComponents
├── package.json
├── docs/
│   ├── README.md (없음 — 진입점은 본 README)
│   ├── current.md                  지금 유효한 합의 (SSOT)
│   ├── design.md                   Figma 인덱스·토큰
│   ├── tech.md                     스택·F3 폴더·데이터 모델·API
│   ├── decisions.md                ADR 모음 (시간순 누적)
│   ├── source/                     사회공헌국 원본 자료 (절대 수정 금지)
│   └── plans/active/               Sprint 진행 계획서
├── src/                            (자세한 구조는 docs/tech.md)
│   ├── app/                        라우팅만
│   ├── auth.ts, proxy.ts           NextAuth + 미들웨어
│   ├── db/                         Drizzle 5 테이블
│   ├── features/news/              3-Layer (actions/service/db/schemas + index public API)
│   ├── client/                     (D-4 신규) 사용자 UI
│   ├── admin/                      (D-4 신규) 어드민 UI
│   └── types/
└── drizzle/                        마이그레이션 SQL
```

## 외부 자료

- **Figma**: [사회공헌국](https://www.figma.com/design/lmjjU4UxUpK2pDi67BGRiW/%EC%82%AC%ED%9A%8C%EA%B3%B5%ED%97%8C%EA%B5%AD) (파일 ID `lmjjU4UxUpK2pDi67BGRiW`, 시작 노드 `96-7689`)
- **원본 자료**: [`docs/source/`](./docs/source/) (기획안 v5, 의도서 v1, BI PPT)

## 작업 트래킹

- [`checklist.md`](./checklist.md) — 단계별 작업 체크리스트
- [`context-notes.md`](./context-notes.md) — 결정의 *왜* (append-only)
- [`docs/plans/active/`](./docs/plans/active/) — Sprint 진행 계획서 (D-5/D-4 등)

## 미해결 TBD (사회공헌국 회신 대기)

- 도메인 확정 (확정 시 `<main>` + `admin.<main>` 서브도메인 권장 — ADR-023)
- "쌀나눔 프로젝트" 메뉴 → StorySection 추론 확정
