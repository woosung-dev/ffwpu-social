// 업로드 전 클라이언트 이미지 리사이즈 — 원본 사진을 저장 상한(5MB) 아래로 줄인다 (ADR-046)
// 브라우저 전용(createImageBitmap·canvas·document) — Server Component / Server Action 에서 import 금지.
import {
  MAX_IMAGE_BYTES,
  fitWithinMaxEdge,
  isAllowedImageMime,
} from "./image-policy";

// 5MB 아래로 내려갈 때까지 순서대로 시도하는 재인코딩 품질 사다리
const QUALITY_LADDER = [0.85, 0.72, 0.6] as const;

// webp = 허용 MIME + 알파 보존 + quality 노브 + jpeg 대비 압축 우위 → 포맷 분기 없이 단일 경로
const TARGET_MIME = "image/webp";

const MB = 1024 * 1024;

function extFor(mime: string): string {
  return mime === "image/png" ? "png" : mime === "image/jpeg" ? "jpg" : "webp";
}

// 재인코딩하면 확장자도 함께 갈아야 한다 — object key 는 filename 의 확장자에서 파생되는데(upload.ts
// extFromFilenameOrMime) 그대로 두면 .jpg 키에 image/webp 를 얹은 불일치가 생긴다.
function renameWithExt(filename: string, ext: string): string {
  const base = filename.replace(/\.[^/.]+$/, "") || "image";
  return `${base}.${ext}`;
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("이미지 변환에 실패했습니다. 다른 이미지를 사용해주세요.")),
      TARGET_MIME,
      quality,
    );
  });
}

/**
 * 업로드용 파일을 준비한다. 이미 충분히 작으면 원본을 그대로 돌려주고, 크면 축소·재인코딩한다.
 * 목적은 운영자가 사진 용량을 신경 쓰지 않게 하는 것 — 현장 사진 원본은 보통 5~15MB 라 그대로는 항상 거부된다.
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
    const target = fitWithinMaxEdge(bitmap.width, bitmap.height);
    const isWithinEdge =
      target.width === bitmap.width && target.height === bitmap.height;
    // 용량·치수가 모두 상한 이하면 원본 그대로 — 불필요한 재인코딩은 화질만 깎는다
    if (file.size <= MAX_IMAGE_BYTES && isWithinEdge) return file;

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("이미지 변환에 실패했습니다.");
    ctx.drawImage(bitmap, 0, 0, target.width, target.height);

    for (const quality of QUALITY_LADDER) {
      const blob = await encode(canvas, quality);
      if (blob.size <= MAX_IMAGE_BYTES) {
        // toBlob 은 요청 형식 미지원 시 spec 상 image/png 로 조용히 폴백한다 → 결과 blob.type 을 신뢰
        const mime = isAllowedImageMime(blob.type) ? blob.type : TARGET_MIME;
        return new File([blob], renameWithExt(file.name, extFor(mime)), {
          type: mime,
        });
      }
    }
    throw new Error(
      `이미지를 ${MAX_IMAGE_BYTES / MB}MB 이하로 줄이지 못했습니다. 더 작은 이미지를 사용해주세요.`,
    );
  } finally {
    bitmap.close();
  }
}
