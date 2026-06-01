// 관리자 계정 스키마·이메일 정규화 단위 테스트 — C1.2(비번 규칙·일치) / C1.6(정규화) 자동 검증
import { describe, expect, it } from "vitest";

import {
  normalizeEmail,
  createAccountSchema,
  createAccountFormSchema,
} from "./schemas";

describe("normalizeEmail", () => {
  it("앞뒤 공백 제거 + 소문자화", () => {
    expect(normalizeEmail("  Admin@FFWPU.Local  ")).toBe("admin@ffwpu.local");
  });
  it("이미 정규화된 값은 그대로", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });
});

describe("createAccountSchema", () => {
  const valid = {
    email: "New@Example.COM",
    name: "운영자",
    password: "abcd123456",
  };

  it("유효 입력 통과 + 이메일 정규화(소문자) 적용", () => {
    const parsed = createAccountSchema.parse(valid);
    expect(parsed.email).toBe("new@example.com"); // C1.6 — 저장 전 정규화
  });

  it("잘못된 이메일 형식 거부", () => {
    expect(createAccountSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("비밀번호 10자 미만 거부 (C1.2)", () => {
    expect(createAccountSchema.safeParse({ ...valid, password: "abc12" }).success).toBe(false);
  });

  it("영문 없는 비밀번호 거부", () => {
    expect(createAccountSchema.safeParse({ ...valid, password: "1234567890" }).success).toBe(false);
  });

  it("숫자 없는 비밀번호 거부", () => {
    expect(createAccountSchema.safeParse({ ...valid, password: "abcdefghij" }).success).toBe(false);
  });

  it("72바이트 초과(멀티바이트) 비밀번호 거부 — bcrypt 트런케이션 방지", () => {
    // 한글 24자 = 72바이트 + 영문/숫자 → 72바이트 초과
    const longKorean = "가".repeat(24) + "a1";
    expect(createAccountSchema.safeParse({ ...valid, password: longKorean }).success).toBe(false);
  });

  it("role 은 입력으로 받지 않음 — 객체에 role 을 넣어도 파싱 결과에 없음 (권한 상승 차단)", () => {
    const parsed = createAccountSchema.parse({ ...valid, role: "viewer" } as never);
    expect("role" in parsed).toBe(false);
  });
});

describe("createAccountFormSchema (passwordConfirm)", () => {
  const base = {
    email: "user@example.com",
    name: "운영자",
    password: "abcd123456",
  };

  it("비밀번호 불일치 거부 + passwordConfirm 경로 에러 (C1.2)", () => {
    const result = createAccountFormSchema.safeParse({
      ...base,
      passwordConfirm: "different99",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("passwordConfirm"))).toBe(true);
    }
  });

  it("비밀번호 일치 통과", () => {
    expect(
      createAccountFormSchema.safeParse({ ...base, passwordConfirm: base.password }).success,
    ).toBe(true);
  });
});
