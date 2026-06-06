// presigned POST 업로드 FormData 빌더 — 커버/본문 이미지 업로더 공용(pure, 클라 import 안전).
// Content-Type 은 서버 presign fields 에 이미 포함됨 → 별도로 append 금지.
// 중복 시 MinIO/S3 POST policy "eq $Content-Type" 가 "multiple values" 로 거부(403). 이 헬퍼가 단일 출처.
export function buildPresignedPostBody(
  fields: Record<string, string>,
  file: File,
): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  fd.append("file", file); // file 은 항상 마지막 (S3 POST 규약)
  return fd;
}
