<!-- Tiptap v3 simple-editor 평가용 격리 sandbox — 본 프로젝트(v2) 무영향 -->

# Simple Editor Lab — Tiptap v3 평가용 sandbox

본 프로젝트의 어드민 에디터(Tiptap **v2**)를 건드리지 않고, 공식 **simple-editor가 기반으로 하는 Tiptap v3 + 글자 크기 커스텀**을 직접 눌러보며 비교하기 위한 **격리 데모**입니다. ADR 결정 전 "병행 비교" 단계의 산출물이며, 프로덕션에는 어떤 영향도 없습니다.

## 빠른 실행

```bash
cd sandbox/simple-editor-lab
pnpm install      # 최초 1회
pnpm dev          # http://localhost:5180
```

본문을 드래그한 뒤 툴바의 **크기** 드롭다운을 바꾸면 글자 크기가 즉시 적용됩니다.

## 왜 "독립 앱"인가 (같은 앱 별도 라우트가 아님)

- 본 프로젝트는 Tiptap **v2.x** 입니다. simple-editor 템플릿은 **v3** 기준입니다.
- v3 `@tiptap/react` 가 내부적으로 `@tiptap/core` 를 import 하므로, **한 앱 안에서 v2·v3 패키지를 동시에 둘 수 없습니다** (npm alias 로도 내부 import 는 못 바꿈). 따라서 안전한 비교의 유일한 방법은 **의존성이 분리된 독립 앱**입니다.
- 이 sandbox 는 자체 `package.json`·`node_modules` 를 가지며, 루트 앱과 빌드·런타임이 완전히 분리됩니다.

## 왜 공식 CLI 스캐폴드가 아니라 직접 구성인가

공식 명령은 **대화형 TTY** 를 요구해 자동화(비대화) 환경에서 끝까지 구동되지 않았습니다. 그래서 공식 템플릿이 쓰는 것과 **동일한 v3 구성**(StarterKit + TextStyleKit + TextAlign)으로 핵심을 직접 재현하고, 질문의 핵심인 **글자 크기 컨트롤**을 얹었습니다.

공식 컴포넌트 풀세트(heading-dropdown·color-highlight-popover·link-popover·image-upload-node 등)가 필요하면, **대화형 터미널에서** 아래를 직접 실행하세요. 이 sandbox 위에 덮어쓰면 됩니다.

```bash
# 빈 디렉터리에 공식 템플릿으로 새 프로젝트 생성
npx @tiptap/cli@latest init simple-editor
# 또는 기존(이 sandbox) 프로젝트에 템플릿 추가
npx @tiptap/cli@latest add simple-editor
```

## 글자 크기는 어떻게 동작하나 (핵심)

v3 에서는 폰트 크기 extension 을 따로 설치하지 않습니다. **`TextStyleKit`**(`@tiptap/extension-text-style`)이 TextStyle + Color/FontSize/FontFamily/LineHeight 를 번들로 제공합니다.

```ts
// src/App.tsx
import { TextStyleKit } from "@tiptap/extension-text-style";

useEditor({
  extensions: [
    StarterKit,
    TextStyleKit.configure({ fontSize: { types: ["textStyle"] } }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ],
});

// 적용 / 해제
editor.chain().focus().setFontSize("24px").run();
editor.chain().focus().unsetFontSize().run();
```

저장 HTML 에는 선택 영역에 `style="font-size:24px"` 인라인 스타일로 반영됩니다.

## 현행 v2 에디터와 비교

| 항목 | 현행 (`src/admin/components/TiptapEditor.tsx`, **v2**) | 이 sandbox (**v3**) |
|---|---|---|
| 글자 크기 | **커스텀 FontSize extension**(`editor/font-size.ts`) — v2 엔 공식이 없어 직접 구현 | `TextStyleKit.fontSize` **공식 내장** |
| 색·정렬·밑줄 | 개별 extension 조합 | StarterKit(밑줄·링크 내장) + TextStyleKit(색) + TextAlign |
| 유튜브·표·이미지(정렬·폭·캡션) | 커스텀 노드로 구현 완료 | **미포함** — 전환 시 v3 로 재이식 필요 |
| sanitize·렌더러 | `editor-allowlist`·`news-body-renderer` 로 v2 결합 | 별도 |

## 전환(C: 전면 교체) 시 남는 리스크 — 의사결정용

- **저장 데이터 호환성**: 발행된 소식 본문이 **v2 JSON** 으로 DB 에 있음 → v3 파서/스키마 차이로 렌더 회귀 가능. 마이그레이션 시 전수 검증 필요.
- **커스텀 자산 재이식**: FigureImage·SafeYoutube·sanitize allowlist 를 v3 API 로 다시 구현.
- 결론적으로 글자 크기 자체는 v2(현행)·v3 모두 가능. **v3 의 장점은 공식 내장**이고, **비용은 전면 마이그레이션 + 데이터 호환 검증**입니다.

## 검증 상태

- `pnpm build` (= `tsc -b && vite build`) **통과** — Tiptap v3.26.0 에서 `setFontSize`/`unsetFontSize`/`setColor`/`setTextAlign` 타입·컴파일 정상.
- `pnpm dev` 서버 200 응답 확인.
- 라이브 스크린샷은 이 환경의 Playwright 프로필 잠금으로 미수행 — `pnpm dev` 로 직접 확인 가능.
