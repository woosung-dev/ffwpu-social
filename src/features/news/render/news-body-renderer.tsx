// Tiptap JSON 본문 렌더링 — sanitize 통과한 노드만 React 로 변환. Server Component (codex P1#3 안전 렌더링).
// 새 노드/마크(밑줄·글자색·형광펜·정렬·인용·표·유튜브·이미지 정렬/폭/캡션) — 값은 sanitize 가 화이트리스트 완료.
import type { CSSProperties, ReactNode } from "react";
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
    // 본문 타이포 — Figma 749:8077: lg 단락 20px/lh1.5 (base 16 모바일 유지 [추론 — 모바일 프레임 없음]).
    // 단락 간격 24 는 prose em 마진(1.25em×20=25px)으로 ±2px 내 충족 — 별도 마진 override 시 first-child 0 마진이 깨져 미적용.
    // 리드 단락 Bold 는 콘텐츠(에디터) 스타일이므로 렌더러에서 강제하지 않음.
    <article className="prose prose-neutral max-w-none lg:[&_p]:text-xl lg:[&_p]:leading-[1.5]">
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
      case "superscript":
        return <sup>{acc}</sup>;
      case "subscript":
        return <sub>{acc}</sub>;
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

function renderNode(node: SafeNode, key: number): ReactNode {
  const kids = (node.content ?? []).map((c, i) => renderNode(c, i));
  const textAlign = node.attrs?.textAlign as CSSProperties["textAlign"] | undefined;

  switch (node.type) {
    case "paragraph":
      // 빈 단락(여러 줄바꿈)은 에디터처럼 한 줄 높이를 유지 — 빈 <p> 는 0px 로 뭉개지므로 <br/> 삽입.
      return (
        <p key={key} style={textAlign ? { textAlign } : undefined}>
          {kids.length > 0 ? kids : <br />}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4";
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
      // prose 플러그인 미사용 + Tailwind preflight 가 list-style 제거 → 마커·들여쓰기 명시
      return (
        <ul key={key} className="my-3 list-disc pl-6">
          {kids}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="my-3 list-decimal pl-6">
          {kids}
        </ol>
      );
    case "listItem":
      return (
        <li key={key} className="my-1 [&>p]:my-0">
          {kids}
        </li>
      );
    case "taskList":
      return (
        <ul key={key} className="list-none pl-0">
          {kids}
        </ul>
      );
    case "taskItem": {
      const checked = node.attrs?.checked === "true";
      return (
        <li key={key} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            disabled
            className="mt-1.5"
          />
          <div className="[&>p]:my-0">{kids}</div>
        </li>
      );
    }
    case "codeBlock":
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-md bg-ink-strong/90 p-3 text-sm text-white"
        >
          <code>{kids}</code>
        </pre>
      );
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
      // 네이티브 inline 이미지 — 한 문단에 여러 장이 나란히. px width/height + max-width:100% 로 모바일 캡.
      const src = node.attrs?.src as string;
      const alt = (node.attrs?.alt as string) ?? "";
      const w = node.attrs?.width as number | undefined;
      const h = node.attrs?.height as number | undefined;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={src}
          alt={alt}
          width={w}
          height={h}
          loading="lazy"
          className="my-3 mr-2 inline-block h-auto max-w-full rounded-md align-top"
          style={w ? { width: `${w}px` } : undefined}
        />
      );
    }
    case "hardBreak":
      return <br key={key} />;
    default:
      return null;
  }
}
