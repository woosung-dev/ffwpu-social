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
 * 본문 인라인 이미지 리사이즈 목표 긴 변(px).
 * 본문은 공개 페이지에서 next/image 를 안 거치고 raw <img> 로 나가 **저장 크기 = 전송 크기**다.
 *
 * 왜 1810 (2026-08-08 실측으로 2560 에서 하향): 본문 컨테이너가 lg+ 에서 905px 이고
 * (news/[id]/page.tsx), 이미지 143개 중 105개(73%)가 width 속성 없이 `max-w-full` 로
 * 컨테이너 폭까지 늘어난다 → DPR 2 기준 필요한 실제 픽셀이 905 × 2 = 1810.
 * 그 이상은 표시 시 다시 축소돼 용량만 쓴다.
 */
export const MAX_IMAGE_EDGE_PX = 1810;

/**
 * 투명 픽셀 비율이 이 값 이상이면 JPEG 재인코딩을 건너뛰고 원본을 그대로 쓴다.
 *
 * 왜: JPEG 는 알파가 없어 투명 영역이 흰색으로 합성되는데, 상세 본문 배경에
 * `bg-gradient-to-b from-white to-[#F9F4FF]/80` 라벤더 그라데이션이 깔려 있어(news/[id]/page.tsx)
 * 그 구간에서 흰 박스로 드러난다.
 *
 * 왜 크기 기준으로는 못 거르나: 11KB 투명 PNG 를 JPEG 로 바꾸면 3KB(이득 78%)라
 * `REENCODE_MIN_GAIN` 을 통과해 버린다 — 투명도 판정이 별도로 필요하다.
 *
 * 대상은 로고·아이콘류 17개(합계 229KB, 전체 본문 이미지 용량의 0.2%)라 방치해도 손실이 없다.
 */
export const TRANSPARENT_SKIP_RATIO = 0.1;

/**
 * 재인코딩 결과가 원본 대비 이 비율만큼 줄지 않으면 원본을 유지한다.
 *
 * 왜: (1) 이미 최적화된 파일에 세대 손실(generation loss)만 주는 것을 막고,
 * (2) 백필 재실행 시 전건 skip 되어 멱등성이 성립한다.
 * "치수·용량이 규격 안에 든다"로 판정하면 q85~90 으로 저장된 과품질 파일이 그대로 남는다 —
 * 커버 백필에서 실제로 432KB 파일이 스킵돼 카카오톡 상한 코앞에 방치됐다.
 */
export const REENCODE_MIN_GAIN = 0.15;

/**
 * 커버 전용 리사이즈 목표 긴 변(px). 본문(MAX_IMAGE_EDGE_PX)과 별개다.
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
 * JPEG 품질 하강 사다리. 결과가 목표 상한을 넘을 때만 다음 단계로 내려간다.
 * 커버(`COVER_TARGET_BYTES`)와 본문(`MAX_IMAGE_BYTES`)이 상한만 다르고 사다리는 공유한다.
 * 클라 리사이즈(canvas)와 백필 스크립트(sharp)가 같은 정책을 쓰도록 여기서 단일 정의한다 —
 * canvas `toBlob` 은 0~1 이라 /100 해서 넘긴다.
 * 실측상 통상 첫 단계에서 끝난다 (커버 최대 329KB, 본문 1810px q75 최대 495KB).
 */
export const JPEG_QUALITY_LADDER = [COVER_JPEG_QUALITY, 68, 60] as const;

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
