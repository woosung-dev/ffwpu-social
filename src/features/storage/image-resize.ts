// 업로드 전 클라이언트 이미지 리사이즈 — 원본 사진을 저장 상한(5MB) 아래로 줄인다 (ADR-046)
// 브라우저 전용(createImageBitmap·canvas·document) — Server Component / Server Action 에서 import 금지.
import {
  COVER_MAX_EDGE_PX,
  COVER_QUALITY_LADDER,
  COVER_TARGET_BYTES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_EDGE_PX,
  fitWithinMaxEdge,
  isAllowedImageMime,
} from "./image-policy";

// 손실 포맷(JPEG/WEBP)용 — 치수는 최대로 두고 품질을 낮춰가며 5MB 아래를 노린다.
const QUALITY_LADDER = [0.85, 0.72, 0.6] as const;

// 무손실 포맷(PNG)용 — quality 인자가 무시되므로 줄일 수단이 치수뿐이다. 긴 변을 단계적으로 낮춘다.
// 사진형 PNG 는 2560px 에서 ~12MB 라 축소가 불가피하다(실측). 도형·스크린샷 PNG 는 첫 단계에서 통과.
const EDGE_LADDER = [MAX_IMAGE_EDGE_PX, 2048, 1600, 1280] as const;

const MB = 1024 * 1024;

function isLossy(mime: string): boolean {
  return mime === "image/jpeg" || mime === "image/webp";
}

function extFor(mime: string): string {
  return mime === "image/png" ? "png" : mime === "image/jpeg" ? "jpg" : "webp";
}

// 재인코딩해도 확장자는 원본을 따른다. 다만 toBlob 이 형식을 갈아치우는 경우(아래)엔 결과 형식에 맞춰야 한다 —
// object key 가 filename 확장자에서 파생되므로(upload.ts extFromFilenameOrMime) 안 그러면
// .jpg 키에 image/webp 를 얹은 불일치가 생긴다.
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
 * 업로드용 파일을 준비한다. 이미 충분히 작으면 원본을 그대로 돌려주고, 크면 축소·재인코딩한다.
 * 목적은 운영자가 사진 용량을 신경 쓰지 않게 하는 것 — 현장 사진 원본은 보통 5~15MB 라 그대로는 항상 거부된다.
 *
 * **원본 형식을 유지한다** (JPG→JPG, PNG→PNG, WEBP→WEBP). webp 로 통일하면 더 작아지지만(실측 0.55 vs 0.81MB),
 * 커버 이미지는 소식 상세의 OG 썸네일로 그대로 나가므로(news/[id]/page.tsx) 파일 크기에 따라 OG 형식이
 * 조용히 바뀌는 결합이 생긴다 — 카카오톡 등 스크래퍼의 webp 지원은 보장되지 않는다. 0.26MB 이득과 바꿀 값이 아니다.
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
    const withinEdge =
      Math.max(bitmap.width, bitmap.height) <= MAX_IMAGE_EDGE_PX;
    // 용량·치수가 모두 상한 이하면 원본 그대로 — 불필요한 재인코딩은 화질만 깎는다
    if (file.size <= MAX_IMAGE_BYTES && withinEdge) return file;

    const mime = file.type;
    // 손실 포맷은 품질을, 무손실 포맷은 치수를 낮춰간다 — 시도 목록으로 펼쳐 한 루프로 처리
    const attempts = isLossy(mime)
      ? QUALITY_LADDER.map((quality) => ({ edge: MAX_IMAGE_EDGE_PX, quality }))
      : EDGE_LADDER.map((edge) => ({ edge, quality: undefined }));

    for (const { edge, quality } of attempts) {
      const blob = await encode(drawToCanvas(bitmap, edge), mime, quality);
      if (blob.size <= MAX_IMAGE_BYTES) {
        // toBlob 은 요청 형식 미지원 시 spec 상 image/png 로 조용히 폴백한다 → 결과 blob.type 을 신뢰
        const outMime = isAllowedImageMime(blob.type) ? blob.type : mime;
        return new File([blob], renameWithExt(file.name, extFor(outMime)), {
          type: outMime,
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
 * 커버 업로드용 파일을 준비한다. 본문용 `prepareImageForUpload` 와 세 가지가 다르다.
 *
 * 1. **크기와 무관하게 항상 재인코딩한다.** 본문용은 5MB 이하면 원본을 그대로 통과시키는데,
 *    그 게이트 때문에 1.8MB PNG 커버가 손대지 않은 채 올라가 라이브 평균이 1,161KB(최대 4,133KB)까지 갔다.
 * 2. **긴 변 1440px** (본문은 2560px). featured 카드가 wide 에서 50vw ≈ 720px CSS 로 그려져
 *    DPR 2 기준 필요 픽셀이 1440 이다. 그 이상은 표시 시 다시 축소돼 용량만 쓴다.
 * 3. **JPEG 고정 + 흰 배경 합성.** 커버는 news/[id]/page.tsx 에서 og:image 로 직행하는데
 *    카카오톡 스크래퍼의 WebP 지원이 보장되지 않는다(ADR-046). 카카오톡 og:image 500KB 상한도 있어
 *    `COVER_TARGET_BYTES` 초과 시 품질을 낮춘다.
 *
 * 본문 이미지는 상세 본문 폭이 넓고 포맷도 다양해 2560px·원본 포맷 유지가 여전히 타당하므로
 * `prepareImageForUpload` 는 그대로 둔다.
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
    const lastQuality = COVER_QUALITY_LADDER[COVER_QUALITY_LADDER.length - 1];
    for (const quality of COVER_QUALITY_LADDER) {
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
