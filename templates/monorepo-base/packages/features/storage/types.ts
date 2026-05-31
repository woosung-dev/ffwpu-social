// 스토리지 driver 인터페이스 — MinIO/R2/S3 가 동일 시그니처로 구현
import { z } from "zod";

export const uploadInputSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(512)
    .regex(/^[a-zA-Z0-9/_.-]+$/, "key 는 영숫자/슬래시/언더스코어/점/하이픈만"),
  contentType: z.string().min(1).max(120),
  size: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB 한도
});
export type UploadInput = z.infer<typeof uploadInputSchema>;

export interface PresignedUpload {
  url: string;
  method: "PUT" | "POST";
  headers: Record<string, string>;
  publicUrl: string;
  expiresAt: Date;
}

export interface StorageDriver {
  name: string;
  // 클라이언트 직접 업로드용 presigned URL 발급
  createPresignedUpload(input: UploadInput): Promise<PresignedUpload>;
  // 서버 사이드 직접 업로드 (작은 파일)
  putObject(key: string, body: Uint8Array | Buffer, contentType: string): Promise<{ publicUrl: string }>;
  // 객체 삭제 (admin 컨텐츠 정리)
  deleteObject(key: string): Promise<void>;
  // 공개 URL 조립 (CDN 도메인 분리 시 driver 가 책임)
  getPublicUrl(key: string): string;
}

export class StorageError extends Error {
  constructor(
    public code: "NOT_CONFIGURED" | "UPLOAD_FAILED" | "DELETE_FAILED" | "INVALID_KEY",
    message: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}
