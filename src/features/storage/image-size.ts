// 이미지 버퍼 → 픽셀 치수. PNG/JPEG 헤더 파싱 (외부 의존 0). seed·백필 공용 (마조네리 카드 비율).
// WEBP 등 미지원 포맷·파싱 실패는 null → 호출부가 폴백 비율(4/5) 처리. 어드민 업로드는 클라 createImageBitmap 별도 경로.
export function readImageSize(
  buf: Buffer,
): { width: number; height: number } | null {
  // PNG — 8B 시그니처 + IHDR(width@16, height@20, big-endian)
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG — FFD8 후 SOF0~15 마커(0xC0~0xCF, 단 C4/C8/CC 제외)에서 height@+5, width@+7
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) {
        off++;
        continue;
      }
      const marker = buf[off + 1];
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          height: buf.readUInt16BE(off + 5),
          width: buf.readUInt16BE(off + 7),
        };
      }
      const len = buf.readUInt16BE(off + 2); // 세그먼트 길이(마커 2B 제외)
      if (len < 2) break;
      off += 2 + len;
    }
  }
  return null;
}
