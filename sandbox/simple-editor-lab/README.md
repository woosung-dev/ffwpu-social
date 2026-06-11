<!-- Tiptap 공식 simple-editor(진짜 소스) + 글자 크기 추가 — 평가용 격리 sandbox -->

# Simple Editor Lab — 공식 Tiptap simple-editor + 글자 크기

`template.tiptap.dev/preview/templates/simple` 와 동일한 **진짜 공식 simple-editor** 입니다. 공식 repo [`ueberdosis/tiptap-ui-components`](https://github.com/ueberdosis/tiptap-ui-components) 의 `apps/web` 소스를 그대로 가져왔고, **단 하나 — 글자 크기 컨트롤만 추가** 했습니다. 본 프로젝트(Tiptap v2)·프로덕션과는 완전히 격리된 독립 앱입니다.

## 빠른 실행

```bash
cd sandbox/simple-editor-lab
pnpm install
pnpm dev        # http://localhost:5180
```

툴바의 **제목(H) 드롭다운 옆 `Size ▾`** → 본문을 드래그한 뒤 크기를 고르면 적용, `Default` 로 해제됩니다.

## 왜 직접 가져왔나 (공식 CLI 미사용)

공식 설치 명령 `npx @tiptap/cli@latest init/add simple-editor` 는 **대화형 TTY** 를 요구해, 이 자동화(헤드리스) 환경에서 "Creating Vite project" 단계에서 멈춰 끝까지 실행되지 않았습니다(2회 확인). 그래서 동일 결과물인 **공식 repo `apps/web` 를 클론해 그대로 복사**했습니다 — 파일은 공식과 100% 동일합니다.

> 본인 터미널(실 TTY)에서 공식 CLI 로 새로 받고 싶다면.
> ```bash
> npx @tiptap/cli@latest init simple-editor   # 빈 폴더에 새 프로젝트
> npx @tiptap/cli@latest add simple-editor    # 기존 프로젝트에 추가
> ```

## 공식 대비 변경점 (글자 크기 추가가 전부)

| 변경 | 파일 |
|---|---|
| `TextStyleKit` 등록 (`fontSize`) | `src/components/tiptap-templates/simple/simple-editor.tsx` (+1줄) |
| 툴바에 `<FontSizeDropdownMenu/>` 배치 | 동 파일 (heading 드롭다운 옆 +1줄) |
| 글자 크기 드롭다운 컴포넌트 신규 | `src/components/tiptap-ui/font-size-dropdown-menu/` (공식 HeadingDropdownMenu 패턴 그대로) |
| 의존성 `@tiptap/extension-text-style` 추가 | `package.json` |

독립 실행을 위한 환경 보정 2건(공식 동작과 무관).
- `@types/node` devDep 추가 — 모노레포 루트에 의존하던 `vite.config.ts` 의 `path`/`__dirname` 타입.
- `postcss.config.cjs` (빈 설정) — 상위 프로젝트의 Tailwind v4 postcss 가 잘못 상속되는 것 차단.

## 글자 크기 동작 원리

Tiptap v3 는 폰트 크기 extension 을 따로 설치하지 않습니다. **`TextStyleKit`** 가 FontSize 를 내장합니다.

```ts
TextStyleKit.configure({ fontSize: { types: ["textStyle"] } })
// 적용 / 해제
editor.chain().focus().setFontSize("24px").run()
editor.chain().focus().unsetFontSize().run()
```

저장 HTML 에는 선택 영역에 인라인 `style="font-size:24px"` 로 반영됩니다.

## 본 프로젝트 적용 시 참고 (의사결정)

- 현행 어드민 에디터는 **Tiptap v2** 이고, 글자 크기는 커스텀 extension(`src/admin/components/editor/font-size.ts`)으로 **이미 동작**합니다.
- 이 공식 템플릿을 실제 도입(C 전면 교체)하려면 **v2→v3 전면 마이그레이션 + 발행글(v2 JSON) 저장 데이터 호환 검증 + 커스텀 노드(유튜브·표·이미지) 재이식** 이 따릅니다.
- 이 sandbox 는 "공식 기본 + 글자 크기" 의 실제 모습을 확인하기 위한 평가용입니다.

## 검증

- `pnpm build` (tsc + vite build) **통과** — 301 modules, `setFontSize`/`unsetFontSize` 타입·컴파일 정상.
- `pnpm dev` 5180 응답 200 / HMR 적용 확인.
