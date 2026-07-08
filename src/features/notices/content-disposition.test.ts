// Content-Disposition 헬퍼 테스트 — 한글 파일명 RFC 5987 + ASCII fallback + 헤더 주입 문자 무해화
import { describe, expect, it } from "vitest";

import { attachmentContentDisposition } from "./content-disposition";

describe("attachmentContentDisposition", () => {
  it("ASCII 파일명은 그대로 fallback 에 들어간다", () => {
    expect(attachmentContentDisposition("report.pdf")).toBe(
      `attachment; filename="report.pdf"; filename*=UTF-8''report.pdf`,
    );
  });

  it("한글 파일명은 filename* 에 UTF-8 인코딩, fallback 은 _ 치환", () => {
    const header = attachmentContentDisposition("안내문.hwp");
    expect(header).toContain(`filename="___.hwp"`);
    expect(header).toContain(`filename*=UTF-8''%EC%95%88%EB%82%B4%EB%AC%B8.hwp`);
  });

  it("따옴표·역슬래시는 fallback 에서 _ 로 무해화된다 (헤더 주입 차단)", () => {
    const header = attachmentContentDisposition(`a"b\\c.pdf`);
    expect(header).toContain(`filename="a_b_c.pdf"`);
  });

  it("RFC 5987 특수문자(' ( ) *)도 %-escape 한다", () => {
    const header = attachmentContentDisposition("file(1)'*.pdf");
    expect(header).toContain("%281%29");
    expect(header).toContain("%27");
    expect(header).toContain("%2A");
  });
});
