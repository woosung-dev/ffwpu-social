// Tiptap JSON whitelist 정화 — pure 함수. React/next 의존 0(단위테스트 호환).
// 허용 노드/마크만 통과 + inline 값은 editor-allowlist 로 화이트리스트(XSS 차단). codex P1#3 + 에디터 업그레이드.
import {
  YOUTUBE_ID_REGEX,
  clampImagePx,
  extractYoutubeId,
  normalizeColor,
  normalizeFontFamily,
  normalizeFontSize,
  resolveHighlightColor,
} from "./editor-allowlist";

export type SafeMark = { type: string; attrs?: Record<string, string> };
export type SafeNode = {
  type: string;
  attrs?: Record<string, string | number>;
  content?: SafeNode[];
  marks?: SafeMark[];
  text?: string;
};

const ALLOWED_HEADING_LEVELS = [1, 2, 3, 4] as const;
type HeadingLevel = (typeof ALLOWED_HEADING_LEVELS)[number];

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function clampInt(v: unknown, min: number, max: number, def: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.round(n)));
}

// 정렬 attr — center/right/justify 만 보존(left 는 기본, 생략). 에디터 툴바 정렬 4종과 정합.
function alignAttr(node: Record<string, unknown>): { textAlign?: string } {
  const a = isObject(node.attrs) ? node.attrs.textAlign : undefined;
  return a === "center" || a === "right" || a === "justify" ? { textAlign: a } : {};
}

