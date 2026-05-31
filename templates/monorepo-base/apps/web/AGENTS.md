# @myorg/web — 사용자 사이트 (Next.js 16 app router)

> 닫힘 우선(closest-wins) 적용 — 루트 AGENTS.md 와 모순되는 web 고유 규칙만 여기 둠.

## Setup

- 포트 3000. `pnpm dev:web` 또는 `pnpm --filter @myorg/web dev`.
- 워크스페이스 패키지(`@myorg/db|features|ui-base|config`)는 `next.config.ts` 의 `transpilePackages` 에 등록되어 있어 소스 import 그대로 동작.
- `.env.local` 은 `apps/web/.env.example` 을 복사해 채움 — `AUTH_SECRET` 은 admin 과 절대 공유 금지(`openssl rand -base64 32`).
- Vercel: Root Directory = `apps/web`, Install Command = (워크스페이스 루트) `pnpm install --frozen-lockfile`, Build = `pnpm --filter @myorg/web build`.

## Style

- Next.js 16 규칙 — `middleware.ts` 가 아니라 `proxy.ts`. `params` / `searchParams` 는 항상 `Promise<>` 타입으로 받고 `await` 후 사용.
- 디자인 토큰 SSOT 는 `app/globals.css` 의 `@theme inline` 블록 — `@myorg/ui-base` 에 색·폰트를 박지 말 것(헤드리스 primitives 유지).
- 컴포넌트 import 는 `@myorg/ui-base/components/<name>` / `@myorg/features/<도메인>/...` 만. `apps/admin/*` 를 직접 import 금지(ESLint `no-restricted-imports`).
- 파일 첫 줄 한국어 1줄 의도 주석(설정 파일 제외).
- 커밋 prefix: `feat(web):` / `fix(web):` / `chore(web):`.

## Testing

- 최소 게이트 = `pnpm --filter @myorg/web typecheck` + `pnpm --filter @myorg/web lint` + `pnpm --filter @myorg/web build`.
- `/news` 목록·상세 라우트는 `@myorg/features/news` 의 `listPublishedNews` / `getPublishedNewsBySlug` export 변경 시 함께 검증.
- proxy.ts 수정 시 도메인 분리 가드(`/admin` 차단)가 동작하는지 수동 확인.
- Vercel preview = 실질 e2e 게이트.

## Security

- `proxy.ts` 는 `export const runtime = "nodejs"` 강제(Edge 시 next-auth/postgres 깨짐).
- `/api/auth/[...nextauth]` 는 `hasActiveProviders` false 일 때 404 응답 — 빈 providers 로 인한 500 누설 방지.
- DB 접근(`@myorg/db`)은 server component / server action / route handler 에서만. 클라이언트 컴포넌트(`'use client'`)에서 import 금지.
- `AUTH_SECRET` 은 web 전용. admin 과 공유 시 세션 쿠키 교차 위조 위험 — 별도 secret + 도메인 분리 쿠키.
- 외부 이미지는 `next.config.ts` `images.remotePatterns` 화이트리스트에 명시.
