# @myorg/db — Drizzle 스키마 / 클라이언트 / 마이그레이션 SSOT

> 이 폴더는 **DB 도메인의 단일 진실 공급원**. 테이블 정의 / 마이그레이션 / 클라이언트 싱글톤 / seed 모두 여기서 시작한다.
> 루트 `AGENTS.md` 와 중복되는 메타 규칙은 적지 않는다 — *DB 고유 규칙만*.

## Setup

- Node 20.x + pnpm 9.15.x. 루트에서 `pnpm install` 한 번이면 workspace 링크 완료.
- `DATABASE_URL` 환경변수 필수 — Docker Postgres / Neon / RDS 동일 포맷 (`postgres://user:pass@host:port/db`).
- 스키마 변경 → 마이그레이션 생성 → 적용 순서:
  ```bash
  pnpm db:generate    # schema/*.ts 변경 후 SQL diff 생성 (packages/db/migrations/)
  pnpm db:migrate     # DATABASE_URL 대상으로 실제 적용
  pnpm db:studio      # 브라우저로 DB 검사
  pnpm db:seed        # 초기 카테고리 4종 + super 어드민 시드 (SEED_ADMIN_* env 필요)
  ```
- 새 도메인 추가 순서: `schema/<도메인>.ts` 파일 추가 → `schema/index.ts` 재수출 → `schema/relations.ts` 관계 추가 → `pnpm db:generate` → 생성된 SQL 검토 후 커밋.

## Style

- 파일 첫 줄 한국어 1줄 역할 주석 (테이블의 도메인 의미).
- 테이블 분리는 **도메인 단위** (`users.ts` / `categories.ts` / `news.ts` / `news-tags.ts` / `heart-events.ts`). 한 파일에 여러 테이블 묶지 말 것.
- 컬럼 네이밍은 코드 camelCase + DB snake_case. `drizzle.config.ts` `casing: "snake_case"` 로 자동 매핑 — `pg-core` 컬럼 이름 인자에 직접 `snake_case` 명시.
- PK 는 `uuid().primaryKey().defaultRandom()` 통일 (auto-increment 사용 금지 — Vercel/멀티리전 충돌 회피).
- 타임스탬프는 `timestamp("...", { withTimezone: true }).notNull().defaultNow()` 강제 — 타임존 누락 금지.
- 외래키는 `onDelete` 정책 **반드시 명시** (`restrict` / `cascade` 둘 중 하나 의식적 선택). 기본값 묵시 금지.
- 익명 좋아요(`heart_events`)는 `sessionId` 만 — IP/User-Agent 컬럼 추가 금지 (개인정보 보호, ADR-026).
- 카테고리는 `categories` 테이블 동적 관리 — enum/하드코딩 금지 (운영 자율성, ADR-025). UI 필터 "전체" 는 `ALL_CATEGORY_SLUG` 상수 사용 (DB 저장 금지).
- `client.ts` 는 `import "server-only"` 강제 — 클라이언트 번들 누수 차단.

## Testing

- 최소 게이트: `pnpm typecheck` (schema 타입 추론 확인).
- 마이그레이션 변경 PR 은 **로컬에서 `pnpm db:generate` 실행 후 `migrations/*.sql` diff 를 반드시 같이 커밋**. SQL 직접 편집 금지 (`generate` 재실행 시 덮어쓰기).
- 스키마 변경 영향 큰 PR (rename / drop) 은 codex consult 로 SQL diff 2차 검토.
- seed 검증: 로컬 빈 DB → `pnpm db:migrate` → `pnpm db:seed` 2회 실행 → 멱등(중복 행 없음) 확인.

## Security

- `DATABASE_URL` 하드코딩 금지 — 코드에서 `process.env.DATABASE_URL` 만 참조. `.env.example` 에 없는 변수 추가 시 `.env.example` 먼저 갱신.
- `client.ts` 는 `server-only` 모듈. RSC / Server Action / Route Handler 외에서 import 시도 시 빌드 실패해야 정상.
- LLM 이 생성한 마이그레이션 SQL 은 **사람이 diff 검토 후 머지**. `DROP COLUMN` / `DROP TABLE` 등장 시 의도 확인 필수.
- `drizzle.config.ts` 의 `strict: true` 절대 해제 금지 — 컬럼 rename 이 DROP+ADD 로 처리되어 운영 데이터 손실 (ADR-001b).
- bcryptjs 해시 외 평문 비밀번호 컬럼 추가 금지. `users.passwordHash` 만 인증 자격 저장.

## 의존 컨트랙트 (다른 패키지가 의존하는 export)

- `db` (Drizzle 인스턴스) — `@myorg/features` server action / `apps/*/auth.ts` 에서 사용.
- 테이블 객체: `users` `categories` `news` `tags` `newsTags` `heartEvents` — `@myorg/features` queries / actions 가 직접 import.
- 타입: `User` `Category` `News` `NewNews` `Tag` `NewsTag` `HeartEvent` 등 `$inferSelect` / `$inferInsert` 추론 타입.
- 상수: `ALL_CATEGORY_SLUG` — UI 필터 컴포넌트가 import (DB 저장 금지 가드).
- seed: `INITIAL_CATEGORIES` `seed(db, opts)` — 다운스트림 프로젝트가 자체 seed 스크립트 작성 시 재사용.
