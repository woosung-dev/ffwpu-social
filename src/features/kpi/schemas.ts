// KPI Zod 스키마 — 어드민 4 카드 폼 검증. slug immutable (PK), 4 row 한정 (PR B kpi_metrics 5 row 중 활성 4)
import { z } from "zod";

export const kpiUpdateRowSchema = z.object({
  slug: z.string().min(1).max(50),
  label: z.string().min(1, "라벨을 입력해주세요").max(50),
  // 라벨 아래 작은 보조 라벨 "지원가정" — 선택. 생략(undefined) 시 미변경(StoryStatsEditor 등 호환)
  sublabel: z.string().max(20).nullable().optional(),
  // 표시 주도 수치 — 소수(529.4) 허용. 비숫자(38년 5개월)는 null + displayValue 사용
  value: z.number().min(0).max(99_999_999).nullable(),
  // 표시 override(선택) — 비우면 value+unit 자동. 특수 표기만 직접 입력
  displayValue: z.string().max(50),
  unit: z.string().max(10).nullable(),
});

export type KpiUpdateRow = z.infer<typeof kpiUpdateRowSchema>;

// 폼 전체 — 4 row 일괄 입력
export const kpiUpdateInputSchema = z.object({
  rows: z.array(kpiUpdateRowSchema).min(1).max(20),
});

export type KpiUpdateInput = z.infer<typeof kpiUpdateInputSchema>;

// StorySection 통계 — impact 와 같은 숫자 우선 모델(ADR-058). 숫자(value)+단위로 자동 표시하고,
// displayValue 는 숫자로 못 쓰는 특수 표기용 폴백. 셋 다 비면 메인에서 숨김(impact 와 달리 빈값 허용).
export const storyStatUpdateRowSchema = z.object({
  slug: z.string().min(1).max(50),
  label: z.string().min(1, "라벨을 입력해주세요").max(50),
  displayValue: z.string().max(60),
  value: z.number().min(0).max(99_999_999).nullable().optional(),
  unit: z.string().max(10).nullable().optional(),
});

export type StoryStatUpdateRow = z.infer<typeof storyStatUpdateRowSchema>;

export const storyStatsUpdateInputSchema = z.object({
  rows: z.array(storyStatUpdateRowSchema).min(1).max(20),
});

export type StoryStatsUpdateInput = z.infer<typeof storyStatsUpdateInputSchema>;

// StorySection 카피 — 태그(1줄)·제목(여러 줄)·부제(여러 줄). 줄바꿈 \n 허용. 빈값이면 공개에서 코드 상수로 fallback
export const storyTextUpdateSchema = z.object({
  tag: z.string().trim().max(40),
  title: z.string().trim().max(120),
  subtitle: z.string().trim().max(300),
});

export type StoryTextUpdateInput = z.infer<typeof storyTextUpdateSchema>;
