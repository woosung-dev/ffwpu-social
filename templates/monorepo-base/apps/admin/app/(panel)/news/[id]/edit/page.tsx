// 어드민 소식 수정 — params Promise (Next.js 16) · features 의 NewsForm + updateNews 연결
import Link from 'next/link';
import { Button } from '@myorg/ui-base/components/button';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">소식 수정</h1>
        <Button asChild variant="outline">
          <Link href="/news">목록으로</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        ID: <code>{id}</code> — <code>@myorg/features/news</code> 의{' '}
        <code>getNewsById(id)</code> 로 초기값을 채우고 <code>updateNews</code> 서버 액션과
        연결하세요.
      </p>
    </div>
  );
}
