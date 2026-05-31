// 익명 좋아요 토글 스키마 — sessionId(localStorage UUID) 1회 토글, IP 미수집
import { z } from "zod";

export const heartToggleSchema = z.object({
  newsId: z.string().uuid(),
  sessionId: z.uuid("sessionId 는 클라이언트가 localStorage 에 저장한 UUID"),
});
export type HeartToggleInput = z.infer<typeof heartToggleSchema>;

export const heartResultSchema = z.object({
  liked: z.boolean(),
  heartCount: z.number().int().min(0),
});
export type HeartResult = z.infer<typeof heartResultSchema>;
