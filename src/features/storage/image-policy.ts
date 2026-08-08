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

/**
 * 커버 전용 리사이즈 목표 긴 변(px). 본문(MAX_IMAGE_EDGE_PX 2560)과 별개다.
 *
 * 왜 1440: featured 카드가 wide(1440) 뷰포트에서 50vw ≈ 720px CSS 로 그려진다 → DPR 2 에서 필요한 실제 픽셀이 1440.
 * 1920 이상으로 올리면 표시 시 다시 축소되므로 같은 용량을 화질이 아니라 낭비에 쓴다(실측 RMSE 5.37 → 6.30 악화).
 */
export const COVER_MAX_EDGE_PX = 1440;

/**
 * 커버 JPEG 품질(1~100). canvas `toBlob` 에 넘길 때는 /100 하여 0~1 로 변환한다.
 *
 * 왜 82 가 아니라 75 (36장 실측, 표시 1440 기준 RMSE):
 *   1200px q82 → 138 KB / RMSE 9.97
 *   1440px q75 → 136 KB / RMSE 5.37   ← 더 작은데 왜곡 46% 감소
 * 표시 폭보다 작은 이미지는 업스케일 손실이 지배해 품질을 올려도 화질이 개선되지 않는다
 * (1200 q82 와 1200 q75 의 RMSE 가 9.97 vs 10.20 으로 사실상 동일).
 * 해상도를 사고 압축률을 내주는 쪽이 같은 예산에서 더 선명하다 — imgix·Next.js 기본값도 75.
 */
export const COVER_JPEG_QUALITY = 75;

/**
 * 커버 결과물 목표 상한. 초과하면 품질을 낮춰 재시도한다.
 *
 * 왜 필요: 커버는 news/[id]/page.tsx 에서 og:image 로 직행하는데 카카오톡은 og:image 500KB 초과 시
 * 이미지 없는 카드로 렌더한다. 36장 실측 최대가 329KB 라 통상 도달하지 않지만, 앞으로 올라올
 * 더 무거운 사진에 대한 가드다. 450KB 는 500 대비 10% 안전 마진.
 */
export const COVER_TARGET_BYTES = 450 * 1024;

/**
 * 커버 품질 하강 사다리. `COVER_TARGET_BYTES` 를 넘을 때만 다음 단계로 내려간다.
 * 클라 리사이즈(canvas)와 백필 스크립트(sharp)가 같은 정책을 쓰도록 여기서 단일 정의한다 —
 * canvas `toBlob` 은 0~1 이라 /100 해서 넘긴다.
 * 36장 실측 최대가 329KB 라 통상 첫 단계에서 끝난다.
 */
export const COVER_QUALITY_LADDER = [COVER_JPEG_QUALITY, 68, 60] as const;

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
