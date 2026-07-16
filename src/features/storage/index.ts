// storage 도메인 public API — server-only (S3 client·presigner 의존). Client Component import 금지
import "server-only"; // client bundle 유입 시 빌드 에러 (codex v2 P2 — 경계 강제)

export {
  createPresignedUpload,
  type PresignedUploadResult,
  type UploadScope,
  type UploadTarget,
} from "./upload";

// 이미지 정책은 순수 모듈이 SSOT — 서버 코드 편의로 여기서도 노출한다.
// 클라(리사이즈·업로더)는 이 server-only 배럴을 못 쓰므로 image-policy 를 직접 import 할 것 (ADR-046).
export {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  isAllowedImageMime,
  type AllowedImageMime,
} from "./image-policy";

export { createPresignedAttachmentUpload } from "./attachments";
// 순수 정책(attachment-policy.ts)은 클라 공유용이라 이 server-only 배럴에 안 태움 — 직접 import
export { deleteByKeys, deleteByPrefix } from "./cleanup";
