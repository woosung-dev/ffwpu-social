// 어드민 소식 목록 — features/news queries 로 위임 (placeholder, 실제 쿼리는 features 패키지)
import Link from 'next/link';
import { Button } from '@myorg/ui-base/components/button';
import { Card, CardContent } from '@myorg/ui-base/components/card';

export default function NewsListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">소식 관리</h1>
        <Button asChild>
          <Link href="/news/new">새 글 작성</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            아직 글이 없습니다. <code>@myorg/features/news</code> 의 <code>listNews()</code> 쿼리로
            실제 목록을 채우세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
