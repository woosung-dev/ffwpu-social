// 업로드 전 클라이언트 이미지 정규화 — 표시에 필요한 픽셀로 줄이고 JPEG 로 재인코딩한다 (ADR-046 → ADR-051)
// 저장본이 곧 전송본이다(next/image 런타임 최적화 이탈, ADR-051) → 여기서 안 줄이면 그대로 사용자가 받는다.
// 브라우저 전용(createImageBitmap·canvas·document) — Server Component / Server Action 에서 import 금지.
import {
  COVER_MAX_EDGE_PX,
  COVER_TARGET_BYTES,
  JPEG_QUALITY_LADDER,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_EDGE_PX,
  REENCODE_MIN_GAIN,
  TRANSPARENT_SKIP_RATIO,
  fitWithinMaxEdge,
  isAllowedImageMime,
} from "./image-policy";

const MB = 1024 * 1024;

// 투명도 판정용 축소 canvas 한 변. 원본 그대로 getImageData 하면 4000×3000 에서 48MB 배열이 나온다.
// 축소는 알파를 평균내므로 로고형(70%+ 투명)과 사진형(0%)의 구분에는 충분하다.
const ALPHA_PROBE_EDGE = 200;

// object key 가 filename 확장자에서 파생되므로(upload.ts extFromFilenameOrMime)
// 재인코딩으로 형식이 바뀌면 확장자도 맞춰야 한다 — 안 그러면 .png 키에 image/jpeg 를 얹은 불일치가 생긴다.
function renameWithExt(filename: string, ext: string): string {
  const base = filename.replace(/\.[^/.]+$/, "") || "image";
  return `${base}.${ext}`;
}

// background 를 주면 drawImage 전에 그 색으로 칠한다. JPEG 출력 시 필수 —
// canvas 는 투명으로 초기화되는데 JPEG 는 알파가 없어 PNG 투명 영역이 검게 나온다.
function drawToCanvas(
  bitmap: ImageBitmap,
  maxEdge: number,
  background?: string,
): HTMLCanvasElement {
  const target = fitWithinMaxEdge(bitmap.width, bitmap.height, maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지 변환에 실패했습니다.");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, target.width, target.height);
  }
  ctx.drawImage(bitmap, 0, 0, target.width, target.height);
  return canvas;
}

function encode(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new Error("이미지 변환에 실패했습니다. 다른 이미지를 사용해주세요."),
            ),
      mime,
      quality,
    );
  });
}

/**
 * 투명 픽셀 비율(0~1). 축소본으로 판정한다 — 원본 그대로 `getImageData` 하면 배열이 수십 MB 다.
 * 알파 채널이 없는 형식(JPEG)은 0 을 반환한다.
 */
function measureTransparentRatio(bitmap: ImageBitmap): number {
  const target = fitWithinMaxEdge(
    bitmap.width,
    bitmap.height,
    ALPHA_PROBE_EDGE,
  );
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  // 배경을 칠하지 않는다 — canvas 는 투명으로 초기화되므로 원본 알파가 그대로 남는다
  ctx.drawImage(bitmap, 0, 0, target.width, target.height);
  const { data } = ctx.getImageData(0, 0, target.width, target.height);
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) transparent++;
  }
  return transparent / (data.length / 4);
}

