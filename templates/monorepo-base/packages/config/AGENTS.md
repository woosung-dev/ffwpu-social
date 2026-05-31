# @myorg/config — 공유 설정 패키지

> tsconfig / eslint / tailwind / prettier preset SSOT. 모든 workspace 가 이 패키지를 dev-dependency 로 가짐 → 설정 drift 차단.

## Setup

- 무빌드 패키지 (소스 그대로 export). 추가 install 단계 없음.
- 사용 예시:
  - `tsconfig.json` → `"extends": "@myorg/config/tsconfig/nextjs.json"` (apps) / `"@myorg/config/tsconfig/library.json"` (packages)
  - `eslint.config.mjs` → `import next from '@myorg/config/eslint/nextjs'; export default next;`
  - `.prettierrc.mjs` → `export { default } from '@myorg/config/prettier';`
  - `globals.css` → `@import '@myorg/config/tailwind/tokens.css';` 후 자기 `@theme` 로 override
- 신규 preset 추가 시 `package.json#exports` 에 반드시 등록 — 등록 안 하면 pnpm resolve 실패.

## Style

- **eslint preset 2종**: `base` (TS strict + prettier 해제) / `nextjs` (base + Next.js core-web-vitals + React hooks). 라이브러리 패키지는 `base`, 앱은 `nextjs`.
- **tsconfig 3종**: `base` (strict 공통) / `nextjs` (apps) / `library` (packages). 모두 base 확장.
- **prettier** 단일 설정. 변경 시 모든 패키지에 즉시 반영되므로 conservative 하게.
- **tailwind preset** 은 content scan 경로 + 무채색 토큰 + radius/spacing 만. 색·폰트는 각 앱 `globals.css` 의 `@theme inline` 에서 주입 (ui-base 디자인 분리 SSOT 보호).
- 첫 줄 한국어 의도 주석 (`.ts/.tsx/.mjs/.css`). JSON config 는 면제.

## Testing

- 검증 명령:
  - `pnpm -w typecheck` — 모든 workspace tsconfig 가 정상 resolve 되는지
  - `pnpm -w lint` — flat config 가 모든 패키지에서 정상 로드되는지
  - tailwind 토큰 변경 후: `pnpm -w build` — 다운스트림 앱의 CSS 빌드가 깨지지 않는지
- preset 변경은 monorepo 전체 영향이라 **별도 PR + 다운스트림 영향 분석** 필수.

## Security

- 환경변수 참조 없음 (순수 정적 설정).
- ESLint rule 추가/완화 시 보안 영향 검토: `no-restricted-imports` 에서 `@myorg/db` client component 차단 / apps 간 직접 import 차단 — 두 패턴은 제거 금지 (NextAuth secret 누설·DB 클라 노출 방지선).
- Prettier 가 `package.json` / `.env*` 를 포맷팅하지 않도록 다운스트림 `.prettierignore` 권장.
