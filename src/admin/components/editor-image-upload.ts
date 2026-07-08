// 본문 이미지 업로드 — 공식 ImageUploadNode 의 upload 시그니처를 우리 R2 presigned PUT 에 배선
import { uploadImageAction } from "@/features/news/actions";
import { uploadNoticeImageAction } from "@/features/notices/actions";

export type EditorScope =
  | { newsId: string }
  | { tempId: string }
  | { noticeId: string };

// scope 별 presign 액션 분기 — 공지는 notices/{id}/ prefix (ADR-042), 소식은 기존 news 경로
async function requestPresign(
  scope: EditorScope,
  file: File,
): Promise<
  | { success: true; data: { uploadUrl: string; contentType: string; publicUrl: string } }
  | { success: false; error: unknown }
> {
  const base = { filename: file.name, mime: file.type, size: file.size };
  if ("noticeId" in scope) {
    return uploadNoticeImageAction({ ...base, noticeId: scope.noticeId });
  }
  return uploadImageAction({ ...base, target: "body", ...scope });
}

// (file, onProgress?, abortSignal?) => Promise<publicUrl> — ImageUploadNode 호환
export function makeBodyImageUploader(scope?: EditorScope) {
  return async (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal,
  ): Promise<string> => {
    if (!scope) throw new Error("이미지 업로드 scope 가 없습니다.");
    const presign = await requestPresign(scope, file);
    if (!presign.success) {
      const msg =
        typeof presign.error === "string" ? presign.error : "업로드 URL 발급 실패";
      throw new Error(msg);
    }
    const { uploadUrl, contentType, publicUrl } = presign.data;
    // R2 presigned PUT — Content-Type 은 서명값과 일치해야 함
    const resp = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
      signal: abortSignal,
    });
    if (!resp.ok) {
      throw new Error(`이미지 업로드 실패 (HTTP ${resp.status})`);
    }
    onProgress?.({ progress: 100 });
    return publicUrl;
  };
}

// 업로드 전 파일에서 원본 픽셀 치수 읽기(네트워크 없음) — 2-up 행 비율 보존용. 실패 시 null.
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
