// news 도메인 UI 컴포넌트 — page.tsx 가 직접 쓰는 작은 표시용 컴포넌트 모음
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { PublicNews } from "./schemas";

type NewsCardProps = {
  item: Omit<PublicNews, "body">;
};

export function NewsCard({ item }: NewsCardProps) {
  return (
    <Link href={`/news/${item.slug}`} className="block h-full">
      <Card className="h-full p-6 transition-colors hover:bg-accent">
        <h3 className="line-clamp-2 text-lg font-semibold">{item.title}</h3>
        {item.summary && (
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
            {item.summary}
          </p>
        )}
        {item.publishedAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            {new Date(item.publishedAt).toLocaleDateString("ko-KR")}
          </p>
        )}
      </Card>
    </Link>
  );
}

export function NewsEmpty() {
  return (
    <p className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
      아직 공개된 소식이 없습니다.
    </p>
  );
}
