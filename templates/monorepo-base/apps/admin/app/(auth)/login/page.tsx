// 어드민 로그인 페이지 — Credentials 입력 폼 (서버 액션으로 signIn 호출)
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn, auth } from '../../../auth';
import { Button } from '@myorg/ui-base/components/button';
import { Input } from '@myorg/ui-base/components/input';
import { Label } from '@myorg/ui-base/components/label';
import { Card, CardContent, CardHeader, CardTitle } from '@myorg/ui-base/components/card';

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

async function loginAction(formData: FormData): Promise<void> {
  'use server';

  const callbackUrl = (formData.get('callbackUrl') as string) || '/dashboard';

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=${error.type}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (session) redirect('/dashboard');

  const { callbackUrl = '/dashboard', error } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>운영자 로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              로그인 실패. 이메일·비밀번호를 확인하세요.
            </p>
          )}

          <Button type="submit" className="w-full">
            로그인
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
