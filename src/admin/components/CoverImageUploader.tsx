// 어드민 커버 이미지 업로더 — 클릭/드래그앤드롭 → uploadImageAction → coverImageUrl set. 실패 시 기존 url 유지 (결정 로그 [T8 실패 처리])
"use client";

import { useRef, useState } from "react";
import NextImage from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImageAction } from "@/features/news/actions";
import { buildPresignedPostBody } from "@/features/storage/presigned-upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  scope: { newsId: string } | { tempId: string };
  onError?: (msg: string) => void;
  disabled?: boolean;
};

export function CoverImageUploader({
  value,
  onChange,
  scope,
  onError,
  disabled,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError?.("이미지 파일만 업로드 가능합니다.");
      return;
    }
    setIsUploading(true);
    try {
      const presign = await uploadImageAction({
        filename: file.name,
        mime: file.type,
        size: file.size,
        target: "cover",
        ...scope,
      });
      if (!presign.success) {
        const msg =
          typeof presign.error === "string"
            ? presign.error
            : "업로드 URL 발급 실패";
        throw new Error(msg);
      }
      const { uploadUrl, fields, publicUrl } = presign.data;
      const fd = buildPresignedPostBody(fields, file);
      const resp = await fetch(uploadUrl, { method: "POST", body: fd });
      if (!resp.ok) {
        throw new Error(`업로드 실패 (HTTP ${resp.status})`);
      }
      onChange(publicUrl);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "커버 이미지 업로드 실패");
      // 실패 시 기존 value 유지 — 의도적으로 onChange 호출 안 함 (결정 로그 [T8 실패 처리])
    } finally {
      setIsUploading(false);
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => !disabled && !isUploading && onDrop(e)}
        role="button"
        tabIndex={0}
        aria-label="커버 이미지 업로드"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !isUploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "relative flex aspect-[16/9] w-full max-w-xl cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2",
          isDragOver
            ? "border-brand-primary bg-brand-primary/5"
            : "border-border bg-surface-soft/60 hover:bg-surface-soft",
          (disabled || isUploading) && "cursor-not-allowed opacity-60",
        )}
      >
        {value ? (
          <NextImage
            src={value}
            alt="커버 이미지 미리보기"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
            unoptimized // MinIO 로컬 + R2 prod 양쪽 next/image loader 우회
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-subtle">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">업로드 중...</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">클릭 또는 드래그앤드롭</span>
                <span className="text-xs">JPG / PNG / WEBP · 최대 5MB</span>
              </>
            )}
          </div>
        )}
        {isUploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
          </div>
        )}
      </div>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={disabled || isUploading}
          className="gap-1 text-xs text-ink-subtle"
        >
          <X className="h-3 w-3" />
          제거
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPickFile}
      />
    </div>
  );
}
