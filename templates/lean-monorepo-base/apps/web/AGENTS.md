# apps/web — 공개 사이트 (Next.js 16)

> Lean Monorepo 의 공개 라우트 앱. 도메인 분기: `example.com` ↔ `admin.example.com` (apps/admin).
> 공통 규칙은 루트 `AGENTS.md`. 본 파일은 web 앱 *고유* 결정만.

---

## Setup

```bash
# 루트에서 한 번에 (권장)
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm db:migrate && pnpm db:seed   # @repo/db 패키지 자동 실행
pnpm dev:web                       # :3000 단독
# 또는 pnpm dev (web :3000 + admin :3100 병렬)
```

**의존**: `@repo/db` (workspace:\*), `next-auth@beta`, `drizzle-orm`, `zod@4`, `tailwindcss@4`.

**파일 진입점**:
- `app/` — Next.js 16 app router (★ `src/` 생략)
- `app/(public)/` — Route Group, 공개 라우트 묶음
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handlers (OAuth 자리)
- `proxy.ts` — host 분기 (admin host 요청 차단, Node Runtime)
- `auth.ts` — NextAuth v5 인스턴스 (1차 비활성)
- `features/news/` — vertical slice: actions·service·db·schemas·ui
- `components/ui/` — shadcn primitives 자체 사본 (admin 과 분리)
- `components/layouts/` — Header/Footer 공개 사이트 전용
- `lib/env.ts` — Zod env 검증 (process.env 직접 참조 금지 진입점)

---

## Style

- **언어**: 사고/문서 한국어, 코드 영어, 주석 한국어. 새 파일 1줄차 한국어 헤더.
- **모듈 경로**:
  - `@repo/db` — workspace 패키지 (schema·client SSoT)
  - `@/*` — `apps/web/` 루트 (tsconfig paths)
- **3-layer 진입**: page/Server Component → `service.ts` → `db.ts`. service 에서 `@repo/db` 직접 import 금지 (반드시 `db.ts` 경유).
- **Server Component 기본값**: `"use client"` 는 leaf 만. 페이지·레이아웃 금지.
- **Zod v4**: `.parse()` 강제. 폼 경계만 `safeParse`. 스키마는 `features/<domain>/schemas.ts` 단일 출처. slug regex 와 정규화 함수는 같은 파일에서 export.
- **Server Actions 우선**: `actions.ts` (use server) 진입. Route Handler 는 webhook/auth 콜백 외 금지.
- **Tailwind v4 CSS-first**: 토큰은 `app/globals.css` 의 `@theme inline` 에만. `tailwind.config.ts` 는 IDE 자동완성 stub.
- **shadcn 격리**: admin/web 분리 사본. 양 앱 동시 패치 필요 (드리프트 위험).
- **import 정렬**: 외부 → `@repo/*` → `@/*` → 상대.

---

## Testing

테스트 러너 미설치 (Sprint 0). 검증 3단:

```bash
pnpm --filter web typecheck    # tsc strict — 첫 방어선
pnpm --filter web lint         # next lint
pnpm --filter web build        # 프로덕션 빌드 통과
```

**최소 루프**:
1. schema 변경 시 `pnpm db:generate` → `migrations/` diff 검토 (drizzle-kit strict 가 컬럼 rename 을 DROP+ADD 로 잡는지 확인).
2. `pnpm dev:web` 기동 → `http://localhost:3000` 랜딩, `/news` 목록, `/news/[slug]` 상세 수동 확인.
3. `proxy.ts` 동작 확인: `curl -H "Host: admin.localhost" http://localhost:3000/` → 404 응답.

**Vitest 도입 시**: `features/news/service.test.ts` 부터 (db 함수 mock).

---

## Security

- **환경변수**: `.env.local` 만, 코드 하드코딩 금지. `lib/env.ts` 의 Zod 검증을 거치지 않은 `process.env` 직접 참조 금지.
- **DB 접근**: `@repo/db` 의 `db` client 만 사용. `features/<domain>/db.ts` 안에서만 Drizzle 호출. Server Action/Component 에서 직접 SQL 금지.
- **인증 경계**:
  - 1차 OAuth 비활성. `auth.ts` providers 배열은 비어있음.
  - 활성화 시 `__Secure-` 쿠키 + `SameSite=Lax` (web), `Strict` (admin) — admin 과 cookie 도메인 분리 필수.
  - `userId` 를 클라이언트→서버 인자로 전달 금지. server 에서 `auth()` 로 직접 추출.
- **proxy.ts**: Node Runtime 전용. `admin.*` host 요청은 차단 (인프라 라우팅 오설정 안전망). Edge Runtime 금지 (DB 풀 비호환).
- **공급망**: `pnpm install --frozen-lockfile` CI 강제. shadcn 복붙 컴포넌트도 lint/typecheck 대상.
