// 본문·커버 이미지 정책 — 순수 모듈(클라 import 안전, s3 의존 없음). 서버 검증과 클라 리사이즈가 공유하는 단일 출처 (ADR-046)
// upload.ts 는 @/lib/s3(aws-sdk·node:crypto) 의존이라 클라가 못 읽는다 → 정책만 여기로 분리.
// server-only 배럴(index.ts)이 아니라 이 파일을 직접 import 할 것 (attachment-policy.ts 와 동일 선례).

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

/** 저장 상한 — presign 발급 전 서버가 강제하는 최종 경계. 클라 리사이즈의 목표치이기도 하다 (ADR-017) */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * 원본 허용 상한 — 이보다 큰 파일은 리사이즈를 시도하지 않고 거부한다.
 * 왜: decode(createImageBitmap) 자체가 메모리를 원본 비례로 먹어 브라우저가 멈추거나 OOM 난다.
 * 저장 상한(5MB)과 별개 — 원본 12MB 사진은 여기를 통과해 리사이즈로 5MB 아래로 내려간다.
 */
export const MAX_SOURCE_IMAGE_BYTES = 30 * 1024 * 1024;

/**
 * 리사이즈 목표 긴 변(px).
 * 왜: 본문 이미지는 공개 페이지에서 next/image 를 안 거치고 raw <img> 로 나가 저장 크기 = 전송 크기.
 * 최대 표시폭(~800px)의 2배 + 여유.
 */
export const MAX_IMAGE_EDGE_PX = 2560;

/** 드롭존 1회 업로드 장수 — simple-editor 의 ImageUploadNode limit 과 에러 문구가 공유 */
export const MAX_IMAGES_PER_UPLOAD = 3;

export function isAllowedImageMime(mime: string): mime is AllowedImageMime {
  return (ALLOWED_IMAGE_MIME as readonly string[]).includes(mime);
}

/** 긴 변을 maxEdge 에 맞춘 목표 치수(비율 보존). 이미 이하면 원본 치수 그대로 반환 */
export function fitWithinMaxEdge(
  width: number,
  height: number,
  maxEdge: number = MAX_IMAGE_EDGE_PX,
): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) return { width, height };
  const scale = maxEdge / longEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

const MB = 1024 * 1024;

/**
 * 업로드 실패 사유를 운영자용 한국어로 옮긴다.
 * 왜: 벤더 원본(tiptap image-upload-node.tsx)이 영문 Error 를 던지는데, 벤더 파일을 직접 수정하지 않는 것이
 * 이 레포 관례(커밋 이력상 벤더링 1회 후 무수정)라 경계에서 번역한다.
 * 재벤더링으로 원문이 바뀌면 매칭이 빗나가 원문 그대로 노출된다 — 침묵보다 낫다는 판단.
 * 우리 코드가 던지는 메시지는 이미 한국어라 그대로 통과한다.
 */
export function toKoreanUploadError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.startsWith("File size exceeds maximum allowed")) {
    return `원본 이미지가 너무 큽니다. ${MAX_SOURCE_IMAGE_BYTES / MB}MB 이하 파일로 올려주세요.`;
  }
  if (/^Maximum \d+ files? allowed$/.test(message)) {
    return `이미지는 한 번에 ${MAX_IMAGES_PER_UPLOAD}장까지 올릴 수 있습니다.`;
  }
  if (message === "No files to upload" || message === "No file selected") {
    return "선택된 파일이 없습니다.";
  }
  return message;
}
