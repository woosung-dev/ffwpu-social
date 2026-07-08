// 공지 첨부파일 허용 정책 — 순수 모듈(클라 import 안전, s3 의존 없음). 확장자 1차 + 신고 MIME 2차 검증 (ADR-041)
// MIME 검증은 보안 경계가 아니라 UX 사전검증(클라 신고값은 위조 가능) — 보안은 확장자 allowlist + canonical Content-Type 서명이 담당.

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 개당 20MB — ADR-017(이미지 5MB)을 공지 첨부에 한해 supersede
export const MAX_ATTACHMENTS_PER_NOTICE = 5;

type AttachmentPolicy = {
  /** presign Content-Type 서명에 쓰는 canonical MIME — 브라우저 신고값 편차가 서명 불일치를 못 일으키게 고정 */
  canonical: string;
  /** 브라우저가 신고할 수 있는 MIME 후보 — 문서형은 OS/브라우저별 편차가 커서 넓게 허용 */
  accepted: readonly string[];
};

const OOXML = "application/vnd.openxmlformats-officedocument";
// 문서형은 미등록 OS 에서 octet-stream 또는 빈 문자열로 신고되는 경우가 흔함 (특히 hwp on macOS)
const DOC_FALLBACK = ["application/octet-stream", ""] as const;

export const ATTACHMENT_POLICY: Record<string, AttachmentPolicy> = {
  pdf: { canonical: "application/pdf", accepted: ["application/pdf", ...DOC_FALLBACK] },
  docx: {
    canonical: `${OOXML}.wordprocessingml.document`,
    accepted: [`${OOXML}.wordprocessingml.document`, ...DOC_FALLBACK],
  },
  xlsx: {
    canonical: `${OOXML}.spreadsheetml.sheet`,
    accepted: [`${OOXML}.spreadsheetml.sheet`, ...DOC_FALLBACK],
  },
  pptx: {
    canonical: `${OOXML}.presentationml.presentation`,
    accepted: [`${OOXML}.presentationml.presentation`, ...DOC_FALLBACK],
  },
  hwp: {
    canonical: "application/x-hwp",
    accepted: [
      "application/x-hwp",
      "application/haansofthwp",
      "application/vnd.hancom.hwp",
      ...DOC_FALLBACK,
    ],
  },
  hwpx: {
    canonical: "application/vnd.hancom.hwpx",
    accepted: [
      "application/vnd.hancom.hwpx",
      "application/haansofthwpx",
      "application/hwp+zip",
      "application/zip",
      ...DOC_FALLBACK,
    ],
  },
  zip: {
    canonical: "application/zip",
    accepted: ["application/zip", "application/x-zip-compressed", ...DOC_FALLBACK],
  },
  // 이미지는 브라우저 신고가 안정적 — 엄격 유지
  jpg: { canonical: "image/jpeg", accepted: ["image/jpeg"] },
  jpeg: { canonical: "image/jpeg", accepted: ["image/jpeg"] },
  png: { canonical: "image/png", accepted: ["image/png"] },
  webp: { canonical: "image/webp", accepted: ["image/webp"] },
};

/** 어드민 <input accept> 문자열 — 정책 SSoT 에서 파생 */
export const NOTICE_ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_POLICY)
  .map((ext) => `.${ext}`)
  .join(",");

export function extFromFilename(filename: string): string | null {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : null;
}

export type AttachmentValidation =
  | { ok: true; ext: string; canonicalMime: string }
  | { ok: false; reason: "ext" | "mime" | "size" };

export function validateAttachment(
  filename: string,
  mime: string,
  size: number,
): AttachmentValidation {
  const ext = extFromFilename(filename);
  const policy = ext ? ATTACHMENT_POLICY[ext] : undefined;
  if (!ext || !policy) return { ok: false, reason: "ext" };
  if (!policy.accepted.includes(mime)) return { ok: false, reason: "mime" };
  if (size < 1 || size > MAX_ATTACHMENT_BYTES) return { ok: false, reason: "size" };
  return { ok: true, ext, canonicalMime: policy.canonical };
}

/** 첨부 object key prefix — presign 발급·service 위조 검증·cleanup 이 공유하는 단일 출처 */
export function noticeAttachmentKeyPrefix(noticeId: string): string {
  return `notices/${noticeId}/attachments/`;
}
