// 어드민 사용자 테이블 — Credentials super 1명 한정, bcrypt 해시 저장 (평문 금지)
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  // bcryptjs 해시 — 평문 비밀번호 저장 금지 (security 규칙)
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }),
  role: varchar("role", { length: 32 }).notNull().default("super"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
