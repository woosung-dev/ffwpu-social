// 글자 크기 커스텀 extension — TextStyle global attribute 로 style="font-size:Npx" 저장.
// Tiptap v2 엔 공식 @tiptap/extension-font-size 가 없어 직접 구현(함정). 값은 툴바/sanitize 가 프리셋으로 제한.
import { Extension } from "@tiptap/core";

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
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          // 빈 textStyle 은 sanitize 가 drop, 렌더 무영향 — removeEmptyTextStyle 생략
          chain().setMark("textStyle", { fontSize: null }).run(),
    };
  },
});
