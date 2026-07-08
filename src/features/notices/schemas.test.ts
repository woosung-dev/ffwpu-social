// 공지 스키마 회귀 테스트 — body JSON 문자열 파싱·첨부 상한·목록 쿼리 기본값·상위 고정 정렬 입력
import { describe, expect, it } from "vitest";

import {
  MAX_PINNED_NOTICES,
  listNoticesQuerySchema,
  noticeInputSchema,
  setNoticePinOrderInputSchema,
} from "./schemas";

// 고정 순서 입력 테스트용 uuid 풀 (MAX + 여유분)
const UUIDS = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
];

const validBody = JSON.stringify({ type: "doc", content: [] });

function attachment(n: number) {
  return {
    fileName: `파일-${n}.pdf`,
    key: `notices/n1/attachments/${n}.pdf`,
    mime: "application/pdf",
    size: 1024,
  };
}

describe("noticeInputSchema", () => {
  it("정상 입력을 파싱하고 body 문자열을 객체로 변환한다", () => {
    const r = noticeInputSchema.safeParse({
      title: "7월 공지",
      body: validBody,
      publishedAt: new Date(),
      attachments: [attachment(1)],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.body).toEqual({ type: "doc", content: [] });
      expect(r.data.attachments).toHaveLength(1);
    }
  });

  it("attachments 미전달 시 빈 배열 기본값", () => {
    const r = noticeInputSchema.safeParse({ title: "t", body: validBody });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.attachments).toEqual([]);
  });

  it("body 가 JSON 이 아니면 한국어 메시지로 실패한다", () => {
    const r = noticeInputSchema.safeParse({ title: "t", body: "{broken" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe("본문 형식이 올바르지 않습니다.");
    }
  });

  it("첨부 6개는 거부한다", () => {
    const r = noticeInputSchema.safeParse({
      title: "t",
      body: validBody,
      attachments: [1, 2, 3, 4, 5, 6].map(attachment),
    });
    expect(r.success).toBe(false);
  });

  it("빈 제목은 거부한다", () => {
    const r = noticeInputSchema.safeParse({ title: "", body: validBody });
    expect(r.success).toBe(false);
  });
});

describe("listNoticesQuerySchema", () => {
  it("미지정 시 page 1 / limit 10", () => {
    const r = listNoticesQuerySchema.parse({});
    expect(r).toEqual({ page: 1, limit: 10 });
  });

  it("문자열 쿼리 파라미터를 숫자로 강제한다", () => {
    const r = listNoticesQuerySchema.parse({ page: "3" });
    expect(r.page).toBe(3);
  });

  it("0·음수 page 는 거부한다", () => {
    expect(listNoticesQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(listNoticesQuerySchema.safeParse({ page: "-1" }).success).toBe(false);
  });
});

describe("setNoticePinOrderInputSchema", () => {
  it("최대 개수 이내의 고유 uuid 배열을 통과시킨다", () => {
    const r = setNoticePinOrderInputSchema.safeParse({
      orderedNoticeIds: UUIDS.slice(0, MAX_PINNED_NOTICES),
    });
    expect(r.success).toBe(true);
  });

  it("빈 배열(전체 고정 해제)을 허용한다", () => {
    const r = setNoticePinOrderInputSchema.safeParse({ orderedNoticeIds: [] });
    expect(r.success).toBe(true);
  });

  it("최대 개수를 초과하면 거부한다", () => {
    const r = setNoticePinOrderInputSchema.safeParse({
      orderedNoticeIds: UUIDS.slice(0, MAX_PINNED_NOTICES + 1),
    });
    expect(r.success).toBe(false);
  });

  it("중복 uuid 는 거부한다", () => {
    const r = setNoticePinOrderInputSchema.safeParse({
      orderedNoticeIds: [UUIDS[0], UUIDS[0]],
    });
    expect(r.success).toBe(false);
  });

  it("uuid 형식이 아니면 거부한다", () => {
    const r = setNoticePinOrderInputSchema.safeParse({
      orderedNoticeIds: ["not-a-uuid"],
    });
    expect(r.success).toBe(false);
  });
});
