ALTER TABLE "kpi_metrics" ADD COLUMN "sublabel" text;
--> statement-breakpoint
-- 가정수 카드 라벨/서브라벨 변경(사회공헌국 요청): 도움을 주게 된 가정 수 → 행복응원 가정수 + (지원가정)
UPDATE "kpi_metrics" SET "label" = '행복응원 가정수', "sublabel" = '지원가정' WHERE "slug" = 'helped_household_count';