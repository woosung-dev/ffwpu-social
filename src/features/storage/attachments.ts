// 공지 첨부파일 presigned PUT 발급 — 정책(attachment-policy) 통과 후 canonical MIME 으로 서명 (ADR-041)
// R2 는 presigned POST 미지원 → PUT. content-length 서명 불가 → size 는 발급 전 선언값 검증만 (ADR-017 동일 트레이드오프).
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3_BUCKET, getPublicUrl, s3 } from "@/lib/s3";
import { noticeAttachmentKeyPrefix, validateAttachment } from "./attachment-policy";
import type { PresignedUploadResult } from "./upload";

const PRESIGN_EXPIRES_SECONDS = 60;

type CreatePresignedAttachmentUploadArgs = {
  noticeId: string;
  filename: string;
  mime: string;
  size: number;
};

export async function createPresignedAttachmentUpload(
  args: CreatePresignedAttachmentUploadArgs,
): Promise<PresignedUploadResult> {
  const validation = validateAttachment(args.filename, args.mime, args.size);
  if (!validation.ok) {
    throw new Error(
      `Attachment rejected (${validation.reason}): ${args.filename} / ${args.mime} / ${args.size}`,
    );
  }

  const key = `${noticeAttachmentKeyPrefix(args.noticeId)}${randomUUID()}.${validation.ext}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: validation.canonicalMime,
    }),
    { expiresIn: PRESIGN_EXPIRES_SECONDS },
  );

  return {
    uploadUrl,
    contentType: validation.canonicalMime,
    publicUrl: getPublicUrl(key),
    key,
  };
}
