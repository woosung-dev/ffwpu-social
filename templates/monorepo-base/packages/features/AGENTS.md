# `@myorg/features` — 도메인 로직·서버 액션·공유 컴포넌트

> 도메인 vertical slice SSOT. `apps/web` 과 `apps/admin` 이 **둘 다** import 하는 유일한 위치.
> 같은 도메인을 두 앱에 복제하지 말 것 — 모든 비즈니스 규칙·검증은 이 패키지에 한 번만.

## 폴더 구조

```
news/              vertical slice — 한 도메인
  actions/         "use server" — Next.js 서버 액션 (revalidatePath 책임)
  service/         비즈니스 규칙 (slug 중복·카테고리 활성·상태 전이)
  db/              DAL — Drizzle 쿼리만 (비즈니스 규칙 금지)
  schemas/         Zod v4 입력/출력 스키마 SSOT
  components/      서버/클라이언트 공유 React 컴포넌트
  __tests__/       vitest 단위 테스트 (다운스트림에서 vitest 추가 후 실행)
auth/
  admin/           Credentials + bcryptjs + super 1명 가드
  public/          OAuth slot (활성화 전 providers 빈 배열)
  shared/          공통 세션 타입·module augmentation
storage/           MinIO/R2/S3 driver 인터페이스 + registry
```

3-Layer 의존 방향: `actions → service → db → @myorg/db`. **역방향 금지** — db 가 service 를 import 하면 ESLint 가 막아야 한다.

## Setup

- 새 도메인 추가 = `packages/features/<도메인>/{actions,service,db,schemas,components}` 동일 5단 구조 복제.
- 추가 후 `packages/features/index.ts` 와 `package.json#exports` 에 서브패스 등록 (`./<도메인>` 등).
- `@myorg/db/schema` 변경 → `pnpm db:generate` → 본 패키지 db 레이어에서 `schema.<table>` 참조 갱신.
- auth 가드는 DI 방식 — `apps/admin/auth.ts` 부팅 시 `registerAdminAuth(auth)` 호출 필수. 미등록 시 `requireAdminSession()` 이 명시적 에러를 던진다.
- storage 도 동일 — `apps/*/storage.ts` 에서 `registerStorage(driver)` 호출.

## Style

- 모든 코드 파일 첫 줄 한국어 의도 주석 1줄.
- 서버 액션 파일은 반드시 `"use server"` 최상단. 컴포넌트가 client 면 `"use client"`.
- 서버 액션 반환은 `ActionResult<T>` discriminated union — 예외 throw 금지 (NEXT_REDIRECT 제외).
- DAL 함수명 컨벤션: `findById` / `findBySlug` / `list` / `create` / `update` / `remove`. service 는 `getX` / `listX` / `createX` 처럼 도메인 동사.
- 카테고리 `"all"` 은 **UI 필터 전용 slug** (`ALL_CATEGORY_SLUG`) — DB 카테고리로 저장 금지. service 가 `null` 로 변환해 DAL 에 전달.
- 익명 좋아요는 `sessionId` (클라 localStorage UUID) 만 — IP/ip_hash 수집 금지.
- 컴포넌트는 `@myorg/ui-base` primitives 위에 도메인 의미만. 색·폰트 토큰 박지 말 것 (각 앱 `globals.css` 가 SSOT).
- workspace import 만: `@myorg/db` / `@myorg/ui-base`. `apps/*` 역참조 금지.

## Testing

- 최소 게이트: `pnpm --filter @myorg/features typecheck` + `pnpm --filter @myorg/features lint`.
- 단위 테스트는 `__tests__/*.test.ts` — 다운스트림에서 `vitest` 추가 후 `pnpm test --filter @myorg/features` 로 실행.
- 우선순위: schemas → service → actions 순으로 테스트 작성. DAL 은 Drizzle integration test (Docker Postgres) 권장.
- 마이그레이션 변경이 동반된 PR 은 본 패키지 DAL 변경과 **같은 커밋**에 묶을 것 (atomic).
- 어드민 인증 변경 시 로그인 페이지 수동 검증 + `requireAdminSession()` 단위 테스트 (DI 주입 모킹) 필수.

## Security

- 환경변수 직접 참조 금지 — 본 패키지는 `process.env` 를 읽지 않는다. 모든 설정값은 호출 앱에서 주입 (DI: `registerAdminAuth` / `registerStorage`).
- 비밀번호: bcryptjs 해시만 DB 저장. 평문 저장·로그 출력 절대 금지. `verifyPassword` 만 사용.
- super 역할 가드: `requireAdminSession()` 이 `session.user.role === "super"` 확인. 다른 역할은 `UnauthorizedError`.
- 모든 서버 액션 입력은 Zod `safeParse` — DAL 에 raw 입력 전달 금지.
- `revalidatePath` 는 actions 에서만 호출 (service/DAL 에서 호출 시 SSR 컴포넌트 트리 오염).
- DB 쓰기는 service 레이어 통과 필수 — 컴포넌트/페이지가 DAL 직접 호출 금지.
- 스토리지 key 정규식 (`uploadInputSchema`) 우회 금지. 사용자 입력 파일명은 반드시 sanitization 후 key 생성.
- LLM 이 카테고리 enum 을 하드코딩하려 하면 거부 — `categories` 테이블 동적 관리가 SSOT (ADR-025).

## Things That Will Bite You

- `service` 가 `actions` 를 import 하면 server action runtime 이 클라이언트 번들로 새어나간다 — 항상 actions → service 방향만.
- `categoryRepo.deactivate` 만 사용. `db.delete(categories)` 직접 호출 시 외래키 연결된 news 가 끊긴다.
- `heartCount` 는 `news` 테이블 캐시. `heart_events` insert/softDelete 와 **항상 같이** `bumpHeartCount` 호출 (heart.service 에서만).
- `NewsForm` 의 server action 호출은 `useTransition` 안에서 — 안 그러면 form pending 상태가 안 잡힌다.
- `registerAdminAuth` / `registerStorage` 호출 누락 → 런타임 명시적 에러. apps/*/auth.ts 부팅 코드에서 반드시 호출.
