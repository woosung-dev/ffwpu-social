// 홈 팝업 입력을 클라이언트와 서버에서 공통 검증하는 순수 Zod 스키마다.
import { z } from "zod";

// refine 전 단계 객체 — Zod v4 는 refine 붙은 객체에 pick/omit 을 허용하지 않아(런타임 throw) 폼 파생용으로 분리
const popupObjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "팝업 제목을 입력해주세요.")
      .max(100, "팝업 제목은 100자 이내로 입력해주세요."),
    imageUrl: z.url("이미지를 업로드해주세요."),
    imageWidth: z.number().int().positive().nullable().optional(),
    imageHeight: z.number().int().positive().nullable().optional(),
    linkUrl: z
      .string()
      .trim()
      .max(500, "링크 주소는 500자 이내로 입력해주세요.")
      .nullable()
      .optional()
      .transform((value) => value || null)
      .refine((value) => value === null || value.startsWith("/") || value.startsWith("https://"), {
        message: "링크 주소는 /로 시작하는 내부 경로 또는 https:// URL이어야 합니다.",
      }),
    startsAt: z.date(),
    endsAt: z.date().nullable().optional().transform((value) => value ?? null),
    isActive: z.boolean().default(true),
  });

export const popupInputSchema = popupObjectSchema.refine(
  (value) => value.endsAt === null || value.endsAt > value.startsAt,
  {
    message: "종료일은 시작일 이후여야 합니다.",
    path: ["endsAt"],
  },
);

// 어드민 에디터 RHF 전용 — 단순 텍스트 필드만 (이미지·기간·활성은 useState 관리)
export const popupFormSchema = popupObjectSchema.pick({
  title: true,
  linkUrl: true,
});

export type PopupInput = z.infer<typeof popupInputSchema>;
