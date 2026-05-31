# AGENTS.md — monorepo-base (루트)

> Next.js 16 + Drizzle 0.36 + NextAuth v5 + Tailwind v4 도메인 분리 monorepo 템플릿의 **루트 운영 가이드**.
> nested AGENTS.md (`apps/*` `packages/*`) 가 *closest-wins* 규칙으로 더 구체적인 지침을 가진다.
> 루트는 **메타·전체 흐름·도메인 간 계약**만 다룬다. 중복 금지.

---

## Setup

- **버전 고정**: node 20.x + pnpm 9.15.x. `.nvmrc` / `package.json#engines` / `package.json#packageManager` 3 곳 동일 (Node version drift 방지).
- **설치**: `pnpm install` 한 번이면 전체 workspace 링크 완료. `--frozen-lockfile` 은 CI/Vercel 에서만.
- **로컬 DB**: Docker Postgres (`.env.example` 의 `DATABASE_URL` 참조). 프로덕션 Neon/RDS/Supabase 동일 URL 형식.
- **앱 분리**: `apps/web` 과 `apps/admin` 은 각각 자체 `proxy.ts` / `auth.ts` / `tailwind.config.ts` / `globals.css` 보유 — 디자인·인증·라우팅 SSOT 가 앱 내부에 있음.
- **신규 도메인 추가 순서**: `packages/db/schema/<도메인>.ts` → `pnpm db:generate` → `packages/features/<도메인>/` → `apps/*` 라우트에서 `@myorg/features/<도메인>` import.
- **Vercel 배포**: 프로젝트 2개 분리. Root Directory 를 각각 `apps/web` / `apps/admin` 으로 설정, Install Command 는 `pnpm install --frozen-lockfile`, Build Command 는 `pnpm --filter @myorg/<app> build`.

## Style

- **TypeScript strict + Zod v4 (v3 ❌)** 전 워크스페이스 강제. `tsconfig.base.json` 가 모든 패키지의 `extends` 진입점.
- **워크스페이스 import 만 허용**: `@myorg/db`, `@myorg/features`, `@myorg/ui-base`, `@myorg/config`. **apps 간 직접 import 금지** — `apps/admin` 에서 `apps/web/*` 임포트 시 ESLint `no-restricted-imports` 차단 (turbo cache 그래프 오염 방지).
- **`packages/ui-base` 는 untheme primitives 만**: 색·폰트 토큰을 절대 박지 않는다. 각 앱 `globals.css` 의 Tailwind v4 `@theme inline` 에서 토큰 주입 (디자인 분리 SSOT).
- **`packages/features/<도메인>` 은 vertical slice**: `queries.ts` / `actions.ts` / `schema.ts` / `components/` 한 폴더에 묶음. 도메인 간 직접 import 금지 — 공유가 필요하면 `db` 또는 `ui-base` 로 내림.
- **파일 첫 줄 한국어 1줄 역할 주석** (`.ts/.tsx/.js/.mjs` 만, 설정 파일 면제). 의도만 적고 길게 쓰지 않는다.
- **커밋**: Conventional Commits + 스코프 (`feat(web):`, `feat(db):`, `chore(repo):`).

## Testing

- **최소 게이트**: `pnpm typecheck` + `pnpm lint` + `pnpm build`. CI 에서 3개 모두 통과해야 머지 가능.
- **도메인 단위 테스트**: `packages/features/<도메인>/__tests__/` 에 vitest 권장 (템플릿은 vitest 미포함 — 다운스트림에서 추가).
- **DB 마이그레이션 PR**: 로컬에서 `pnpm db:generate` 후 SQL diff 를 **반드시 함께 커밋**. LLM 생성 마이그레이션은 사람이 SQL 검토 후 머지.
- **e2e 게이트**: Vercel preview 배포가 실질 e2e. PR 머지 전 web/admin 두 preview URL 수동 검증.
- **어드민 인증 변경**: `apps/admin/auth.ts` 직접 호출 단위 테스트 + 로그인 페이지 수동 검증 필수.

## Security

- **환경변수 하드코딩 금지**. `.env.local` 또는 Vercel 대시보드만. `.env.example` 에 없는 변수를 코드에서 참조 금지.
- **시크릿 분리**: `AUTH_SECRET` 은 web/admin 별도 발급 (세션 쿠키 교차 위조 방지). `DATABASE_URL` 만 공유 가능. 쿠키 도메인도 분리 (`.test.com` 공유 ❌, `test.com` / `admin.test.com` 분리 ✅).
- **NextAuth v5 모드 분리**: admin = Credentials + bcryptjs 해시 (평문 비번 DB 저장 금지·super 1명 한정). web = OAuth provider slot — providers 배열이 빈 상태로 활성화하면 라우트 핸들러가 500 응답하므로 활성화 전 placeholder 처리.
- **Runtime 명시**: 각 앱 `proxy.ts` 는 Node Runtime 강제. Edge 금지 (`next-auth` / `postgres` 동작 불가). `export const runtime = 'nodejs'` 또는 `proxy.ts` 명시.
- **DB 접근 경계**: server component / server action / route handler 에서만. `'use client'` 파일에서 `@myorg/db` import 금지 (ESLint `no-restricted-imports`).
- **Drizzle 안전**: `packages/db/drizzle.config.ts` 에 `strict: true` + `verbose: true` 고정 — 컬럼 rename 시 DROP+ADD 오인지로 인한 데이터 손실 방지.
- **MCP / LLM 생성 코드**: 검토 없이 머지 금지. 특히 마이그레이션 SQL, 권한 변경, .env 추가는 사람 리뷰 필수.
