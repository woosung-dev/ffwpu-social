// 공지사항(notices) Zod 스키마 — 순수 Zod (drizzle-zod 미사용). Client Component 도 import 안전 (ADR-042)
import { z } from "zod";
import {
  MAX_ATTACHMENTS_PER_NOTICE,
  MAX_ATTACHMENT_BYTES,
} from "@/features/storage/attachment-policy";

// 업로드 완료된 첨부 메타 — key 의 소유 prefix 검증은 service 가 담당 (위조 차단)
export const noticeAttachmentInputSchema = z.object({
  fileName: z
    .string()
    .min(1, "파일명이 없습니다.")
    .max(300, "파일명은 300자 이내여야 합니다."),
  key: z.string().min(1).max(500),
  mime: z.string().min(1).max(100),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_ATTACHMENT_BYTES, "첨부파일은 개당 20MB 이하만 가능합니다."),
});

export const noticeInputSchema = z.object({
  // 한국어 검증 메시지 — 미지정 시 Zod v4 영문 기본 메시지가 사용자에게 노출됨(anti-slop §4)
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(200, "제목은 200자 이내로 입력해주세요."),
  // 클라가 JSON.stringify 로 전송 → 서버 parse. 객체 전송 시 Server Action 직렬화(React Flight)에서
  // 중첩 attrs 가 temporary reference($T)로 소실됨(Next16 cacheComponents). news 동일 (PR #34)
  body: z.string().transform((s, ctx): unknown => {
    try {
      return JSON.parse(s);
    } catch {
      ctx.addIssue({ code: "custom", message: "본문 형식이 올바르지 않습니다." });
      return z.NEVER;
    }
  }),
  // 발행일 — null = 임시저장, 과거·현재 = 발행, 미래 = 예약 발행 (news 동일 시맨틱)
  publishedAt: z.date().nullable().optional(),
  attachments: z
    .array(noticeAttachmentInputSchema)
    .max(
      MAX_ATTACHMENTS_PER_NOTICE,
      `첨부파일은 최대 ${MAX_ATTACHMENTS_PER_NOTICE}개까지 가능합니다.`,
    )
    .default([]),
});

export type NoticeInput = z.infer<typeof noticeInputSchema>;
export type NoticeAttachmentInput = z.infer<typeof noticeAttachmentInputSchema>;

// 공개 목록 조회 — 검색·정렬 없음(페이지네이션만). limit 기본값은 Figma 목록 행수 기준
export const listNoticesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListNoticesQuery = z.infer<typeof listNoticesQuerySchema>;

// 상위 고정 최대 개수 — 목록 상단 과점유 방지. Client(NoticePinOrderManager)·Server(action) 단일 출처
export const MAX_PINNED_NOTICES = 3;

// 상위 고정 순서 저장 입력 — 발행 공지 uuid 배열, 최대 N개·중복 불가 (news setHeroOrderInputSchema 동일)
export const setNoticePinOrderInputSchema = z
  .object({
    orderedNoticeIds: z
      .array(z.uuid())
      .max(
        MAX_PINNED_NOTICES,
        `상위 고정은 최대 ${MAX_PINNED_NOTICES}개까지 지정할 수 있습니다.`,
      ),
  })
  .refine((v) => new Set(v.orderedNoticeIds).size === v.orderedNoticeIds.length, {
    message: "중복된 공지가 포함되어 있습니다.",
  });

export type SetNoticePinOrderInput = z.infer<typeof setNoticePinOrderInputSchema>;
