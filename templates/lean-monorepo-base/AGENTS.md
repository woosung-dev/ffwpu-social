# AGENTS.md — lean-monorepo-base

> Codex CLI / Cursor / Claude Code 자동 로드. **이 파일이 SSoT**, `CLAUDE.md` 는 사본/심링크.

Lean Level 1 monorepo — `apps/web` + `apps/admin` + `packages/db` (단 1 패키지).
1~3 인 sweet spot. 도메인 ≥ 5 또는 인원 ≥ 4 시 `templates/monorepo-base` (Level 2) 로 승격.

---

## Setup

루트에서 한 번에 끝나는 부트스트랩.

```bash
nvm use                         # .nvmrc — Node 20 LTS
corepack enable                 # pnpm 9.15.0 활성화
pnpm install                    # workspace 일괄 설치
cp .env.example .env.local      # 루트 + apps/web + apps/admin 3 곳
docker compose up -d postgres   # 로컬 DB (별도 docker-compose.yml 필요시)
pnpm db:migrate && pnpm db:seed # 스키마 적용 + 데모 데이터
pnpm dev                        # web :3000 + admin :3100 병렬
```

**구조 원칙**:
- `apps/*/app/` — Next.js 16 app router 루트 직접 (`src/` 생략)
- `apps/*/features/<domain>/{actions,service,db,schemas,ui}.ts` — vertical slice colocation, **flat 5 파일** 원칙
- `apps/*/components/ui/` — shadcn primitives 자체 복붙 (web/admin 격리)
- `packages/db` — DB schema SSoT, 양 앱이 `@repo/db` 로 import (source export → `transpilePackages`)
- `proxy.ts` / `auth.ts` / `tailwind.config.ts` / `app/globals.css` — 각 앱 자체 보유

**workspace 추가**:
```bash
pnpm --filter web add <pkg>       # web 만
pnpm --filter admin add <pkg>     # admin 만
pnpm --filter @repo/db add <pkg> # db 패키지
```

**도메인 결정 트리** (신규 도메인 추가 시):
1. 공개 사이트만? → `apps/web/features/<new>/` 만 추가
2. 어드민만? → `apps/admin/features/<new>/` 만 추가
3. 양쪽? → 양쪽 동시 생성 + `packages/db/src/schema/<new>.ts` 추가. 비즈니스 로직 중복 시 의도적으로만 분기 (공통 룰은 schema + Zod 로 끌어내림).

---

## Style

- **언어**: 사고/문서 한국어, 코드 영어, 주석 한국어. 새 파일 1줄차 한국어 헤더 (`// news 도메인의 서버 액션 모음`). 설정 파일 (`*.config.ts`, `package.json`) 면제.
- **모듈 경로**: `@repo/db` (workspace), `@/*` (앱 내부 — `apps/<app>/` 루트 기준 tsconfig paths).
- **도메인 colocation**: `features/<domain>/` 안 **5 파일 평평 구조** — `actions.ts` · `service.ts` · `db.ts` · `schemas.ts` · `ui.tsx`. 폴더 내 cross-import 자유, 다른 도메인은 `service.ts` 만 호출.
- **UI primitives**: shadcn 컴포넌트는 `apps/<app>/components/ui/` 에 복붙. **앱 간 공유 금지** — 디자인 분기 자유 확보. ⚠️ 양쪽 동시 패치 필요 시 둘 다 수정.
- **디자인 토큰**: 각 앱 `app/globals.css` 의 `@theme inline` + `@source` (Tailwind v4 CSS-first). `tailwind.config.ts` 는 stub (Config.content 제거).
- **Zod v4**: `.parse()` 강제, `safeParse` 는 폼 경계에서만. 스키마는 `features/<domain>/schemas.ts`.
- **Server Actions 우선**: `actions.ts` (`'use server'`) → `service.ts` (순수 비즈) → `db.ts` (Drizzle). Route handler 는 webhook/auth 콜백 외 금지.
- **import 정렬**: 외부 → `@repo/*` → `@/*` → 상대경로 4 단.
- **Next.js 16**: `proxy.ts` (not `middleware.ts`), `cacheComponents: true` 옵트인.

---

## Testing

현재 Sprint 0 — 테스트 러너 미설치. 검증은 다음 3 단으로 대신.

```bash
pnpm typecheck                  # tsc strict — 첫 방어선
pnpm lint                       # next lint (eslint-config-next 16)
pnpm build                      # 두 앱 + db 패키지 빌드 통과
```

**최소 검증 루프**:
1. `pnpm --filter @repo/db typecheck` — schema 변경 후 type 전파 확인
2. `pnpm --filter web typecheck && pnpm --filter admin typecheck` — 양 앱 격리 확인
3. `pnpm db:generate` 후 `migrations/` diff 사람 눈 검토 — 컬럼 rename 이 DROP+ADD 로 잡히는지 (`drizzle.config.ts` 의 `strict: true` 필수)
4. `pnpm dev` 기동 후 `/news` (web) + `/news` (admin) 양쪽 수동 확인

**Vitest 도입 시**: 루트 `pnpm test` → `turbo run test` 위임. `packages/db/tests/` 부터 시작 권장 (순수 함수).

---

## Security

**환경 변수**:
- `.env.local` 만 사용, 코드 하드코딩 금지. `.gitignore` 에 `.env*` + `!.env.example` 등록 확인.
- `apps/web/lib/env.ts` + `apps/admin/lib/env.ts` 에서 Zod 로 부팅 검증. `process.env` 직접 참조 금지.
- `DATABASE_URL` / `AUTH_SECRET` / `AUTH_URL` 은 URL 한 덩어리. host/port 분리 금지 (12-Factor).

**인증 경계**:
- `apps/admin/auth.ts` — Credentials provider, bcrypt 해시. 단일 super 계정 (v1.0).
- `apps/web/auth.ts` — OAuth 자리만 (1차는 비활성). 회원가입 폼 없음.
- `apps/*/proxy.ts` — host 분기 (`admin.example.com` vs `example.com`). **Node Runtime 만** (Edge 금지 — DB 풀 호환).
- 어드민 cookie 는 `__Secure-` 접두사 + `SameSite=Strict` + 별도 도메인. **AUTH_SECRET 양 앱 분리** 권장 (cookie 격리).

**DB 접근 경계**:
- 양 앱은 `@repo/db` 의 `client` 만 import. `postgres.js` 클라이언트는 패키지가 싱글톤 export.
- Drizzle row-level 쿼리는 `features/<domain>/db.ts` 안에서만. server action/component 에서 직접 SQL 금지.
- **마이그레이션 전용 role** 권장 — `pnpm db:migrate` 가 DDL 권한, 앱 런타임은 DML 만.

**공급망**:
- `pnpm-lock.yaml` 커밋 필수, `pnpm install --frozen-lockfile` CI 강제.
- shadcn 복붙 컴포넌트도 lint/typecheck 대상 — 외부 코드라도 audit.
- `@repo/db` 는 source export (`transpilePackages`) → drizzle-orm 메이저 업데이트 시 양 앱 빌드 동시 검증.

---

## 알려진 트레이드오프

- **shadcn 복붙 드리프트**: `components/ui/button.tsx` 가 web/admin 양쪽 → 한쪽 패치 시 디자인 갈라짐. 의도적 분기 자유의 대가.
- **schema 양쪽 빌드**: `@repo/db` source export → 양 앱이 두 번 컴파일. drizzle-orm 메이저 업데이트 주의.
- **turbo 의존**: 루트 scripts 가 `turbo run` 호출 → turbo 제거 시 `pnpm -r --parallel run` 로 치환 필요.
