// Tiptap JSON 본문에서 평문 발췌 추출 — 히어로/미리보기 카드 설명용. 텍스트 노드만 수집 후 길이 제한
type TiptapNode = { text?: string; content?: TiptapNode[] };

export function extractExcerpt(body: unknown, maxLength = 100): string {
  const parts: string[] = [];
  const walk = (node: TiptapNode | undefined) => {
    if (!node) return;
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(body as TiptapNode);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trimEnd()}…`
    : text;
}
