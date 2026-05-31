# CLAUDE.md

> Claude Code 자동 로드 진입점. **SSoT 는 `AGENTS.md`** — 본 파일은 사본/심링크.
>
> 운영 규칙 (Setup / Style / Testing / Security) 은 `AGENTS.md` 참조.

이 monorepo 의 정체성:

- **Lean Level 1** — `apps/web` + `apps/admin` + `packages/db` (단 1 패키지).
- 1~3 인 sweet spot. 도메인 ≥ 5 또는 인원 ≥ 4 시 `templates/monorepo-base` (Level 2) 로 승격.
- Next.js 16 (proxy.ts + cacheComponents) · Tailwind v4 CSS-first · NextAuth v5 · Drizzle 0.36 · Zod 4.

## 빠른 진입

1. **루트 구조**: `apps/{web,admin}` 각자 자체 `app/` · `features/` · `components/ui/` · `lib/` · `proxy.ts` · `auth.ts`.
2. **공유점**: `packages/db` 1 곳 (`@repo/db`) — schema · client · migration · seed.
3. **도메인 추가**: `apps/<app>/features/<domain>/` 안 5 파일 (`actions.ts` · `service.ts` · `db.ts` · `schemas.ts` · `ui.tsx`).

자세한 운영 규약·트레이드오프·결정 트리는 → **[AGENTS.md](./AGENTS.md)**.
