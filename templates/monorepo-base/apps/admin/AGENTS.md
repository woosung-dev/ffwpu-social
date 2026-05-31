# apps/admin — 운영자 어드민 앱 (Next.js 16)

> 운영자 1명(super) Credentials 로그인. `admin.<domain>` 서브도메인 배포.
> 루트 AGENTS.md 의 메타·도메인 규칙은 그대로 적용, 본 파일은 admin 고유 규칙만.

## Setup

- `pnpm dev:admin` (워크스페이스 루트) → 포트 3001. 또는 `pnpm --filter @myorg/admin dev`.
- 필수 환경 변수: `AUTH_SECRET` (web 과 별도 발급), `AUTH_URL`, `DATABASE_URL` — `.env.example` 참조.
- super 계정 시드는 `packages/db` 의 seed 스크립트에서 생성 (`bcryptjs.hash(password, 10)`). 평문 비번 코드/DB 저장 금지.
- Vercel: Root Directory = `apps/admin`, Install Command = 루트 `pnpm install --frozen-lockfile`, Build Command = `pnpm --filter @myorg/admin build`.

## Style

- App Router 라우트 그룹: `(auth)/login` (비인증) + `(panel)/*` (인증 필수). 그룹은 URL 에 노출되지 않음.
- 디자인 토큰은 `app/globals.css` 의 `@theme inline` 에 운영 톤 (중립·고대비) 으로 직접 정의 — `packages/ui-base` 는 untheme primitives 만 import.
- 서버 액션 / 쿼리는 `@myorg/features/news` 등 features 패키지에서 import. 본 앱에 도메인 로직 작성 금지 (web 과 공유 SSOT).
- 파일 첫 줄 한국어 1줄 역할 주석 (코드 파일만 — config 면제).
- 커밋: `feat(admin):` / `fix(admin):` / `chore(admin):`.

## Testing

- 최소 게이트: `pnpm --filter @myorg/admin typecheck` + `lint` + `build`.
- 인증 변경 시 로컬에서 `/login` → `/dashboard` 리다이렉트 + 비인증 접근 시 `/login` 강제 흐름 수동 검증.
- `auth.ts` 직접 import 단위 테스트는 vitest 권장 (템플릿 미포함 — 다운스트림 추가).

## Security

- **AUTH_SECRET 은 web 과 절대 공유 금지** — 도메인 간 세션 쿠키 위조 방지. Vercel 프로젝트별 분리 발급.
- Credentials provider 만 활성, OAuth 미사용. `authorize()` 에서 `role !== 'super'` 거부 — 일반 사용자 로그인 차단.
- 비밀번호는 항상 `bcryptjs.compare` 로 검증. 평문 비교·DB 저장 절대 금지.
- `proxy.ts` 는 Node Runtime 강제 (`export const runtime = 'nodejs'`). Edge 사용 시 `next-auth` / `postgres` 미동작.
- DB 접근은 server component / server action / route handler 에서만. 클라이언트 컴포넌트에서 `@myorg/db` import 금지.
- `.env.example` 에 없는 변수 코드 참조 금지. 시크릿 하드코딩 금지.
