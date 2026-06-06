// 본문 이미지 확장 — 정렬/폭/캡션/실제치수 attrs 추가. 발행 렌더(news-body-renderer)가 figure+figcaption 구성.
// 에디터에선 data-* + inline width 로 시각 반영. node name "image" 유지(sanitize/renderer 키 동일).
import Image from "@tiptap/extension-image";

export const FigureImage = Image.extend({
  name: "image",
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") ?? "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align as string }),
      },
      width: {
        default: 100,
        parseHTML: (el) => Number(el.getAttribute("data-width")) || 100,
        renderHTML: (attrs) => ({
          "data-width": String(attrs.width),
          style: `width: ${attrs.width}%`,
        }),
      },
      caption: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-caption") ?? "",
        renderHTML: (attrs) =>
          attrs.caption ? { "data-caption": attrs.caption as string } : {},
      },
      naturalWidth: {
        default: null,
        parseHTML: (el) => Number(el.getAttribute("data-nw")) || null,
        renderHTML: (attrs) =>
          attrs.naturalWidth ? { "data-nw": String(attrs.naturalWidth) } : {},
      },
      naturalHeight: {
        default: null,
        parseHTML: (el) => Number(el.getAttribute("data-nh")) || null,
        renderHTML: (attrs) =>
          attrs.naturalHeight ? { "data-nh": String(attrs.naturalHeight) } : {},
      },
    };
  },
});
