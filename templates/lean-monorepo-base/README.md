# lean-monorepo-base

Lean Level 1 monorepo template — `apps/web` + `apps/admin` + `packages/db` (단 1 패키지).

> **언제 쓰나:** 1~3인 팀, 단일 도메인, web/admin 분리 + 공통 DB schema 만 필요할 때.
> 도메인 5개 이상 또는 4인 이상으로 늘어나면 `templates/monorepo-base` (Level 2) 로 마이그레이션.

---

## 규모별 선택 가이드 — 세 템플릿 비교

| 항목 | single-app | **lean-monorepo-base** ⭐ (이 템플릿) | monorepo-base |
|---|---|---|---|
| 적합 규모 | 1인 + 1앱 (랜딩·MVP) | **1~3인 + 2앱 sweet spot** | 3~5인 + 큰 도메인 (20+ features) |
| apps | 1 (Route Groups 만) | 2 (web + admin) | 2~N |
| packages | 0 | **1 (db only)** | 4+ (db + features + ui-base + config) |
| UI primitives | `src/components/ui/` | 각 앱 `components/ui/` (shadcn 복붙) | `packages/ui-base/` |
| 도메인 로직 위치 | `src/features/` | **각 앱 `features/`** | `packages/features/` |
| 디자인 토큰 | 단일 globals.css | 앱별 globals.css | 앱별 globals.css + tokens preset |
| 첫 셋업 비용 | 30분 | **1~2시간** | 4~8시간 |
| 진화 비용 | → lean 으로 마이그레이션 시 폴더 분할 | → monorepo-base 로 승급 시 packages 추출 | 자체 진화 |

→ **이 템플릿이 sweet spot 인 이유** — 2-3인 바이브 코딩 팀 대부분이 *packages/features 와 packages/ui-base 의 운영 비용 > 공유 이득* 인 단계에서 멈춰있음. 자료 검토 결과 ([daily.dev 2026 monorepo], [FSD 공식 — 20+ features 기준], [Pro Next.js — shared deploy targets only]) 모두 같은 결론.

---

## Lean 철학 — 왜 packages/features / ui-base 가 없는가?

1. **YAGNI (Premature Abstraction 회피)** — 도메인 1~3개일 때 `packages/features/<domain>/` 분리는 *동일 코드를 더 깊은 경로에 두는 것*. 앱 1곳에서 import 하면 패키지 분리 가치 0.
2. **UI 복붙이 *분리 패키지보다* 빠른 단계** — shadcn primitives 4~10종 양 앱에 복붙하는 비용 < `packages/ui-base/` 의 publish·version·import 경로 관리 비용 (1~3인 팀 기준).
3. **AI 친화 colocation** — Anthropic 2026 Agentic Coding Trends Report 의 *context engineering* 원칙. AI 가 grep 으로 한 폴더에 다 찾는 게 *5 레이어 분산* 보다 컨텍스트 윈도우 효율 ↑.
4. **진화 경로** — Lean → packages 추출 (위 §"마이그레이션 트리거") 은 *코드 그대로 이동*. 처음부터 packages 만들면 *되돌리기 어려움* (sunk cost).

## Quick Start

```bash
nvm use                          # Node 20 LTS
corepack enable                  # pnpm 9.15.0
pnpm install
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# (선택) 로컬 Postgres
docker compose up -d postgres

pnpm db:migrate
pnpm db:seed
pnpm dev                         # web :3000 + admin :3100
```

## Layout

```
lean-monorepo-base/
├── apps/
│   ├── web/                     # 공개 사이트 (Next.js 16, :3000)
│   │   ├── app/                 # app router (src/ 없음)
│   │   ├── features/<domain>/   # vertical slice (actions/service/db/schemas/ui)
│   │   ├── components/ui/       # shadcn 복붙 (web 전용)
│   │   ├── lib/                 # env, utils
│   │   ├── proxy.ts             # Next.js 16 middleware
│   │   └── auth.ts              # NextAuth v5 — OAuth 자리
│   └── admin/                   # 어드민 (:3100)
│       ├── app/                 # (panel) route group + auth 게이트
│       ├── features/<domain>/   # 어드민 vertical slice
│       ├── components/ui/       # shadcn 복붙 (admin 전용)
│       ├── proxy.ts             # host 분기 (admin.example.com)
│       └── auth.ts              # NextAuth Credentials + bcrypt
├── packages/
│   └── db/                      # @repo/db — schema SSoT
│       ├── src/schema/          # Drizzle 테이블 (news, users)
│       ├── migrations/          # drizzle-kit 산출 SQL
│       └── seed/                # 데모 데이터
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── package.json
├── AGENTS.md                    # Codex/Cursor용 (SSoT 원본)
└── CLAUDE.md                    # Claude Code 심링크/사본
```

## Scripts (루트)

| Script | 동작 |
|--------|------|
| `pnpm dev` | web + admin 병렬 (turbo --parallel) |
| `pnpm dev:web` / `pnpm dev:admin` | 단독 기동 |
| `pnpm build` | 양 앱 + db 빌드 |
| `pnpm typecheck` | 전 workspace tsc --noEmit |
| `pnpm lint` | next lint (앱별) |
| `pnpm db:generate` | schema 변경 후 마이그레이션 SQL 생성 |
| `pnpm db:migrate` | 마이그레이션 적용 |
| `pnpm db:studio` | drizzle-kit studio |
| `pnpm db:seed` | 데모 seed |
| `pnpm clean` | node_modules/.turbo/.next/dist 일괄 제거 |

## 의존성 핵심

- `apps/web` → `@repo/db` (workspace:*), `next-auth@5.0.0-beta`, `drizzle-orm@0.36`, `tailwindcss@4`, `zod@4`
- `apps/admin` → `@repo/db`, `next-auth@5.0.0-beta`, `bcryptjs`, `drizzle-orm@0.36`, `tailwindcss@4`, `zod@4`, `react-hook-form`
- `packages/db` → `postgres`, `drizzle-orm`, `zod` (devDeps: `drizzle-kit`, `tsx`)

## 마이그레이션 트리거 (→ `monorepo-base`)

- 도메인 ≥ 5 개 → `packages/features/<domain>` 도입 고려
- 디자인 시스템 분리 의지 → `packages/ui-base` 분리
- 설정 공유 압력 → `packages/config` (eslint/tsconfig/tailwind preset)
- 인원 ≥ 4 명 → CODEOWNERS 와 함께 packages 경계 고정

자세한 운영 규칙은 `AGENTS.md` 4 섹션 (Setup/Style/Testing/Security) 참조.
