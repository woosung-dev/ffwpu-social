// 본문 이미지 업로드 — 공식 ImageUploadNode 의 upload 시그니처를 우리 R2 presigned PUT 에 배선
import { uploadImageAction } from "@/features/news/actions";

export type EditorScope = { newsId: string } | { tempId: string };

// (file, onProgress?, abortSignal?) => Promise<publicUrl> — ImageUploadNode 호환
export function makeBodyImageUploader(scope?: EditorScope) {
  return async (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal,
  ): Promise<string> => {
    if (!scope) throw new Error("이미지 업로드 scope 가 없습니다.");
    const presign = await uploadImageAction({
      filename: file.name,
      mime: file.type,
      size: file.size,
      target: "body",
      ...scope,
    });
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
