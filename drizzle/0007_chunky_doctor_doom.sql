CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_id" uuid,
	"session_id" text NOT NULL,
	"event_type" text NOT NULL,
	"path" text,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"user_agent_family" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_news_created_idx" ON "analytics_events" USING btree ("news_id","created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_type_created_idx" ON "analytics_events" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_session_created_idx" ON "analytics_events" USING btree ("session_id","created_at");