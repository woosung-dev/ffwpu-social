// 이미지 업로드 presigned POST 발급 — codex P1#4 (content-length-range + Content-Type 강제) + ADR-017 (이미지 5MB)
import { randomUUID } from "node:crypto";
import { createPresignedPost as awsCreatePresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3_BUCKET, getPublicUrl, s3 } from "@/lib/s3";

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // ADR-017
const PRESIGN_EXPIRES_SECONDS = 60;

export type UploadTarget = "cover" | "body";

export type PresignedUploadResult = {
  uploadUrl: string;
  fields: Record<string, string>;
  publicUrl: string;
  key: string;
};

// scope: 작성 모드는 tempId (글 저장 전), 수정 모드는 newsId. orphan 정리는 v1.1 cleanup job (codex P2#4)
export type UploadScope = { newsId: string } | { tempId: string };

type CreatePresignedPostArgs = {
  scope: UploadScope;
  filename: string;
  mime: string;
  size: number;
};

export function isAllowedImageMime(mime: string): mime is AllowedImageMime {
  return (ALLOWED_IMAGE_MIME as readonly string[]).includes(mime);
}

function extFromFilenameOrMime(filename: string, mime: string): string {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/);
  if (m) return m[1].toLowerCase();
  return mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
}

function buildObjectKey(
  scope: UploadScope,
  filename: string,
  mime: string,
): string {
  const ext = extFromFilenameOrMime(filename, mime);
  const prefix =
    "newsId" in scope ? `news/${scope.newsId}` : `news/temp-${scope.tempId}`;
  return `${prefix}/${randomUUID()}.${ext}`;
}

// S3 Presigned POST + content-length-range 정책. MIME 위조·사이즈 우회 차단 (codex P1#4).
// 만료 60초 — 발급 후 즉시 업로드 가정.
export async function createPresignedPost(
  args: CreatePresignedPostArgs,
): Promise<PresignedUploadResult> {
  if (!isAllowedImageMime(args.mime)) {
    throw new Error(`Unsupported MIME: ${args.mime}`);
  }
  if (args.size < 1 || args.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Image size ${args.size} out of range (1..${MAX_IMAGE_BYTES})`,
    );
  }

  const key = buildObjectKey(args.scope, args.filename, args.mime);

  const { url, fields } = await awsCreatePresignedPost(s3, {
    Bucket: S3_BUCKET,
    Key: key,
    Conditions: [
      ["content-length-range", 1, MAX_IMAGE_BYTES],
      ["eq", "$Content-Type", args.mime],
    ],
    Fields: { "Content-Type": args.mime },
    Expires: PRESIGN_EXPIRES_SECONDS,
  });

  return {
    uploadUrl: url,
    fields,
    publicUrl: getPublicUrl(key),
    key,
  };
}
