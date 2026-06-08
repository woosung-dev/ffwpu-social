// Tiptap JSON 본문에서 plain text 추출 — OG/메타 description 요약용. body 는 string(JSON) 또는 객체 모두 허용.
import type { JSONContent } from "@tiptap/react";

function collectText(node: JSONContent | undefined, acc: string[]): void {
  if (!node) return;
  if (typeof node.text === "string") acc.push(node.text);
  if (Array.isArray(node.content)) {
    for (const child of node.content) collectText(child, acc);
  }
}

export function bodyToExcerpt(body: unknown, maxLen = 150): string {
  try {
    const json = (typeof body === "string" ? JSON.parse(body) : body) as JSONContent;
    const acc: string[] = [];
    collectText(json, acc);
    const text = acc.join(" ").replace(/\s+/g, " ").trim();
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + "…";
  } catch {
    return "";
  }
}
