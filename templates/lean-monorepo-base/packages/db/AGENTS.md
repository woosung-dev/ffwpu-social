# @repo/db — DB SSoT

> 양 앱(`apps/web`, `apps/admin`)이 동일 schema 를 공유하는 단일 패키지.
> Drizzle ORM + postgres.js + Zod. 스키마·클라이언트·마이그레이션·seed 가 여기에만 산다.

## features 어휘 (통일)

양 앱의 `features/<domain>/{schemas,db,service,actions,ui}` 에서 동일 이름·타입을 쓰도록 본 패키지에서 끌어내림.

| 어휘 | 타입 | 위치 | 용도 |
|------|------|------|------|
| `status` | `pgEnum("news_status", ["draft","published","archived"])` | `news.status` | 발행 상태 — Zod `.enum([...])` 로 매핑 |
| `body` | `jsonb` | `news.body` | Tiptap JSON document — 클라/서버 동일 shape |
| `summary` | `text` (nullable) | `news.summary` | 목록 카드용 짧은 발췌 |
| `name` | `varchar(50)` | `categories.name` | 표시 라벨 — 짧고 인덱스 가능 |
| `slug` | `varchar(50~200)` | `categories.slug`, `news.slug` | URL immutable, kebab-case |

> 양 앱이 `import { news, type News, type NewNews, newsStatus } from "@repo/db"` 만으로 schema·타입·enum 을 전부 얻도록 유지. drizzle-zod 브릿지(`createInsertSchema(news)`)는 `apps/<app>/features/news/schemas.ts` 에서 작성 — DB 패키지는 schema 만, Zod 변환은 도메인에서.

## Setup

```bash
# 루트에서 (workspace install 후)
cp ../../.env.example ../../.env.local
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"  # 로컬

pnpm --filter @repo/db generate    # schema 변경 후 SQL 생성
pnpm --filter @repo/db migrate     # DB 에 적용
pnpm --filter @repo/db seed        # 데모 카테고리 4종 + super 어드민 1개 + 샘플 news
pnpm --filter @repo/db studio      # drizzle-kit studio — 브라우저 DB inspector
```

**최초 셋업 (템플릿 복제 직후)**:
1. `migrations/0000_init.sql` 삭제
2. `pnpm db:generate` — 5 테이블 init SQL 생성
3. `pnpm db:migrate` — 적용
4. `pnpm db:seed` — 데모 데이터

## Style

- **import 경로**: 양 앱에서 `@repo/db` (배럴) 또는 `@repo/db/schema` (schema 만). `@repo/db/client` 는 client 직접 필요 시.
- **스키마 1파일 = 1테이블**. `src/schema/index.ts` 가 배럴. drizzle-kit 은 `drizzle.config.ts` 의 `schema: "./src/schema"` 로 자동 수집.
- **timestamp 는 `withTimezone: true` 고정** — 클라/서버 TZ 어긋남 방지. `created_at`/`updated_at`/`published_at`/`deleted_at` 4종 표준.
- **UUID PK 표준** (`uuid("id").primaryKey().defaultRandom()`). auto-increment 정수 금지 — 퍼블릭 ID 노출 위험.
- **enum 은 `pgEnum`** + `varchar({ enum: [...] })` 혼용 금지. 단, role 처럼 작은 set 은 `varchar({ enum: [...] })` 허용 (마이그레이션 단순).
- **soft delete 컨벤션**: `deletedAt: timestamp` nullable. 좋아요(`heart_events`) 같은 토글 모델에 사용. CRUD 본문(news)은 hard delete.

## Testing

> Sprint 0 — 테스트 러너 미설치. typecheck + 마이그레이션 dry-run 으로 대신.

```bash
pnpm --filter @repo/db typecheck            # tsc strict
pnpm --filter @repo/db generate              # SQL 생성 → migrations/ diff 사람 검토 (DROP+ADD 검출)
DATABASE_URL=... pnpm --filter @repo/db migrate   # 로컬 DB 적용
```

**검토 체크포인트**:
1. `pnpm db:generate` 직후 `git diff migrations/` — 의도 외 DROP/ADD 가 있는지 사람 눈 확인 (ADR-001b `strict: true` 가 rename 을 DROP+ADD 로 표면화)
2. 컬럼 rename: drizzle-kit 가 interactive prompt → CI 에서는 새 컬럼 추가 → 데이터 마이그레이션 → 옛 컬럼 제거 2단계 배포
3. `seed.ts` 는 멱등이어야 함 — `onConflictDoUpdate` / `onConflictDoNothing` 누락 시 반복 실행 실패

Vitest 도입 시: `packages/db/tests/` 부터 — 순수 schema 함수 (예: slug regex) 가 시작점.

## Security

- **`DATABASE_URL` 단일 환경변수** (12-Factor). host/port/user/pass 분리 금지. URL 한 덩어리.
- **`.env*` 는 `.gitignore`**. `.env.example` 만 커밋 (`!.env.example`).
- **마이그레이션 role 분리 권장**: 운영 DB 에서 `pnpm db:migrate` 실행 권한은 별도 role (DDL 권한 있음). 앱 런타임은 DML 만 가능한 role 로 분리 — 권한 누수 방지.
- **postgres.js 클라이언트 싱글톤** (`src/client.ts`): `globalThis.__pg` 캐시로 Next.js dev 핫리로드 시 커넥션 누수 방지. **Edge Runtime 금지** (TCP pool 미호환). `proxy.ts` 는 Node Runtime 만 사용.
- **개인정보**: `users.password_hash` 는 bcrypt (admin 앱 책임). `heart_events.session_id` 는 클라 localStorage UUID — IP/User-Agent 미수집 (개인정보 보호 제약).
- **공급망**: `pnpm-lock.yaml` 커밋 필수. drizzle-orm / drizzle-kit / postgres 메이저 업그레이드는 별도 PR + 마이그레이션 dry-run.
