// 공지 첨부파일 다중 업로더 — presigned PUT, 최대 5개·개당 20MB (ADR-041). 목록 상태는 부모(NoticeEditor)가 소유
"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUp, FileText, Loader2, Paperclip, X } from "lucide-react";
import { uploadNoticeAttachmentAction } from "@/features/notices/actions";
import {
  MAX_ATTACHMENTS_PER_NOTICE,
  NOTICE_ATTACHMENT_ACCEPT,
  validateAttachment,
} from "@/features/storage/attachment-policy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NoticeAttachmentItem = {
  clientId: string;
  fileName: string;
  /** S3 object key — 업로드 완료 전(uploading/error)은 null */
  key: string | null;
  /** presign 이 확정한 canonical MIME (업로드 전엔 브라우저 신고값) */
  mime: string;
  size: number;
  status: "uploading" | "done" | "error";
  errorMessage?: string;
};

// 클라 선검증 실패 사유 → 사용자 문구 (서버 uploadNoticeAttachmentAction 의 매핑과 동일 기준)
const REJECT_MESSAGE = {
  ext: "허용되지 않은 파일 형식이에요. (PDF·Word·Excel·PPT·한글·ZIP·이미지만 가능)",
  mime: "파일 형식을 확인할 수 없어요.",
  size: "개당 20MB 이하만 올릴 수 있어요.",
} as const;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

type Props = {
  noticeId: string;
  items: NoticeAttachmentItem[];
  onChange: React.Dispatch<React.SetStateAction<NoticeAttachmentItem[]>>;
  disabled?: boolean;
};

export function NoticeAttachmentUploader({
  noticeId,
  items,
  onChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  // error 항목은 자리만 차지하는 실패 기록 — 개수 상한 판정에서 제외
  const activeCount = items.filter((i) => i.status !== "error").length;
  const isFull = activeCount >= MAX_ATTACHMENTS_PER_NOTICE;

  const startUpload = async (file: File, clientId: string) => {
    try {
      const presign = await uploadNoticeAttachmentAction({
        noticeId,
        filename: file.name,
        mime: file.type,
        size: file.size,
      });
      if (!presign.success) {
        throw new Error(
          typeof presign.error === "string" ? presign.error : "업로드 URL 발급 실패",
        );
      }
      const { uploadUrl, contentType, key } = presign.data;
      // R2 presigned PUT — Content-Type 은 서명값(canonical)과 일치해야 함
      const resp = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!resp.ok) throw new Error(`업로드 실패 (HTTP ${resp.status})`);
      onChange((prev) =>
        prev.map((i) =>
          i.clientId === clientId
            ? { ...i, key, mime: contentType, status: "done" as const }
            : i,
        ),
      );
    } catch (err) {
      onChange((prev) =>
        prev.map((i) =>
          i.clientId === clientId
            ? {
                ...i,
                status: "error" as const,
                errorMessage:
                  err instanceof Error ? err.message : "업로드에 실패했어요.",
              }
            : i,
        ),
      );
    }
  };

  const handleSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let slots = MAX_ATTACHMENTS_PER_NOTICE - activeCount;
    for (const file of Array.from(files)) {
      const clientId = crypto.randomUUID();
      const base = {
        clientId,
        fileName: file.name,
        key: null,
        mime: file.type,
        size: file.size,
      };
      if (slots <= 0) {
        onChange((prev) => [
          ...prev,
          {
            ...base,
            status: "error" as const,
            errorMessage: `첨부는 최대 ${MAX_ATTACHMENTS_PER_NOTICE}개까지 가능해요.`,
          },
        ]);
        continue;
      }
      const validation = validateAttachment(file.name, file.type, file.size);
      if (!validation.ok) {
        onChange((prev) => [
          ...prev,
          { ...base, status: "error" as const, errorMessage: REJECT_MESSAGE[validation.reason] },
        ]);
        continue;
      }
      slots -= 1;
      onChange((prev) => [...prev, { ...base, status: "uploading" as const }]);
      void startUpload(file, clientId);
    }
    // 같은 파일 재선택 가능하도록 input 초기화
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (clientId: string) =>
    onChange((prev) => prev.filter((i) => i.clientId !== clientId));

  const move = (clientId: string, dir: -1 | 1) =>
    onChange((prev) => {
      const idx = prev.findIndex((i) => i.clientId === clientId);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={NOTICE_ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
        disabled={disabled}
        aria-label="첨부파일 선택"
      />
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={item.clientId}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                item.status === "error"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border bg-white",
              )}
            >
              {item.status === "uploading" ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-ink-subtle" aria-hidden />
              ) : (
                <FileText
                  className={cn(
                    "size-4 shrink-0",
                    item.status === "error" ? "text-destructive" : "text-ink-subtle",
                  )}
                  aria-hidden
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-strong" title={item.fileName}>
                  {item.fileName}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    item.status === "error" ? "text-destructive" : "text-ink-subtle",
                  )}
                >
                  {item.status === "uploading"
                    ? `업로드 중… · ${formatBytes(item.size)}`
                    : item.status === "error"
                      ? item.errorMessage
                      : formatBytes(item.size)}
                </p>
              </div>
              {item.status === "done" && (
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => move(item.clientId, -1)}
                    disabled={disabled || idx === 0}
                    aria-label={`${item.fileName} 순서 위로`}
                    className="flex size-7 items-center justify-center rounded text-ink-subtle transition-colors hover:text-ink-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                  >
                    <ArrowUp className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(item.clientId, 1)}
                    disabled={disabled || idx === items.length - 1}
                    aria-label={`${item.fileName} 순서 아래로`}
                    className="flex size-7 items-center justify-center rounded text-ink-subtle transition-colors hover:text-ink-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                  >
                    <ArrowDown className="size-3.5" aria-hidden />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(item.clientId)}
                disabled={disabled || item.status === "uploading"}
                aria-label={`${item.fileName} 삭제`}
                className="flex size-7 shrink-0 items-center justify-center rounded text-ink-subtle transition-colors hover:text-destructive disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isFull}
        className="w-full"
      >
        <Paperclip className="size-4" aria-hidden />
        {isFull
          ? `최대 ${MAX_ATTACHMENTS_PER_NOTICE}개까지 첨부할 수 있어요`
          : `파일 추가 (${activeCount}/${MAX_ATTACHMENTS_PER_NOTICE})`}
      </Button>
    </div>
  );
}
