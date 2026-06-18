// KPI Server Actions — 얇은 진입점. auth-guard + Zod safeParse + service 위임 + revalidatePath
"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/auth-guards";
import { type ActionResult, toActionError } from "@/lib/action-result";
import { updateKpis, updateStoryStats, updateStorySectionText } from "./service";
import {
  kpiUpdateInputSchema,
  storyStatsUpdateInputSchema,
  storyTextUpdateSchema,
  type KpiUpdateInput,
  type StoryStatsUpdateInput,
  type StoryTextUpdateInput,
} from "./schemas";

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

export async function updateStoryStatsAction(
  input: StoryStatsUpdateInput,
): Promise<ActionResult<{ updatedCount: number }, StoryStatsUpdateInput>> {
  try {
    await requireSuperAdmin();
    const parsed = storyStatsUpdateInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    const updated = await updateStoryStats(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/landing");
    return { success: true, data: { updatedCount: updated.length } };
  } catch (e) {
    return toActionError(e, "storyStatsAction");
  }
}

export async function updateStorySectionTextAction(
  input: StoryTextUpdateInput,
): Promise<ActionResult<{ updatedCount: number }, StoryTextUpdateInput>> {
  try {
    await requireSuperAdmin();
    const parsed = storyTextUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    const updated = await updateStorySectionText(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/landing");
    return { success: true, data: { updatedCount: updated.length } };
  } catch (e) {
    return toActionError(e, "storyTextAction");
  }
}
