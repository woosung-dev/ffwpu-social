# apps/admin — 어드민 앱 (Credentials 인증 + 도메인 분리)

> 사회공헌국 단독 운영 어드민. v1.0 super 단일 계정. `admin.<main>` 서브도메인 분리.
> 디자인은 운영 효율 우선 (사이드바 + 단순 폼). 공개 앱과 디자인 토큰 의도적 분리.

---

### Setup

```bash
cp .env.example .env.local                # AUTH_SECRET 은 openssl rand -base64 32
pnpm install                              # workspace 일괄 (루트에서 실행 권장)
pnpm --filter @repo/db migrate            # 스키마 적용
pnpm --filter @repo/db seed               # super 계정 + 데모 데이터
pnpm --filter admin dev                   # :3100
```

**구조 원칙**:
- `app/` — Next.js 16 app router 직접 (`src/` 생략). `(auth)/login` + `(panel)/*` 2 그룹.
- `features/news/{actions,service,db,schemas,ui}.ts` — 5 파일 colocation. cross-import 금지.
- `components/layouts/AdminSidebar.tsx` — 패널 그룹 공통 사이드바.
- `components/ui/` — shadcn primitives 자체 복붙. web 과 격리.
- `proxy.ts` — host 분기 + auth 가드 (Node Runtime).
- `auth.ts` — Credentials provider, bcrypt 해시.

**도메인 추가 시**:
1. `packages/db/src/schema/<domain>.ts` 에 테이블 추가 → `pnpm db:generate && pnpm db:migrate`.
2. `apps/admin/features/<domain>/` 5 파일 평평하게 작성.
3. `app/(panel)/<domain>/page.tsx` 라우트 추가, 사이드바 메뉴 항목 추가.

---

### Style

- **언어**: 사고/문서 한국어, 코드 영어. 새 파일 1줄차 한국어 의도 주석.
- **모듈 경로**: `@repo/db` (workspace), `@/*` (앱 루트). 상대 import 는 같은 도메인 안에서만.
- **도메인 colocation**: `features/<domain>/` 안 5 파일 평평. 다른 도메인은 `service.ts` export 만 호출.
- **Server Actions 우선**: `actions.ts` (`"use server"`) → `service.ts` (순수 비즈) → `db.ts` (Drizzle). Route handler 는 NextAuth 콜백만.
- **UI primitives**: `components/ui/*` 는 shadcn 패턴 복붙. **web 과 동기화 안 함** — 디자인 분기 자유.
- **Zod v4**: `features/<domain>/schemas.ts` 가 SSoT. action 입력은 `.parse()` 강제.
- **폼**: `react-hook-form` + `@hookform/resolvers/zod`. `components/ui/form.tsx` 의 RHF wrapper 사용.
- **디자인 토큰**: `app/globals.css` `@theme inline` 에 정의. 운영자 화면이라 채도 낮은 중성 톤.
- **import 정렬**: 외부 → `@repo/*` → `@/*` → 상대 4 단.

---

### Testing

현재 Sprint 0 — 테스트 러너 미설치. 검증은 다음 3 단으로 대신.

```bash
pnpm --filter admin typecheck    # tsc strict — 첫 방어선
pnpm --filter admin lint         # next lint
pnpm --filter admin build        # prod 빌드 통과
```

**최소 검증 루프**:
1. `pnpm --filter @repo/db typecheck` 후 admin typecheck — schema 타입 전파 확인.
2. `pnpm dev:admin` 기동 → `/login` 접근 → super 계정 로그인 → `/news` CRUD 확인.
3. `proxy.ts` 가드 — 로그아웃 상태로 `/news` 접근 시 `/login?from=/news` 리다이렉트 확인.
4. `pnpm db:generate` 후 `migrations/` diff 사람 눈 검토 (rename 이 DROP+ADD 로 잡히는지 — `strict: true` 필수).

---

### Security

**환경 변수**:
- `.env.local` 만 사용. `lib/env.ts` 에서 Zod 로 부팅 검증. `process.env` 직접 참조 금지.
- `DATABASE_URL` / `AUTH_SECRET` / `AUTH_URL` 한 덩어리 URL.

**인증 경계**:
- Credentials provider + bcrypt 비교, **super 역할 강제** (`authorize` 가 role !== "super" 거부).
- 세션 쿠키: `__Secure-admin.session-token` + `SameSite=Strict` + Domain 미설정 (서브도메인 격리).
- `proxy.ts` 가 `(panel)/*` 진입 전 `auth()` 호출 — 로그인 페이지·NextAuth 콜백만 통과.
- 비밀번호는 평문 저장 금지. `pnpm --filter @repo/db seed` 가 bcrypt 해시 생성.

**DB 접근 경계**:
- `@repo/db` 의 `db` 클라이언트만 import. `postgres.js` 직접 생성 금지.
- Drizzle 쿼리는 `features/<domain>/db.ts` 안에서만. server action 에서 직접 SQL 금지.

**공급망**:
- `pnpm-lock.yaml` 커밋 필수, CI 는 `--frozen-lockfile`.
- shadcn 복붙 컴포넌트도 lint/typecheck 대상.
- 어드민 앱은 검색엔진 노출 차단 (`next.config.ts` 의 `X-Robots-Tag: noindex`).
