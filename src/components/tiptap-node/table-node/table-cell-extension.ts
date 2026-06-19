// 표 셀 배경색 지원 — TableCell/TableHeader 에 backgroundColor attr 추가(인라인 style 직렬화).
// TableKit 의 기본 셀을 끄고(simple-editor) 이 확장으로 대체. 값은 setCellAttribute('backgroundColor', hex) 로 지정.
// 공개 렌더는 sanitize(normalizeColor) → news-body-renderer 가 동일 인라인 style 로 재현(에디터 WYSIWYG 일치).
import { TableCell, TableHeader } from "@tiptap/extension-table";

// 셀/헤더 공통 — 부모 attr 보존 + backgroundColor 추가. style 우선(특이도) 으로 scss th 기본 배경을 덮는다.
function backgroundColorAttribute() {
  return {
    backgroundColor: {
      default: null as string | null,
      // 붙여넣기·기존 콘텐츠: 인라인 style 또는 data 속성에서 읽음
      parseHTML: (element: HTMLElement): string | null =>
        element.style.backgroundColor ||
        element.getAttribute("data-background-color") ||
        null,
      renderHTML: (attributes: Record<string, unknown>) => {
        const color = attributes.backgroundColor;
        if (typeof color !== "string" || !color) return {};
        return { style: `background-color: ${color}` };
      },
    },
  };
}

export const TableCellWithBackground = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...backgroundColorAttribute(),
    };
  },
});

export const TableHeaderWithBackground = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...backgroundColorAttribute(),
    };
  },
});
