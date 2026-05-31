// 어드민 사용자 테이블 — Credentials 인증 (bcrypt 해시 password_hash), 1차 super 단일 계정 운영 (lean v1.0)
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 16, enum: ["super", "editor", "viewer"] })
    .notNull()
    .default("super"),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
