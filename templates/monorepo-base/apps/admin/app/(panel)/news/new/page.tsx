// 어드민 소식 생성 — features/news 의 NewsForm + createNews 서버 액션 위임
import Link from 'next/link';
import { Button } from '@myorg/ui-base/components/button';

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">새 소식 작성</h1>
        <Button asChild variant="outline">
          <Link href="/news">목록으로</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        <code>@myorg/features/news</code> 의 <code>NewsForm</code> 컴포넌트를 mode=&quot;create&quot;
        로 렌더하고 <code>createNews</code> 서버 액션과 연결하세요.
      </p>
    </div>
  );
}
