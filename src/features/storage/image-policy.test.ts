// 이미지 정책 순수 로직 회귀 테스트 — 리사이즈 목표 치수 계산과 벤더 영문 에러의 한국어 번역 (ADR-046)
// 실제 인코딩(canvas.toBlob)은 vitest environment: "node" 라 여기서 못 돈다 → 실측으로 검증 (plan 참조)
import { describe, expect, it } from "vitest";

import {
  MAX_IMAGE_EDGE_PX,
  MAX_IMAGES_PER_UPLOAD,
  MAX_SOURCE_IMAGE_BYTES,
  fitWithinMaxEdge,
  isAllowedImageMime,
  toKoreanUploadError,
} from "./image-policy";

const MB = 1024 * 1024;

describe("isAllowedImageMime", () => {
  it("JPG/PNG/WEBP 만 허용한다", () => {
    expect(isAllowedImageMime("image/jpeg")).toBe(true);
    expect(isAllowedImageMime("image/png")).toBe(true);
    expect(isAllowedImageMime("image/webp")).toBe(true);
  });

  it("그 외 형식은 거부한다", () => {
    expect(isAllowedImageMime("image/gif")).toBe(false);
    expect(isAllowedImageMime("image/svg+xml")).toBe(false);
    expect(isAllowedImageMime("image/heic")).toBe(false);
    expect(isAllowedImageMime("application/pdf")).toBe(false);
  });
});

describe("fitWithinMaxEdge", () => {
  it("상한 이하면 원본 치수를 그대로 둔다", () => {
    expect(fitWithinMaxEdge(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("긴 변이 정확히 상한이면 축소하지 않는다", () => {
    expect(fitWithinMaxEdge(MAX_IMAGE_EDGE_PX, 100)).toEqual({
      width: MAX_IMAGE_EDGE_PX,
      height: 100,
    });
  });

  it("가로가 긴 사진의 긴 변을 상한으로 맞추고 비율을 보존한다", () => {
    // 4000×3000 (4:3) — 흔한 스마트폰 원본
    const { width, height } = fitWithinMaxEdge(4000, 3000);
    expect(width).toBe(MAX_IMAGE_EDGE_PX);
    expect(width / height).toBeCloseTo(4000 / 3000, 2);
  });

  it("세로가 긴 사진도 긴 변(높이) 기준으로 축소한다", () => {
    const { width, height } = fitWithinMaxEdge(3000, 4000);
    expect(height).toBe(MAX_IMAGE_EDGE_PX);
    expect(width / height).toBeCloseTo(3000 / 4000, 2);
  });

  it("극단적으로 가늘고 긴 이미지도 짧은 변이 0 이 되지 않는다", () => {
    // 반올림이 0 으로 떨어지면 canvas.width = 0 → 인코딩 실패
    const { width, height } = fitWithinMaxEdge(100_000, 1);
    expect(width).toBe(MAX_IMAGE_EDGE_PX);
    expect(height).toBeGreaterThanOrEqual(1);
  });

  it("maxEdge 를 직접 넘기면 그 값을 따른다", () => {
    expect(fitWithinMaxEdge(1000, 500, 100)).toEqual({ width: 100, height: 50 });
  });
});

describe("toKoreanUploadError", () => {
  it("벤더의 영문 '사이즈 초과' 를 원본 상한이 담긴 한국어로 바꾼다", () => {
    const msg = toKoreanUploadError(
      new Error("File size exceeds maximum allowed (30MB)"),
    );
    expect(msg).toContain(`${MAX_SOURCE_IMAGE_BYTES / MB}MB`);
    expect(msg).not.toMatch(/File size/);
  });

  it("벤더의 영문 '장수 초과' 를 한국어로 바꾼다", () => {
    const msg = toKoreanUploadError(
      new Error(`Maximum ${MAX_IMAGES_PER_UPLOAD} files allowed`),
    );
    expect(msg).toContain(`${MAX_IMAGES_PER_UPLOAD}장`);
    expect(msg).not.toMatch(/Maximum/);
  });

  it("벤더의 '파일 없음' 을 한국어로 바꾼다", () => {
    expect(toKoreanUploadError(new Error("No file selected"))).toBe(
      "선택된 파일이 없습니다.",
    );
    expect(toKoreanUploadError(new Error("No files to upload"))).toBe(
      "선택된 파일이 없습니다.",
    );
  });

  it("우리 코드가 던진 한국어 메시지는 그대로 통과시킨다", () => {
    const ours = "이미지 용량이 5MB 를 초과합니다 (8234KB)";
    expect(toKoreanUploadError(new Error(ours))).toBe(ours);
  });

  it("매칭되지 않는 영문은 원문을 남긴다 — 침묵보다 낫다", () => {
    expect(toKoreanUploadError(new Error("Upload failed: No URL returned"))).toBe(
      "Upload failed: No URL returned",
    );
  });

  it("Error 가 아닌 값도 문자열로 다룬다", () => {
    expect(toKoreanUploadError("네트워크 오류")).toBe("네트워크 오류");
  });
});
