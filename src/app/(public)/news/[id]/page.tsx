// 소식 상세 페이지 — Figma 93:8810 정합. 900px 본문(헤더·태그·본문·공유·이전다음·관련글) + 스크롤탑. (public)/layout 의 헤더·푸터 사용. Next 16 params Promise + Suspense 격리
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getAdjacentNews, getNewsDetail, getRelatedNews } from "@/features/news";
import { NewsBodyRenderer } from "@/features/news/render/news-body-renderer";
import { ArticleCard } from "@/features/news/components";

import { SubBanner } from "../sub-banner";
import { DetailHeader } from "./detail-header";
import { PrevNextNav } from "./prev-next-nav";
import { ShareRow } from "./share-row";
import { ScrollTopButton } from "./scroll-top";

export const metadata: Metadata = {
  title: "쌀 나눔 소식 | 사회공헌단 Sow Good",
  description:
    "사회공헌단 Sow Good 의 쌀 나눔·가족 치유·지역 봉사·환경 캠페인 활동 소식.",
};

export default function NewsDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <SubBanner />
      <Suspense fallback={<DetailLoading />}>
        <NewsDetailContent paramsPromise={props.params} />
      </Suspense>
      <ScrollTopButton />
    </>
  );
}

function DetailLoading() {
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-12 lg:py-20" aria-busy>
      <div className="h-8 w-2/3 animate-pulse rounded bg-surface-soft" />
      <div className="mt-6 h-[420px] animate-pulse rounded-2xl bg-surface-soft" />
    </div>
  );
}

async function NewsDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const item = await getNewsDetail(id);
  if (!item) notFound();
  const related = await getRelatedNews(id, item.categoryId, 3);
  // 이전/다음 글 — publishedAt 인접 (발행 상세는 publishedAt non-null)
  const adjacent = item.publishedAt
    ? await getAdjacentNews(id, item.publishedAt)
    : { prev: null, next: null };

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-12 lg:py-20">
      <DetailHeader
        newsId={item.id}
        categoryName={item.categoryName}
        title={item.title}
        publishedAt={item.publishedAt}
        heartCount={item.heartCount}
      />

      {/* 태그 — 해시태그 알약 (Figma 106:8461) */}
      {item.tags.length > 0 && (
        <ul className="mt-8 flex flex-wrap items-center gap-2">
          {item.tags.map((tag) => (
            <li key={tag}>
              <span className="inline-flex items-center rounded-full border-[1.3px] border-tag-default px-4 py-1 text-base text-tag-default lg:text-lg">
                #{tag}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* 본문 */}
      <div className="mt-10">
        <NewsBodyRenderer body={item.body} />
      </div>

      {/* 공유 */}
      <div className="mt-8">
        <ShareRow title={item.title} />
      </div>

      <hr className="mt-12 border-border" />

      <PrevNextNav prev={adjacent.prev} next={adjacent.next} />

      {/* 더 많은 소식 — Figma 93:8865 관련글 ArticleCard(인스턴스 93:8868) size=3 */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-ink-strong">
            더 많은 소식 살펴보기
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-5">
            {related.map((r) => (
              <li key={r.id} className="flex">
                <ArticleCard
                  size={3}
                  className="w-full max-w-none"
                  article={{
                    id: r.id,
                    title: r.title,
                    categoryName: r.categoryName,
                    coverImageUrl: r.coverImageUrl,
                    publishedAt: r.publishedAt,
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
