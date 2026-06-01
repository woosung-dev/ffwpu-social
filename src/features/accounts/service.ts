// 관리자 계정 service — 비즈니스 로직 (bcrypt 해싱·삭제 가드). db import 은 transaction 조율용만
import "server-only";

import bcrypt from "bcryptjs";

import { db } from "@/db";
import * as accountDb from "./db";
import type { CreateAccountInput, ResetPasswordInput } from "./schemas";

const BCRYPT_COST = 10; // seed/auth 와 동일

export async function listAccounts() {
  return accountDb.listAccounts();
}

// 결과는 discriminated union — 액션이 친절 메시지로 변환
export async function createAccount(input: CreateAccountInput) {
  const existing = await accountDb.findByEmail(input.email);
  if (existing) return { kind: "email_taken" as const };

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  try {
    const account = await db.transaction((tx) =>
      accountDb.insertAccount(tx, {
        email: input.email,
        name: input.name,
        passwordHash,
      }),
    );
    return { kind: "ok" as const, account };
  } catch (e) {
    // 동시 생성 race — unique 제약(23505)을 친절 에러로 변환 (500 노출 금지)
    if (accountDb.isUniqueViolation(e)) return { kind: "email_taken" as const };
    throw e;
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const updated = await db.transaction((tx) =>
    accountDb.updatePasswordHash(tx, input.userId, passwordHash),
  );
  return updated; // null = not found
}

// actorUserId 는 서버 auth() 에서만 (클라이언트 전달 금지). 본인·마지막 super 삭제 차단
export async function deleteAccount(userId: string, actorUserId: string) {
  if (userId === actorUserId) return { kind: "self_delete" as const };
  return db.transaction(async (tx) => {
    const target = await accountDb.findById(userId, tx);
    if (!target) return { kind: "not_found" as const };
    // 마지막 super 가드 — super 행을 FOR UPDATE 로 잠근 뒤 count (동시 삭제 race 직렬화, TOCTOU 차단).
    // 대상이 super 일 때만 적용 — 비-super 삭제는 super 수에 영향 없음
    const supers = await accountDb.lockAndCountSupers(tx);
    if (target.role === "super" && supers <= 1) {
      return { kind: "last_super" as const };
    }
    const deleted = await accountDb.deleteAccount(tx, userId);
    return deleted ? { kind: "ok" as const } : { kind: "not_found" as const };
  });
}
