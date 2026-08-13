// 랜딩 전역 설정 Server Actions — 얇은 진입점. Zod 검증 + super 가드 + service 위임 (fullstack.md §3·§5)
"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/auth-guards";
import { type ActionResult, toActionError } from "@/lib/action-result";
import * as landingService from "./service";
import { featuredVisibleCountSchema } from "./schemas";

// 랜딩 하단 카드 노출 개수 저장 (ADR-054). 슬롯 지정과 별개 — 지정은 12칸까지, 화면 노출은 여기서 정한 수만큼
export async function setFeaturedVisibleCountAction(
  count: number,
): Promise<ActionResult<{ featuredVisibleCount: number }>> {
  try {
    await requireSuperAdmin();
    const parsed = featuredVisibleCountSchema.safeParse(count);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    const saved = await landingService.updateFeaturedVisibleCount(parsed.data);
    // 카드 수가 바뀌므로 공개 홈 + 슬롯 편집 화면 동시 무효화
    revalidatePath("/");
    revalidatePath("/admin/main-story");
    return { success: true, data: { featuredVisibleCount: saved } };
  } catch (e) {
    return toActionError(e, "landingAction");
  }
}
