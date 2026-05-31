// categories 테이블 DAL — slug immutable, hard delete 금지(is_active 토글)
import { db, schema } from "@myorg/db";
import { and, asc, eq } from "drizzle-orm";
import type { CategoryCreateInput, CategoryRow, CategoryUpdateInput } from "../schemas";

const { categories } = schema;

export async function findBySlug(slug: string): Promise<CategoryRow | null> {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return (row as CategoryRow | undefined) ?? null;
}

export async function findById(id: string): Promise<CategoryRow | null> {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return (row as CategoryRow | undefined) ?? null;
}

export async function listActive(): Promise<CategoryRow[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  return rows as CategoryRow[];
}

export async function listAll(): Promise<CategoryRow[]> {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  return rows as CategoryRow[];
}

export async function create(input: CategoryCreateInput): Promise<CategoryRow> {
  const [row] = await db.insert(categories).values(input).returning();
  return row as CategoryRow;
}

export async function update(input: CategoryUpdateInput): Promise<CategoryRow | null> {
  const { id, ...patch } = input;
  const [row] = await db
    .update(categories)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return (row as CategoryRow | undefined) ?? null;
}

// hard delete 금지 — is_active 토글로만 비활성화
export async function deactivate(id: string): Promise<void> {
  await db
    .update(categories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(categories.id, id), eq(categories.isActive, true)));
}
