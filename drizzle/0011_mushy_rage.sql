ALTER TABLE "kpi_metrics" ADD COLUMN "sync_source" text;--> statement-breakpoint
ALTER TABLE "kpi_metrics" ADD COLUMN "last_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "kpi_metrics" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "kpi_metrics" ADD CONSTRAINT "kpi_metrics_sync_source_check" CHECK ("kpi_metrics"."sync_source" in ('manual', 'google_sheets'));