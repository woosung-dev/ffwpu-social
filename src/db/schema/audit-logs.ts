// 어드민 변경 이력 — 개인정보 민감 영역 대응 (ADR-002, 의도서 §7.3)
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  entity: text("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action", { enum: ["create", "update", "delete", "publish"] }).notNull(),
  diff: jsonb("diff"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
