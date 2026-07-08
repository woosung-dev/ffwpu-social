// 첨부 다운로드 Content-Disposition 헬퍼 — 한글 원본 파일명 보존 (RFC 5987 filename* + ASCII fallback)
// 순수 모듈 — 다운로드 route 가 사용, 단위테스트 대상

// RFC 5987 ext-value 인코딩 — encodeURIComponent 가 남기는 attr-char 외 문자(' ( ) *)도 %-escape
function encodeRFC5987(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function attachmentContentDisposition(fileName: string): string {
  // ASCII fallback — 비ASCII·따옴표·역슬래시를 _ 로 치환 (구형 클라이언트용, 최신 브라우저는 filename* 우선)
  const fallback = fileName.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRFC5987(fileName)}`;
}
