// 공지 상세 첨부파일 다운로드 — Figma 1104:11167 정합: 행 bg #f9f9f9 h41 rounded-4 px-10, 클립+파일명 좌 / 다운로드 우. Server Component
import { NoticeClipIcon, NoticeDownloadIcon } from "./notice-icons";

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
    // Figma: 행 간격 6px, 컨테이너 테두리·헤딩 없음 (rows-only)
    <ul aria-label="첨부파일" className="space-y-[6px]">
      {attachments.map((a) => (
        <li key={a.id}>
          {/* 일반 anchor — presigned GET 302 route 가 Content-Disposition 으로 원본 파일명 다운로드 강제 (ADR-041) */}
          <a
            href={`/api/notices/attachments/${a.id}`}
            aria-label={`${a.fileName} 다운로드 (${formatBytes(a.size)})`}
            className="flex min-h-[41px] items-center justify-between gap-3 rounded-[4px] bg-[#f9f9f9] px-2.5 py-2 transition-colors hover:bg-[#f2f2f4]"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <NoticeClipIcon className="size-5 text-[#c0bac2]" />
              <span className="truncate text-[15px] font-semibold text-[#606063] wide:text-[16px]">
                {a.fileName}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 px-2.5 text-sm font-medium text-[#999999] wide:text-[15px]">
              <NoticeDownloadIcon className="size-4" />
              다운로드
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
