// 이미지 업로드 presigned PUT URL 발급 — R2 호환 (R2 는 presigned POST 미지원, GET/PUT 만 지원).
// ADR-017 (이미지 5MB). POST policy 의 content-length-range 는 PUT 서명에 불가 → 서버측 size 사전검증으로 대체.
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
  // 클라가 PUT 시 그대로 보낼 Content-Type — 서명된 헤더라 불일치 시 R2 가 거부
  contentType: string;
  publicUrl: string;
  key: string;
};

// scope: 작성 모드는 tempId (글 저장 전), 수정 모드는 newsId. orphan 정리는 v1.1 cleanup job (codex P2#4)
// noticeId: 공지 본문 이미지 — 공지는 클라 UUID 선생성이라 temp 변형 없음 (ADR-042)
export type UploadScope = { newsId: string } | { tempId: string } | { noticeId: string };

type CreatePresignedUploadArgs = {
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
    "newsId" in scope
      ? `news/${scope.newsId}`
      : "noticeId" in scope
        ? `notices/${scope.noticeId}`
        : `news/temp-${scope.tempId}`;
  return `${prefix}/${randomUUID()}.${ext}`;
}

// Presigned PUT URL. Content-Type 을 서명에 포함 → MIME 위조 차단. 사이즈 상한은 서버 사전검증(아래)으로 강제.
// 만료 60초 — 발급 후 즉시 업로드 가정.
export async function createPresignedUpload(
  args: CreatePresignedUploadArgs,
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

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: args.mime,
    }),
    { expiresIn: PRESIGN_EXPIRES_SECONDS },
  );

  return {
    uploadUrl,
    contentType: args.mime,
    publicUrl: getPublicUrl(key),
    key,
  };
}
