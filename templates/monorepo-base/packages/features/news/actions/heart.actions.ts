// 익명 좋아요 토글 서버 액션 — 인증 불필요, sessionId 만으로 동작
"use server";

import { revalidatePath } from "next/cache";
import * as heartService from "../service/heart.service";
import { heartToggleSchema } from "../schemas";
import { fail, ok } from "./result";

export async function toggleHeartAction(input: unknown) {
  const parsed = heartToggleSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.message);
  try {
    const result = await heartService.toggle(parsed.data);
    // 상세 페이지 카운트 즉시 반영 (slug 모를 수 있어 /news 만 일괄)
    revalidatePath("/news");
    return ok(result);
  } catch (err) {
    return fail("HEART_FAILED", (err as Error).message);
  }
}
