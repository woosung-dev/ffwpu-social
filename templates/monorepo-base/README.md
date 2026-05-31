# monorepo-base

Next.js 16 + Drizzle 0.36 + NextAuth v5 + Tailwind v4 기반의 **도메인 분리 monorepo 템플릿**.

> 사용자 사이트(`apps/web`)와 운영자 사이트(`apps/admin`)를 **별도 배포 단위**로 분리하면서,
> 도메인 로직·DB·UI primitives 는 `packages/*` 에서 SSOT 로 공유한다.

---

## 구조

```
templates/monorepo-base/
├── apps/
│   ├── web/      # 사용자 사이트 (예: test.com)  — port 3000
│   └── admin/    # 운영자 사이트 (예: admin.test.com) — port 3001
├── packages/
│   ├── db/        # Drizzle 스키마·마이그레이션·client SSOT
│   ├── features/  # 도메인 로직 (queries / actions / schema / components)
│   ├── ui-base/   # untheme primitives (shadcn v4, 토큰 미주입)
│   └── config/    # tsconfig / eslint / tailwind preset
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## 빠른 시작

전제: **node 20.x + pnpm 9.15.x** (`.nvmrc` / `packageManager` 고정).

```bash
# 1) 의존성 설치
pnpm install

# 2) 환경변수 준비
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# 3) DB 마이그레이션
pnpm db:generate
pnpm db:migrate

# 4) 개발 서버
pnpm dev          # web + admin 동시
pnpm dev:web      # web 만 (port 3000)
pnpm dev:admin    # admin 만 (port 3001)
```

---

## 운영 명령

| 명령 | 용도 |
|---|---|
| `pnpm dev` | web + admin 동시 (turbo --parallel) |
| `pnpm dev:web` | web 만 dev 서버 (port 3000) |
| `pnpm dev:admin` | admin 만 dev 서버 (port 3001) |
| `pnpm build` | 전체 앱 프로덕션 빌드 |
| `pnpm typecheck` | 전 workspace `tsc --noEmit` |
| `pnpm lint` | 전 workspace ESLint |
| `pnpm db:generate` | Drizzle 스키마 → SQL 마이그레이션 생성 |
| `pnpm db:migrate` | `DATABASE_URL` 대상 마이그레이션 적용 |
| `pnpm db:studio` | Drizzle Studio 브라우저 |
| `pnpm clean` | turbo cache + node_modules 제거 |

---

## Vercel 배포

**프로젝트 2개** 로 분리하여 각각 배포.

| 프로젝트 | Root Directory | Build Command | Install Command |
|---|---|---|---|
| web | `apps/web` | `pnpm --filter @myorg/web build` | `pnpm install --frozen-lockfile` |
| admin | `apps/admin` | `pnpm --filter @myorg/admin build` | `pnpm install --frozen-lockfile` |

각 프로젝트의 환경변수는 Vercel 대시보드에서 분리 관리. `AUTH_SECRET` 은 절대 공유 금지.

---

## 신규 도메인 추가 흐름

1. `packages/db/schema/<도메인>.ts` 에 테이블 정의
2. `pnpm db:generate` → SQL 마이그레이션 생성·검토·커밋
3. `packages/features/<도메인>/` 에 queries / actions / schema / components 작성
4. `apps/web` 또는 `apps/admin` 의 라우트에서 `@myorg/features/<도메인>` import

---

## 상세 가이드라인

- 루트 전반: `AGENTS.md`
- 앱별: `apps/web/AGENTS.md`, `apps/admin/AGENTS.md`
- 패키지별: `packages/*/AGENTS.md`

---

## ⚠️ 알려진 이슈 / 다운스트림 액션

### 1. 별도 repo 분리 권장 (드리즐 인스턴스 중복)

본 템플릿은 *ffwpu-social* repo 안에 *중첩 monorepo* 로 들어가 있어, 부모 `ffwpu-social/node_modules` 와 본 템플릿의 `templates/monorepo-base/node_modules` 양쪽에 `drizzle-orm` 이 hoist 되어 **타입 nominal mismatch** 가 발생합니다. 다운스트림은 다음 중 하나로 분리하면 자동 해소됩니다.

- (권장) **별도 git repo 신설** — 본 폴더만 cherry-pick 으로 추출 후 `git init` 으로 시작.
- (대안) ffwpu-social `.gitignore` 에 `templates/*/node_modules` 추가하고 본 폴더 안에서만 빌드.

### 2. 다운스트림 필수 ship 전 처리

| 항목 | 위치 | 사유 |
|---|---|---|
| `--color-primary` 브랜드 컬러 결정 | `apps/web/app/globals.css` | 현재 중립 neutral placeholder (anti-slop §3 AI 보라 회피용). 디자이너 합의 전 ship 금지 |
| `AUTH_SECRET` rotate | 각 앱 `.env.local` | 템플릿 더미. `openssl rand -base64 32` 로 신규 생성 |
| `@myorg/<pkg>` org 이름 치환 | 전체 (package.json, import 경로) | `@myorg` → 실 org slug 로 일괄 변경 |
| 데모 도메인 `news` 제거 또는 변경 | `packages/db/schema/`, `packages/features/news/`, `apps/*/app/news/` | 본 프로젝트 도메인으로 교체 |
| 한국어 file header 의도 갱신 | 모든 `.ts/.tsx` 첫 줄 | 템플릿 의도 → 본 프로젝트 의도로 |
| `pnpm install` 후 정합 검증 | repo root | `pnpm -r typecheck` 통과 확인 |

### 3. 보강 후속 (P1 — PR 머지 후 처리 가능)

- `vitest` 셋업 및 critical path 테스트 (engineer 권고) — `packages/features/news/__tests__/news.service.test.ts` 같은 SUT 가 비어있음
- `packages/db/AGENTS.md` 와 `apps/admin/AGENTS.md` 에 *Things That Will Bite You* 섹션 명시 (docs-sync 권고)
- `packages/features/auth` 의 `admin/public/shared` 3 분할 — 사용자 인증 미 도입 시 단일 `auth/` 로 축소 가능 (engineer YAGNI 권고)
- `next-auth v5 beta` peer warning — `next 16` 미지원 표기. 베타라 `overrides` 또는 신규 stable 대기

### 4. 본 base 의 verdict 통합 (workflow 자체 평가)

- 14 agent verify — 통합 (1) + code-reviewer + engineer + docs-sync + designer + evaluator
- 최종 판정: **ITERATE → PASS** (P0 6건 본 PR 에서 보강 완료, P1/NIT 는 다운스트림)
- 신뢰도: MED (drizzle 환경 분리 후 HIGH 재평가 가능)
