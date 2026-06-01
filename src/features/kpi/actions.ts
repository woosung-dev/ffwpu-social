// KPI Server Actions — 얇은 진입점. auth-guard + Zod safeParse + service 위임 + revalidatePath
"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/auth-guards";
import { type ActionResult, toActionError } from "@/lib/action-result";
import { updateKpis } from "./service";
import { kpiUpdateInputSchema, type KpiUpdateInput } from "./schemas";

export async function updateKpisAction(
  input: KpiUpdateInput,
): Promise<ActionResult<{ updatedCount: number }, KpiUpdateInput>> {
  try {
    await requireSuperAdmin();
    const parsed = kpiUpdateInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    const updated = await updateKpis(parsed.data);
    // 사용자 사이트 메인 / 와 어드민 미리보기 모두 revalidate
    revalidatePath("/");
    revalidatePath("/admin/kpi");
    return { success: true, data: { updatedCount: updated.length } };
  } catch (e) {
    return toActionError(e, "kpiAction");
  }
}
