// createPresignedUpload 입력 가드 회귀 테스트 — MIME/사이즈 위반은 presign 발급 전 차단 (R2 PUT 은 POST policy content-length-range 불가, 서버 사전검증이 유일 강제점)
import { describe, expect, it } from "vitest";

import {
  createPresignedUpload,
  isAllowedImageMime,
  MAX_IMAGE_BYTES,
} from "./upload";

const scope = { tempId: "abc" } as const;

describe("isAllowedImageMime", () => {
  it("JPG/PNG/WEBP 만 허용한다", () => {
    expect(isAllowedImageMime("image/jpeg")).toBe(true);
    expect(isAllowedImageMime("image/png")).toBe(true);
    expect(isAllowedImageMime("image/webp")).toBe(true);
  });

  it("그 외 형식은 거부한다", () => {
    expect(isAllowedImageMime("image/gif")).toBe(false);
    expect(isAllowedImageMime("image/svg+xml")).toBe(false);
    expect(isAllowedImageMime("application/pdf")).toBe(false);
  });
});

describe("createPresignedUpload 입력 가드", () => {
  it("허용되지 않은 MIME 은 presign 발급 전에 throw 한다", async () => {
    await expect(
      createPresignedUpload({
        scope,
        filename: "a.gif",
        mime: "image/gif",
        size: 1024,
      }),
    ).rejects.toThrow(/Unsupported MIME/);
  });

  it("5MB 초과는 throw 한다", async () => {
    await expect(
      createPresignedUpload({
        scope,
        filename: "big.png",
        mime: "image/png",
        size: MAX_IMAGE_BYTES + 1,
      }),
    ).rejects.toThrow(/out of range/);
  });

  it("0 바이트는 throw 한다", async () => {
    await expect(
      createPresignedUpload({
        scope,
        filename: "empty.png",
        mime: "image/png",
        size: 0,
      }),
    ).rejects.toThrow(/out of range/);
  });
});
