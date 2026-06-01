// KPI Server Actions — 얇은 진입점. auth-guard + Zod safeParse + service 위임 + revalidatePath
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSuperAdmin } from "@/lib/auth-guards";
import { updateKpis } from "./service";
import { kpiUpdateInputSchema, type KpiUpdateInput } from "./schemas";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError<KpiUpdateInput> };

export async function updateKpisAction(
  input: KpiUpdateInput,
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    await requireSuperAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = kpiUpdateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  try {
    const updated = await updateKpis(parsed.data);
    // 사용자 사이트 메인 / 와 어드민 미리보기 모두 revalidate
    revalidatePath("/");
    revalidatePath("/admin/kpi");
    return { success: true, data: { updatedCount: updated.length } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "KPI 업데이트 실패";
    return { success: false, error: msg };
  }
}
