// 업로드 이미지 픽셀 치수 추출(클라 createImageBitmap) — 본문 이미지 실제 비율 저장(CLS 0)용. 실패 시 null
export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return null;
  }
}
