# `@myorg/ui-base` — untheme shadcn primitives

> 색·폰트 토큰을 절대 박지 않는 헤드리스 컴포넌트 묶음. web/admin 양쪽이 같은 primitive 를 import 하되, 디자인 토큰은 각 앱의 `globals.css` 에서 CSS 변수로 주입한다.

## Setup

- 이 패키지에 새 컴포넌트를 추가할 때는 **shadcn v4 default style** 정상 출력만 가져온다 — `bg-blue-500` 같은 색 리터럴, `font-suit` 같은 폰트 토큰은 절대 박지 않는다. 모든 색/폰트는 `var(--xxx)` (= `bg-primary`, `text-foreground`, `font-sans` 등 Tailwind 의미 토큰) 형태로만 표현한다. *왜:* 토큰을 박으면 web/admin 분리가 깨지고 다운스트림 프로젝트 (`ffwpu-social` 외 다른 도메인 복제) 가 자기 브랜드를 못 입힌다.
- 새 primitive 추가 = 4 단계:
  1. `components/<name>.tsx` 작성 (shadcn 원본 그대로 + `cn()` import 경로만 `../lib/utils` 로 교정)
  2. `index.ts` 에 named export 추가
  3. `package.json` 의 `exports` 맵에 `./components/<name>` 항목 추가 (subpath import 지원)
  4. Radix dep 가 새로 필요하면 `dependencies` 에 정확한 버전 추가 (peerDependencies 가 아님 — 패키지 내부 dep)
- shadcn CLI 를 직접 돌리지 말 것 — `components.json` 의 `tailwind.css` 경로는 `apps/web/app/globals.css` 를 가리키는 *참조용* 이고, 실제 토큰 정의는 각 앱이 책임진다. shadcn add 가 필요하면 *앱* 디렉토리에서 임시 실행 후, 결과 컴포넌트만 untheme 처리해서 이 패키지로 옮긴다.

## Style

- `'use client'` 는 Radix 등 클라이언트 hook 을 쓰는 컴포넌트에만 (`label.tsx`, `dialog.tsx`). Pure presentational (`button.tsx`, `input.tsx`, `card.tsx`) 는 RSC 호환 위해 `'use client'` 생략.
- 모든 컴포넌트는 `React.forwardRef` 로 감싸 ref 전달 — 폼 라이브러리 (RHF) 와 합쳐 쓸 때 필수.
- variant 정의는 **`cva`** (class-variance-authority) 만 사용. 직접 조건부 className 합성 금지 — variant 가 늘어나면 무너진다.
- `cn()` 헬퍼는 반드시 `../lib/utils` 에서 import. clsx + tailwind-merge 조합 외 다른 className 머지 도구 도입 금지.
- 컴포넌트 첫 줄 한국어 1줄 의도 주석 필수 (예: `// shadcn Button primitive — 색·폰트 토큰은 앱 globals.css 의 CSS 변수로 주입한다`).
- 새 export 는 `index.ts` 의 named export 만 — default export 금지 (트리쉐이킹·grep 용이).

## Testing

- 단위 테스트: 다운스트림에서 vitest + @testing-library/react 추가 후, `components/__tests__/` 폴더에 작성. 이 템플릿에는 테스트 러너 미포함.
- 최소 게이트: 워크스페이스 루트에서 `pnpm --filter @myorg/ui-base typecheck` + `pnpm --filter @myorg/ui-base lint`. 둘 다 통과해야 PR 가능.
- 시각 회귀 검증: 각 앱 (`apps/web`, `apps/admin`) 의 `/dev/ui` 같은 갤러리 페이지에서 모든 variant 를 한눈에 확인 — 토큰 누락 시 색이 검정/흰색으로 빠지므로 *눈으로* 잡힌다.
- 컴포넌트 추가/수정 PR 은 web·admin 양쪽에서 import 해 빌드되는지 확인 (`pnpm build`).

## Security

- **토큰 누수 차단** — Tailwind 클래스에 색 리터럴 (`bg-[#xxx]`, `text-red-500`, `font-suit` 등) 사용 시 PR 거절. 의미 토큰 (`bg-primary`, `text-foreground`, `font-sans`) 만 허용. CI 에 정규식 ESLint 룰 추가 권장 (`no-restricted-syntax` 로 `bg-\[#`, `text-(red|blue|green)-\d+`, `font-suit|font-pretendard` 매칭 차단).
- 외부 입력을 dangerouslySetInnerHTML 로 렌더하는 컴포넌트 추가 금지 — 이 패키지는 untheme primitives 전용, sanitize 책임은 가지지 않는다.
- 새 Radix dep 추가 시 supply chain 감사: `pnpm why @radix-ui/<x>` 로 transitive 확인, `npm audit` 후 머지.
- 클라이언트 컴포넌트에서 환경변수 (`process.env.*`) 참조 금지 — 이 패키지는 RSC/Client 양쪽에서 동작해야 하므로 환경변수 의존성 자체를 허용하지 않는다.
