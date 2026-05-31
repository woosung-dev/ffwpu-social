// S3 호환 스토리지 클라이언트 (로컬 MinIO / 배포 R2·S3) — ADR-019 마이그레이션 친화 + path-style 강제
import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION ?? "us-east-1";
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

if (!endpoint || !accessKeyId || !secretAccessKey) {
  // 빌드 시점엔 평가 안 됨 (runtime 사용 시점에 throw). dev 명시 경고.
  // eslint-disable-next-line no-console
  console.warn(
    "[s3] S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY 미설정 (.env.local 확인)",
  );
}

export const s3 = new S3Client({
  endpoint,
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
  forcePathStyle,
});

export const S3_BUCKET = process.env.S3_BUCKET ?? "ffwpu-social";

const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;

// 업로드된 객체의 공개 URL. MinIO 로컬·R2 prod 양쪽 NEXT_PUBLIC_S3_PUBLIC_URL 단일화 (codex P1#3 정합)
export function getPublicUrl(key: string): string {
  if (!publicBase) {
    throw new Error("NEXT_PUBLIC_S3_PUBLIC_URL is not set");
  }
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}

// XSS-safe 본문 렌더링 시 image src 검증용 prefix (codex P1#3 — NewsBodyRenderer 사용 예정)
export function isAllowedImagePublicUrl(url: string): boolean {
  if (!publicBase) return false;
  const base = publicBase.replace(/\/$/, "");
  return url.startsWith(`${base}/`);
}
