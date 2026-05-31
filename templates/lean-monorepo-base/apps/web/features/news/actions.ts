// news 도메인 Server Actions — 얇은 진입점 (1차에서는 공개 사이트 mutation 없음)
"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

export type ActionResult<T, Input = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError<Input> };

// 공개 사이트는 1차 mutation 없음 — v1.1 익명 좋아요 도입 시 활성화 슬롯
// (admin 앱은 features/news/actions.ts 에 별도 mutation 가짐)

// 캐시 무효화 헬퍼 — admin 측 mutation 후 web 측에서도 사용 가능하도록 export
export async function revalidateNewsPaths(): Promise<ActionResult<null>> {
  revalidatePath("/news");
  revalidatePath("/news/[slug]", "page");
  return { success: true, data: null };
}
