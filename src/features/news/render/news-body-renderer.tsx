// Tiptap JSON 본문 렌더링 — sanitize 통과한 노드만 React 로 변환. Server Component (codex P1#3 안전 렌더링).
// 새 노드/마크(밑줄·글자색·형광펜·정렬·인용·표·유튜브·이미지 정렬/폭/캡션) — 값은 sanitize 가 화이트리스트 완료.
import type { CSSProperties, ReactNode } from "react";
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
      case "underline":
        return <u>{acc}</u>;
      case "strike":
        return <s>{acc}</s>;
      case "code":
        return <code>{acc}</code>;
      case "highlight":
        return (
          <mark style={mark.attrs?.color ? { backgroundColor: mark.attrs.color } : undefined}>
            {acc}
          </mark>
        );
      case "textStyle": {
        const style: CSSProperties = {};
        if (mark.attrs?.color) style.color = mark.attrs.color;
        if (mark.attrs?.fontSize) style.fontSize = mark.attrs.fontSize;
        return <span style={style}>{acc}</span>;
      }
      case "link":
        return (
          <a href={mark.attrs?.href} target="_blank" rel="noopener noreferrer nofollow">
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, children);
}

function alignStyle(align: string | undefined): CSSProperties {
  if (align === "left") return { marginRight: "auto" };
  if (align === "right") return { marginLeft: "auto" };
  return { marginLeft: "auto", marginRight: "auto" }; // center 기본
}

function renderNode(node: SafeNode, key: number): ReactNode {
  const kids = (node.content ?? []).map((c, i) => renderNode(c, i));
  const textAlign = node.attrs?.textAlign as CSSProperties["textAlign"] | undefined;

  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} style={textAlign ? { textAlign } : undefined}>
          {kids}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3";
      return (
        <HeadingTag key={key} style={textAlign ? { textAlign } : undefined}>
          {kids}
        </HeadingTag>
      );
    }
    case "blockquote":
      return <blockquote key={key}>{kids}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "bulletList":
      return <ul key={key}>{kids}</ul>;
    case "orderedList":
      return <ol key={key}>{kids}</ol>;
    case "listItem":
      return <li key={key}>{kids}</li>;
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table className="w-full">
            <tbody>{kids}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={key}>{kids}</tr>;
    case "tableHeader":
      return (
        <th
          key={key}
          colSpan={(node.attrs?.colspan as number) ?? 1}
          rowSpan={(node.attrs?.rowspan as number) ?? 1}
        >
          {kids}
        </th>
      );
    case "tableCell":
      return (
        <td
          key={key}
          colSpan={(node.attrs?.colspan as number) ?? 1}
          rowSpan={(node.attrs?.rowspan as number) ?? 1}
        >
          {kids}
        </td>
      );
    case "youtube": {
      const id = node.attrs?.videoId as string;
      // id-only sandbox iframe — 임의 src 불가(sanitize 가 id 만 통과)
      return (
        <div key={key} className="my-4 aspect-video w-full overflow-hidden rounded-md">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title="YouTube video"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="h-full w-full"
          />
        </div>
      );
    }
    case "text":
      return <span key={key}>{renderMarks(node.marks, node.text ?? "")}</span>;
    case "image": {
      const src = node.attrs?.src as string;
      const alt = (node.attrs?.alt as string) ?? "";
      const align = node.attrs?.align as string | undefined;
      const width = (node.attrs?.width as number) ?? 100;
      const caption = node.attrs?.caption as string | undefined;
      const nw = (node.attrs?.naturalWidth as number) ?? 1200;
      const nh = (node.attrs?.naturalHeight as number) ?? 675;
      return (
        <figure
          key={key}
          className="my-4"
          style={{ width: `${width}%`, ...alignStyle(align) }}
        >
          <Image
            src={src}
            alt={alt}
            width={nw}
            height={nh}
            unoptimized
            sizes="(max-width: 768px) 100vw, 800px"
            className="h-auto w-full rounded-md"
          />
          {caption ? (
            <figcaption className="mt-1 text-center text-sm text-ink-subtle">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "hardBreak":
      return <br key={key} />;
    default:
      return null;
  }
}
