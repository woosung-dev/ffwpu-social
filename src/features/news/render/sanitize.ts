// Tiptap JSON whitelist 정화 — pure 함수. React/next 의존 0 (단위 테스트 호환). codex P1#3: javascript:/data: 차단, S3 prefix 외 이미지 차단
// 허용 노드: doc / paragraph / heading(1-3) / bulletList / orderedList / listItem / text / image / hardBreak
// 허용 마크: bold / italic / strike / code / link(http(s) only)

export type SafeMark = { type: string; attrs?: Record<string, string> };
export type SafeNode = {
  type: string;
  attrs?: Record<string, string | number>;
  content?: SafeNode[];
  marks?: SafeMark[];
  text?: string;
};

const ALLOWED_HEADING_LEVELS = [1, 2, 3] as const;
type HeadingLevel = (typeof ALLOWED_HEADING_LEVELS)[number];

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function sanitizeMark(mark: unknown): SafeMark | null {
  if (!isObject(mark) || !isString(mark.type)) return null;
  switch (mark.type) {
    case "bold":
    case "italic":
    case "strike":
    case "code":
      return { type: mark.type };
    case "link": {
      const href =
        isObject(mark.attrs) && isString(mark.attrs.href)
          ? mark.attrs.href
          : null;
      // http/https 만 허용 — javascript:/data:/protocol-relative/mailto/etc 차단 (codex P1#3)
      if (!href || !/^https?:\/\//i.test(href)) return null;
      return { type: "link", attrs: { href } };
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
    case "paragraph":
      return { type: "paragraph", content: childContent() };
    case "heading": {
      const rawLevel =
        isObject(node.attrs) && typeof node.attrs.level === "number"
          ? node.attrs.level
          : 1;
      const level = (ALLOWED_HEADING_LEVELS as readonly number[]).includes(
        rawLevel,
      )
        ? (rawLevel as HeadingLevel)
        : 2;
      return {
        type: "heading",
        attrs: { level },
        content: childContent(),
      };
    }
    case "bulletList":
    case "orderedList":
      return { type: node.type, content: childContent() };
    case "listItem":
      return { type: "listItem", content: childContent() };
    case "text": {
      if (!isString(node.text)) return null;
      const marks = Array.isArray(node.marks)
        ? node.marks
            .map(sanitizeMark)
            .filter((m): m is SafeMark => m !== null)
        : undefined;
      const result: SafeNode = { type: "text", text: node.text };
      if (marks && marks.length > 0) result.marks = marks;
      return result;
    }
    case "image": {
      const src =
        isObject(node.attrs) && isString(node.attrs.src) ? node.attrs.src : null;
      if (!src || !isAllowedImage(src)) return null;
      const alt =
        isObject(node.attrs) && isString(node.attrs.alt) ? node.attrs.alt : "";
      return { type: "image", attrs: { src, alt } };
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
