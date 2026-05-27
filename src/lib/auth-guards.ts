// 어드민 Server Action / Route Handler 인증·권한 가드 helper — auth + super role 일원화 (codex P1#1+#2)
import type { Session } from "next-auth";
import { auth } from "@/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type SuperAdminSession = Session & {
  user: NonNullable<Session["user"]> & { id: string; role: "super" };
};

// super role 가드. 미인증 → UnauthorizedError, super 아님 → ForbiddenError.
// 호출자는 Server Action 첫 줄에 호출. try/catch 로 ActionResult 변환.
export async function requireSuperAdmin(): Promise<SuperAdminSession> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  if (session.user.role !== "super") {
    throw new ForbiddenError();
  }
  return session as SuperAdminSession;
}
