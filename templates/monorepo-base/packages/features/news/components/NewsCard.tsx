// 공개 사이트 news 카드 — 목록 그리드 셀, ui-base primitives 위에 도메인 의미만 얹음
import * as React from "react";
import { Card } from "@myorg/ui-base/components/card";
import type { NewsRow } from "../schemas";

export interface NewsCardProps {
  news: Pick<NewsRow, "id" | "title" | "slug" | "summary" | "coverImageUrl" | "heartCount" | "publishedAt">;
  href?: string;
  className?: string;
}

export function NewsCard({ news, href, className }: NewsCardProps) {
  const target = href ?? `/news/${news.slug}`;
  return (
    <Card className={className} aria-labelledby={`news-${news.id}-title`}>
      <a href={target} className="block">
        {news.coverImageUrl ? (
          <img
            src={news.coverImageUrl}
            alt=""
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="p-4">
          <h3 id={`news-${news.id}-title`} className="text-lg font-semibold">
            {news.title}
          </h3>
          {news.summary ? (
            <p className="mt-2 line-clamp-2 text-sm opacity-80">{news.summary}</p>
          ) : null}
          <div className="mt-3 flex items-center justify-between text-xs opacity-70">
            <time dateTime={news.publishedAt?.toISOString() ?? ""}>
              {news.publishedAt?.toLocaleDateString("ko-KR") ?? ""}
            </time>
            <span aria-label={`좋아요 ${news.heartCount}개`}>♥ {news.heartCount}</span>
          </div>
        </div>
      </a>
    </Card>
  );
}
