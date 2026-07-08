// 공지 상세 첨부파일 다운로드 섹션 — Figma 1104-11167. 파일명·용량 + presigned GET route 링크. Server Component
import { Download, Paperclip } from "lucide-react";

export type DownloadAttachment = {
  id: string;
  fileName: string;
  size: number;
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function DownloadSection({
  attachments,
}: {
  attachments: DownloadAttachment[];
}) {
  if (attachments.length === 0) return null;
  return (
    <section
      aria-label="첨부파일"
      className="rounded-xl border border-border bg-surface-soft/40"
    >
      <h2 className="flex items-center gap-1.5 border-b border-border px-5 py-3.5 text-sm font-semibold text-ink-strong md:px-6 md:text-base">
        <Paperclip className="size-4" aria-hidden />
        첨부파일
        <span className="font-normal text-ink-subtle">{attachments.length}</span>
      </h2>
      <ul className="divide-y divide-border">
        {attachments.map((a) => (
          <li key={a.id}>
            {/* 일반 anchor — presigned GET 302 route 가 Content-Disposition 으로 다운로드 강제 (ADR-041) */}
            <a
              href={`/api/notices/attachments/${a.id}`}
              className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F9F4FF] md:px-6"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-strong transition-colors group-hover:text-brand-primary md:text-base">
                {a.fileName}
              </span>
              <span className="shrink-0 text-xs text-ink-subtle md:text-sm">
                {formatBytes(a.size)}
              </span>
              <Download
                className="size-4 shrink-0 text-ink-subtle transition-colors group-hover:text-brand-primary"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
