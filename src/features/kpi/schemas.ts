// KPI Zod 스키마 — 어드민 4 카드 폼 검증. slug immutable (PK), 4 row 한정 (PR B kpi_metrics 5 row 중 활성 4)
import { z } from "zod";

export const kpiUpdateRowSchema = z.object({
  slug: z.string().min(1).max(50),
  label: z.string().min(1, "라벨을 입력해주세요").max(50),
  // 정렬·차트용 수치 — 기간 같은 비숫자 (38년 5개월) 는 null
  value: z.number().int().min(0).max(99_999_999).nullable(),
  displayValue: z
    .string()
    .min(1, "표시 값을 입력해주세요")
    .max(50),
  unit: z.string().max(10).nullable(),
});

export type KpiUpdateRow = z.infer<typeof kpiUpdateRowSchema>;

// 폼 전체 — 4 row 일괄 입력
export const kpiUpdateInputSchema = z.object({
  rows: z.array(kpiUpdateRowSchema).min(1).max(20),
});

export type KpiUpdateInput = z.infer<typeof kpiUpdateInputSchema>;
