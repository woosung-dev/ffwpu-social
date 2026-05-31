// 어드민 로그인 페이지 - Credentials 폼 + signIn server action
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const { from, error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    await signIn("credentials", {
      email,
      password,
      redirectTo: from ?? "/dashboard",
    });
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[var(--color-surface)] p-6">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-lg border bg-[var(--color-bg)] p-8 shadow-sm"
      >
        <header className="space-y-1">
          <h1 className="text-xl font-semibold">Sow Good 어드민</h1>
          <p className="text-sm text-[var(--color-text-muted)]">사회공헌국 운영 콘솔</p>
        </header>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            이메일
          </label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            비밀번호
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <p className="text-sm text-[var(--color-danger)]">
            로그인 실패: 이메일 또는 비밀번호를 확인하세요.
          </p>
        ) : null}

        <Button type="submit" className="w-full">
          로그인
        </Button>
      </form>
    </main>
  );
}
