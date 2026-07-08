// 공지 첨부 정책·presign 가드 회귀 테스트 — 확장자 1차 + MIME 2차, canonical 서명, key prefix (ADR-041)
import { describe, expect, it } from "vitest";

import {
  ATTACHMENT_POLICY,
  MAX_ATTACHMENT_BYTES,
  NOTICE_ATTACHMENT_ACCEPT,
  extFromFilename,
  noticeAttachmentKeyPrefix,
  validateAttachment,
} from "./attachment-policy";
import { createPresignedAttachmentUpload } from "./attachments";

describe("validateAttachment", () => {
  it("PDF 는 정확한 MIME 으로 통과한다", () => {
    const r = validateAttachment("보고서.pdf", "application/pdf", 1024);
    expect(r).toEqual({ ok: true, ext: "pdf", canonicalMime: "application/pdf" });
  });

  it("hwp 는 octet-stream·빈 MIME 신고도 허용하고 canonical 로 고정한다", () => {
    for (const mime of ["application/x-hwp", "application/haansofthwp", "application/octet-stream", ""]) {
      const r = validateAttachment("안내문.hwp", mime, 1024);
      expect(r).toEqual({ ok: true, ext: "hwp", canonicalMime: "application/x-hwp" });
    }
  });

  it("허용 목록에 없는 확장자(exe 등)는 거부한다", () => {
    expect(validateAttachment("virus.exe", "application/octet-stream", 10)).toEqual({
      ok: false,
      reason: "ext",
    });
    expect(validateAttachment("확장자없음", "application/pdf", 10)).toEqual({
      ok: false,
      reason: "ext",
    });
  });

  it("이미지는 신고 MIME 을 엄격 검증한다", () => {
    expect(validateAttachment("photo.png", "image/png", 10)).toMatchObject({ ok: true });
    expect(validateAttachment("photo.png", "application/octet-stream", 10)).toEqual({
      ok: false,
      reason: "mime",
    });
  });

  it("20MB 초과·0 바이트는 거부한다", () => {
    expect(
      validateAttachment("big.pdf", "application/pdf", MAX_ATTACHMENT_BYTES + 1),
    ).toEqual({ ok: false, reason: "size" });
    expect(validateAttachment("empty.pdf", "application/pdf", 0)).toEqual({
      ok: false,
      reason: "size",
    });
  });

  it("확장자는 대소문자 무시로 판정한다", () => {
    expect(validateAttachment("REPORT.PDF", "application/pdf", 10)).toMatchObject({
      ok: true,
      ext: "pdf",
    });
  });
});

describe("정책 파생 상수", () => {
  it("accept 문자열은 정책 확장자 전체를 포함한다", () => {
    for (const ext of Object.keys(ATTACHMENT_POLICY)) {
      expect(NOTICE_ATTACHMENT_ACCEPT).toContain(`.${ext}`);
    }
  });

  it("key prefix 는 notices/{id}/attachments/ 형태다", () => {
    expect(noticeAttachmentKeyPrefix("abc-123")).toBe("notices/abc-123/attachments/");
  });

  it("extFromFilename 은 마지막 확장자만 취한다", () => {
    expect(extFromFilename("archive.tar.zip")).toBe("zip");
    expect(extFromFilename("noext")).toBeNull();
  });
});

describe("createPresignedAttachmentUpload 입력 가드", () => {
  it("정책 위반은 presign 발급 전에 throw 한다", async () => {
    await expect(
      createPresignedAttachmentUpload({
        noticeId: "n1",
        filename: "virus.exe",
        mime: "application/octet-stream",
        size: 1024,
      }),
    ).rejects.toThrow(/Attachment rejected \(ext\)/);

    await expect(
      createPresignedAttachmentUpload({
        noticeId: "n1",
        filename: "big.pdf",
        mime: "application/pdf",
        size: MAX_ATTACHMENT_BYTES + 1,
      }),
    ).rejects.toThrow(/Attachment rejected \(size\)/);
  });
});
