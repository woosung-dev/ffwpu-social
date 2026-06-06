// buildPresignedPostBody 회귀 테스트 — Content-Type 중복으로 인한 MinIO POST 403 재발 방지
import { describe, expect, it } from "vitest";

import { buildPresignedPostBody } from "./presigned-upload";

describe("buildPresignedPostBody", () => {
  const fields = {
    "Content-Type": "image/png",
    key: "news/abc/xyz.png",
    Policy: "base64policy",
    "X-Amz-Signature": "sig",
  };
  const file = new File([new Uint8Array([1, 2, 3])], "a.png", {
    type: "image/png",
  });

  it("Content-Type 을 중복 추가하지 않는다 (presign fields 의 1개만) — POST policy eq 위반 방지", () => {
    const fd = buildPresignedPostBody(fields, file);
    // 버그: 과거 fd.append('Content-Type', file.type) 중복 → [image/png, image/png] → 403
    expect(fd.getAll("Content-Type")).toEqual(["image/png"]);
  });

  it("presign fields 를 모두 포함하고 file 을 마지막에 추가한다", () => {
    const fd = buildPresignedPostBody(fields, file);
    expect(fd.get("key")).toBe("news/abc/xyz.png");
    expect(fd.get("Policy")).toBe("base64policy");
    expect(fd.get("X-Amz-Signature")).toBe("sig");
    expect(fd.get("file")).toBeInstanceOf(File);
    // file 이 마지막 (S3 POST 규약) — 키 순서상 file 이 끝
    expect([...fd.keys()].at(-1)).toBe("file");
  });
});
