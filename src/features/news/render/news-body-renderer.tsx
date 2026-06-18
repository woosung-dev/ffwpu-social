// Tiptap JSON 본문 렌더링 — sanitize 통과한 노드만 React 로 변환. Server Component (codex P1#3 안전 렌더링).
// 새 노드/마크(밑줄·글자색·형광펜·정렬·인용·표·유튜브·이미지 정렬/폭/캡션) — 값은 sanitize 가 화이트리스트 완료.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
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
    // 본문 타이포 — 에디터(Tiptap)와 WYSIWYG 일치 + 티스토리/네이버 모델.
    // 16px / line-height 1.75 / 문단 마진 0 → 줄 pitch = line-height 만(티스토리와 동일, 28px).
    // 문단 구분은 "빈 줄"(빈 문단=한 줄)로. prose 기본 마진(위·아래 1.25em)을 0 으로 무력화해야 줄이 벌어지지 않음.
    <article
      className={cn(
        "prose prose-neutral max-w-none",
        "text-[16px] leading-[1.75] text-ink-strong",
        "[&_p]:my-0 [&_p]:leading-[1.75]",
      )}
    >
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
        // 큰 글씨(docx 제목)는 행간을 1.3 으로 확보해 줄에 끼지 않게 — 에디터와 동일
        if (mark.attrs?.fontSize) {
          style.fontSize = mark.attrs.fontSize;
          style.lineHeight = 1.3;
        }
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
      // 빈 문단 = 한 줄(빈 <p> 는 0px 로 뭉개지므로 <br/>). 문단 마진 0 이므로 빈 줄이 곧 "한 줄 간격" = 티스토리 모델.
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
      // prose 사용 중이나 Tailwind preflight 가 ul/ol list-style 을 리셋 → 마커·들여쓰기를 명시 유지
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
      // 격자 테두리 명시 — 에디터 편집 화면과 동일한 표 모양(prose 기본 대신 full grid)
      return (
        <div key={key} className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
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
          className="border border-border bg-surface-soft px-3 py-2 text-left align-top font-semibold"
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
          className="border border-border px-3 py-2 align-top"
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