/**
 * 본문 인라인 이미지 업로드용 파일을 준비한다.
 *
 * 본문은 공개 페이지에서 raw `<img>` 로 나가 **저장 크기 = 전송 크기**다. 그래서 커버와 마찬가지로
 * 크기와 무관하게 항상 재인코딩한다 — 예전에는 `file.size <= 5MB` 면 손대지 않았고, 그 게이트 때문에
 * 프로덕션 본문 이미지 151개가 평균 763KB(최대 3,442KB)까지 쌓였다(2026-08-08 실측, 합계 110.8MB).
 *
 * 두 가지 경우에는 원본을 그대로 쓴다:
 * 1. **투명 픽셀 10% 이상** — JPEG 는 알파가 없어 흰 박스가 된다 (`TRANSPARENT_SKIP_RATIO` 주석 참조)
 * 2. **재인코딩 이득 15% 미만** — 이미 최적인 파일에 세대 손실만 주지 않는다
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  // 허용 형식이 아니면 손대지 않는다 — 형식 거부는 서버가 한국어로 판정한다(판정 중복 회피)
  if (!isAllowedImageMime(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("이미지를 읽을 수 없습니다. 파일이 손상되었는지 확인해주세요.");
  }

  try {
    if (measureTransparentRatio(bitmap) >= TRANSPARENT_SKIP_RATIO) return file;

    const canvas = drawToCanvas(bitmap, MAX_IMAGE_EDGE_PX, "#ffffff");
    const lastQuality = JPEG_QUALITY_LADDER[JPEG_QUALITY_LADDER.length - 1];
    for (const quality of JPEG_QUALITY_LADDER) {
      const blob = await encode(canvas, "image/jpeg", quality / 100);
      if (blob.size <= MAX_IMAGE_BYTES || quality === lastQuality) {
        if (blob.size > file.size * (1 - REENCODE_MIN_GAIN)) return file;
        return new File([blob], renameWithExt(file.name, "jpg"), {
          type: "image/jpeg",
        });
      }
    }
    throw new Error(
      `이미지를 ${MAX_IMAGE_BYTES / MB}MB 이하로 줄이지 못했습니다. JPG 로 저장해서 올려주세요.`,
    );
  } finally {
    bitmap.close();
  }
}

/**
 * 커버 업로드용 파일을 준비한다. 본문용 `prepareImageForUpload` 와 두 가지가 다르다.
 *
 * 1. **긴 변 1440px** (본문은 1810px). featured 카드가 wide 에서 50vw ≈ 720px CSS 로 그려져
 *    DPR 2 기준 필요 픽셀이 1440 이다. 본문은 컨테이너가 905px 이라 1810 이 필요하다.
 * 2. **투명도 스킵이 없고 상한이 `COVER_TARGET_BYTES`(450KB)다.** 커버는 news/[id]/page.tsx 에서
 *    og:image 로 직행하는데 카카오톡이 500KB 초과 시 이미지 없는 카드로 렌더한다 —
 *    투명 로고를 커버로 쓰는 경우가 없으므로 예외 없이 JPEG 로 통일한다.
 *    WebP 를 안 쓰는 이유는 카카오톡 스크래퍼의 WebP 지원이 보장되지 않아서다(ADR-046).
 */
export async function prepareCoverForUpload(file: File): Promise<File> {
  // 허용 형식이 아니면 손대지 않는다 — 형식 거부는 서버가 한국어로 판정한다(판정 중복 회피)
  if (!isAllowedImageMime(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("이미지를 읽을 수 없습니다. 파일이 손상되었는지 확인해주세요.");
  }

  try {
    const canvas = drawToCanvas(bitmap, COVER_MAX_EDGE_PX, "#ffffff");
    const lastQuality = JPEG_QUALITY_LADDER[JPEG_QUALITY_LADDER.length - 1];
    for (const quality of JPEG_QUALITY_LADDER) {
      const blob = await encode(canvas, "image/jpeg", quality / 100);
      // 마지막 단계는 상한을 넘어도 반환한다 — 업로드를 막는 것보다 조금 큰 커버가 낫다.
      // 저장 상한(MAX_IMAGE_BYTES 5MB)은 서버 presign 이 최종 판정한다.
      if (blob.size <= COVER_TARGET_BYTES || quality === lastQuality) {
        return new File([blob], renameWithExt(file.name, "jpg"), {
          type: "image/jpeg",
        });
      }
    }
    throw new Error("이미지 변환에 실패했습니다. 다른 이미지를 사용해주세요.");
  } finally {
    bitmap.close();
  }
}
