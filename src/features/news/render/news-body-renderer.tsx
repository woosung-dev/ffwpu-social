// Tiptap JSON 본문 렌더링 — sanitize 통과한 노드만 React 로 변환. Server Component (codex P1#3 안전 렌더링)
import type { ReactNode } from "react";
import Image from "next/image";
import { isAllowedImagePublicUrl } from "@/lib/s3";
import {
  type SafeMark,
  type SafeNode,
  sanitizeTiptapJson,
} from "./sanitize";

type Props = {
  body: unknown;
};

export function NewsBodyRenderer({ body }: Props) {
  const safe = sanitizeTiptapJson(body, {
    isAllowedImageSrc: isAllowedImagePublicUrl,
  });
  if (!safe || !safe.content || safe.content.length === 0) {
    return <p className="text-sm text-ink-subtle">본문이 없습니다.</p>;
  }
  return (
    <article className="prose prose-neutral max-w-none">
      {safe.content.map((node, i) => renderNode(node, i))}
    </article>
  );
}

function renderMarks(marks: SafeMark[] | undefined, children: ReactNode): ReactNode {
  if (!marks || marks.length === 0) return children;
  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "strike":
        return <s>{acc}</s>;
      case "code":
        return <code>{acc}</code>;
      case "link":
        return (
          <a
            href={mark.attrs?.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, children);
}

function renderNode(node: SafeNode, key: number): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key}>
          {(node.content ?? []).map((c, i) => renderNode(c, i))}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3";
      return (
        <HeadingTag key={key}>
          {(node.content ?? []).map((c, i) => renderNode(c, i))}
        </HeadingTag>
      );
    }
    case "bulletList":
      return (
        <ul key={key}>
          {(node.content ?? []).map((c, i) => renderNode(c, i))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key}>
          {(node.content ?? []).map((c, i) => renderNode(c, i))}
        </ol>
      );
    case "listItem":
      return (
        <li key={key}>
          {(node.content ?? []).map((c, i) => renderNode(c, i))}
        </li>
      );
    case "text":
      return (
        <span key={key}>{renderMarks(node.marks, node.text ?? "")}</span>
      );
    case "image": {
      const src = node.attrs?.src as string;
      const alt = (node.attrs?.alt as string) ?? "";
      return (
        <Image
          key={key}
          src={src}
          alt={alt}
          width={1200}
          height={675}
          unoptimized
          className="rounded-md"
        />
      );
    }
    case "hardBreak":
      return <br key={key} />;
    default:
      return null;
  }
}
