// 관리자 계정 DB 레이어 — users 테이블 직접 접근. service 만 호출 (3-Layer). passwordHash 는 목록 select 에서 제외 (직렬화 누출 차단)
import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// 계정 목록 — passwordHash 절대 미포함
export async function listAccounts() {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));
}

export async function findByEmail(email: string) {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return row ?? null;
}

export async function findById(id: string, txOrDb: typeof db | Tx = db) {
  const [row] = await txOrDb
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

// super 행을 FOR UPDATE 로 잠그고 수를 센다 — 마지막 super 삭제 동시성(TOCTOU) 차단.
// 동시 삭제 트랜잭션은 이 잠금에서 직렬화 → 두 번째 트랜잭션은 첫 커밋 후 갱신된 count(=1)를 보고 차단됨. 반드시 트랜잭션 내 호출.
export async function lockAndCountSupers(tx: Tx) {
  const rows = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "super"))
    .for("update");
  return rows.length;
}

// 생성 — role 은 항상 super (서버 고정). email 은 정규화된 값 전달
export async function insertAccount(
  tx: Tx,
  data: { email: string; name: string; passwordHash: string },
) {
  const [row] = await tx
    .insert(users)
    .values({ ...data, role: "super" })
    .returning({ id: users.id, email: users.email, name: users.name });
  return row;
}

export async function updatePasswordHash(
  tx: Tx,
  userId: string,
  passwordHash: string,
) {
  const [row] = await tx
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId))
    .returning({ id: users.id });
  return row ?? null;
}

export async function deleteAccount(tx: Tx, userId: string) {
  const [row] = await tx
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id });
  return row ?? null;
}

// Postgres unique 위반 (동시 생성 race) 판별 — 23505
export function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "23505"
  );
}
