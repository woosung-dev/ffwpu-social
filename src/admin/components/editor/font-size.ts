// 글자 크기 커스텀 extension — TextStyle global attribute 로 style="font-size:Npx" 저장.
// 값은 툴바/sanitize 공용 normalizeFontSize 로 정수 px 범위만 허용한다.
import { Extension } from "@tiptap/core";
import { normalizeFontSize } from "@/features/news/render/editor-allowlist";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) =>
              attributes.fontSize
                ? { style: `font-size: ${attributes.fontSize}` }
                : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) => {
          const normalized = normalizeFontSize(size);
          if (!normalized) return false;
          return chain().setMark("textStyle", { fontSize: normalized }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) =>
          // 빈 textStyle 은 sanitize 가 drop, 렌더 무영향 — removeEmptyTextStyle 생략
          chain().setMark("textStyle", { fontSize: null }).run(),
    };
  },
});