function sanitizeMark(mark: unknown): SafeMark | null {
  if (!isObject(mark) || !isString(mark.type)) return null;
  switch (mark.type) {
    case "bold":
    case "italic":
    case "strike":
    case "code":
    case "underline":
    case "superscript":
    case "subscript":
      return { type: mark.type };
    case "link": {
      const href =
        isObject(mark.attrs) && isString(mark.attrs.href) ? mark.attrs.href : null;
      // http/https 만 허용 — javascript:/data:/protocol-relative/mailto 차단 (codex P1#3)
      if (!href || !/^https?:\/\//i.test(href)) return null;
      return { type: "link", attrs: { href } };
    }
    case "highlight": {
      // 공식은 var(--tt-color-highlight-*) 문자열, 옛 콘텐츠는 hex → 둘 다 hex 로 해석
      const color = isObject(mark.attrs) ? mark.attrs.color : undefined;
      const hex = resolveHighlightColor(color);
      return hex ? { type: "highlight", attrs: { color: hex } } : { type: "highlight" };
    }
    case "textStyle": {
      const attrs: Record<string, string> = {};
      const color = isObject(mark.attrs) ? mark.attrs.color : undefined;
      const fontSize = isObject(mark.attrs) ? mark.attrs.fontSize : undefined;
      const safeColor = normalizeColor(color);
      if (safeColor) attrs.color = safeColor;
      const safeFontSize = normalizeFontSize(fontSize);
      if (safeFontSize) attrs.fontSize = safeFontSize;
      // 글꼴 — 드롭다운 화이트리스트 밖(docx 의 맑은 고딕 등)은 drop 해 사이트 기본 글꼴로 떨어뜨린다
      const fontFamily = isObject(mark.attrs) ? mark.attrs.fontFamily : undefined;
      const safeFontFamily = normalizeFontFamily(fontFamily);
      if (safeFontFamily) attrs.fontFamily = safeFontFamily;
      // 유효 attr 없으면 drop (임의 style 차단)
      return Object.keys(attrs).length ? { type: "textStyle", attrs } : null;
    }
    default:
      return null;
  }
}

function sanitizeNode(
  node: unknown,
  isAllowedImage: (url: string) => boolean,
): SafeNode | null {
  if (!isObject(node) || !isString(node.type)) return null;

  const childContent = (): SafeNode[] =>
    Array.isArray(node.content)
      ? node.content
          .map((c) => sanitizeNode(c, isAllowedImage))
          .filter((c): c is SafeNode => c !== null)
      : [];

  switch (node.type) {
    case "doc":
      return { type: "doc", content: childContent() };
    case "paragraph": {
      const align = alignAttr(node);
      return {
        type: "paragraph",
        ...(align.textAlign ? { attrs: align } : {}),
        content: childContent(),
      };
    }
    case "heading": {
      const rawLevel =
        isObject(node.attrs) && typeof node.attrs.level === "number"
          ? node.attrs.level
          : 1;
      const level = (ALLOWED_HEADING_LEVELS as readonly number[]).includes(rawLevel)
        ? (rawLevel as HeadingLevel)
        : 2;
      const align = alignAttr(node);
      return {
        type: "heading",
        attrs: { level, ...align },
        content: childContent(),
      };
    }
    case "blockquote":
      return { type: "blockquote", content: childContent() };
    case "horizontalRule":
      return { type: "horizontalRule" };
    case "bulletList":
    case "orderedList":
      return { type: node.type, content: childContent() };
    case "listItem":
      return { type: "listItem", content: childContent() };
    case "taskList":
      return { type: "taskList", content: childContent() };
    case "taskItem": {
      const checked = isObject(node.attrs) && node.attrs.checked === true;
      return {
        type: "taskItem",
        attrs: { checked: checked ? "true" : "false" },
        content: childContent(),
      };
    }
    case "codeBlock": {
      const language =
        isObject(node.attrs) && isString(node.attrs.language)
          ? node.attrs.language.slice(0, 30)
          : "";
      return {
        type: "codeBlock",
        ...(language ? { attrs: { language } } : {}),
        content: childContent(),
      };
    }
    case "table":
      return { type: "table", content: childContent() };
    case "tableRow":
      return { type: "tableRow", content: childContent() };
    case "tableHeader":
    case "tableCell": {
      const colspan = clampInt(
        isObject(node.attrs) ? node.attrs.colspan : undefined,
        1,
        10,
        1,
      );
      const rowspan = clampInt(
        isObject(node.attrs) ? node.attrs.rowspan : undefined,
        1,
        20,
        1,
      );
      const attrs: Record<string, string | number> = { colspan, rowspan };
      // 셀 배경색 — hex/rgb 만 통과(임의 CSS·url() 차단). 붙여넣은 표 음영도 normalizeColor 로 보존.
      const bg = normalizeColor(
        isObject(node.attrs) ? node.attrs.backgroundColor : undefined,
      );
      if (bg) attrs.backgroundColor = bg;
      return { type: node.type, attrs, content: childContent() };
    }
    case "youtube": {
      const src =
        isObject(node.attrs) && isString(node.attrs.src) ? node.attrs.src : "";
      const id = extractYoutubeId(src);
      // 임의 iframe src 금지 — video id 만 신뢰 저장
      if (!id || !YOUTUBE_ID_REGEX.test(id)) return null;
      return { type: "youtube", attrs: { videoId: id } };
    }
    case "text": {
      if (!isString(node.text)) return null;
      const marks = Array.isArray(node.marks)
        ? node.marks.map(sanitizeMark).filter((m): m is SafeMark => m !== null)
        : undefined;
      const result: SafeNode = { type: "text", text: node.text };
      if (marks && marks.length > 0) result.marks = marks;
      return result;
    }
    case "image": {
      // 네이티브 Image(inline+resize) — src/alt + px width/height. 정렬은 부모 문단 textAlign.
      const src =
        isObject(node.attrs) && isString(node.attrs.src) ? node.attrs.src : null;
      if (!src || !isAllowedImage(src)) return null;
      const alt =
        isObject(node.attrs) && isString(node.attrs.alt) ? node.attrs.alt : "";
      const width = clampImagePx(isObject(node.attrs) ? node.attrs.width : undefined);
      const height = clampImagePx(isObject(node.attrs) ? node.attrs.height : undefined);
      const attrs: Record<string, string | number> = { src, alt };
      if (width) attrs.width = width;
      if (height) attrs.height = height;
      return { type: "image", attrs };
    }
    case "hardBreak":
      return { type: "hardBreak" };
    default:
      // 알 수 없는 노드 — drop
      return null;
  }
}

export type SanitizeOptions = {
  isAllowedImageSrc: (url: string) => boolean;
};

// Tiptap JSON 정화 — opts.isAllowedImageSrc 로 이미지 URL prefix 검증 주입 (테스트 격리)
export function sanitizeTiptapJson(
  raw: unknown,
  opts: SanitizeOptions,
): SafeNode | null {
  const sanitized = sanitizeNode(raw, opts.isAllowedImageSrc);
  if (!sanitized || sanitized.type !== "doc") return null;
  return sanitized;
}

// 정화된 문서가 실제로 쓴 글꼴 목록. 공개 렌더가 이 글에 필요한 웹폰트만 <link> 로 부르는 데 쓴다 —
// 글꼴을 안 쓴 글은 빈 배열이라 폰트 요청이 0 건이다. 한글 웹폰트는 무거워서 이 구분이 값어치를 한다.
export function collectUsedFonts(node: SafeNode | null): string[] {
  const found = new Set<string>();
  const walk = (n: SafeNode) => {
    for (const mark of n.marks ?? []) {
      const family = mark.attrs?.fontFamily;
      if (family) found.add(family);
    }
    for (const child of n.content ?? []) walk(child);
  };
  if (node) walk(node);
  return [...found];
}
