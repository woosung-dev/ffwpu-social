// storage 도메인 public API — server-only (S3 client·presigner 의존). Client Component import 금지
import "server-only"; // client bundle 유입 시 빌드 에러 (codex v2 P2 — 경계 강제)

export {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  createPresignedUpload,
  isAllowedImageMime,
  type AllowedImageMime,
  type PresignedUploadResult,
  type UploadScope,
  type UploadTarget,
} from "./upload";

export { createPresignedAttachmentUpload } from "./attachments";
// 순수 정책(attachment-policy.ts)은 클라 공유용이라 이 server-only 배럴에 안 태움 — 직접 import
export { deleteByPrefix } from "./cleanup";
