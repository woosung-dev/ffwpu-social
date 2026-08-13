// 언론 보도 상세 (ADR-056) — 활동 스토리 상세와 동일한 레이아웃·기능(공감·공유·이전다음·관련글)을 board="press" 스코프로 재사용.
// 하위 컴포넌트는 복제하지 않고 ../news/[id] 것을 basePath prop 으로 공유한다.
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getAdjacentNews, getNewsDetail, getRelatedNews } from "@/features/news";
import { bodyToExcerpt } from "@/features/news/excerpt";
import { NewsBodyRenderer } from "@/features/news/render/news-body-renderer";
import { ArticleCard } from "@/features/news/components";
import { ShareRow } from "@/client/components/ShareRow";

import { SubBanner } from "../../news/sub-banner";
import { DetailHeader } from "../../news/[id]/detail-header";
import { DetailHeart } from "../../news/[id]/detail-heart";
import { NewsViewTracker } from "../../news/[id]/news-view-tracker";
import { PrevNextNav } from "../../news/[id]/prev-next-nav";
import { ScrollTopButton } from "../../news/[id]/scroll-top";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getNewsDetail("press", id);
  if (!article) {
    return {
      title: "찾을 수 없는 보도 | 사회공헌단 Sow Good",
      robots: { index: false, follow: false },
    };
  }
  const description =
    bodyToExcerpt(article.body, 150) ||
    `${article.categoryName} · 언론 속 사회공헌단 Sow Good.`;
  const ogImage =
    article.coverImageUrl ?? `/api/og?title=${encodeURIComponent(article.title)}`;
  // canonical 은 우리 페이지 유지 — 원문 언론사 URL 을 canonical 로 두면 이 페이지가 색인에서 빠진다
  const url = `/press/${id}`;
  return {
    title: `${article.title} | 사회공헌단 Sow Good`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      locale: "ko_KR",
      url,
      publishedTime: article.publishedAt?.toISOString(),
      tags: article.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default function PressDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <SubBanner />
      <Suspense fallback={<DetailLoading />}>
        <PressDetailContent paramsPromise={props.params} />
      </Suspense>
      <ScrollTopButton />
    </>
  );
}

async function PressDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  // board="press" 스코프 — 활동 스토리 글 id 로 /press/{id} 에 접근하면 404 (게시판 간 교차 노출 차단)
  const item = await getNewsDetail("press", id);
  if (!item) notFound();
  const related = await getRelatedNews("press", id, item.categoryId, 3);
  const adjacent = item.publishedAt
    ? await getAdjacentNews("press", id, item.publishedAt)
    : { prev: null, next: null };

  return (
    <div className="relative isolate">
      <NewsViewTracker newsId={item.id} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[360px] bg-gradient-to-b from-white to-[#F9F4FF]/80 lg:h-[598px]"
      />
      <div className="mx-auto w-full px-4 md:max-w-[648px] md:px-0 lg:max-w-[905px] py-12 lg:py-20">
        <DetailHeader
          categoryName={item.categoryName}
          title={item.title}
          publishedAt={item.publishedAt}
        />

        <div className="mt-10 lg:mt-[60px]">
          <NewsBodyRenderer body={item.body} />
        </div>

        <div className="mt-16 lg:mt-[120px]">
          <div className="flex flex-col items-center gap-7 lg:gap-[30px]">
            <DetailHeart newsId={item.id} count={item.heartCount} />
            <ShareRow title={item.title} newsId={item.id} />
          </div>
          {item.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap items-center gap-2 lg:mt-[50px]">
              {item.tags.map((tag) => (
                <li key={tag}>
                  <span className="inline-flex items-center rounded-full border-[1.3px] border-tag-default bg-gray-50 px-4 py-1 text-base font-medium text-tag-default lg:text-lg">
                    #{tag}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr className="mt-12 border-border lg:mt-[70px]" />

        <PrevNextNav prev={adjacent.prev} next={adjacent.next} basePath="/press" />

        {related.length > 0 && (
          <section className="mt-12 lg:mt-[30px]">
            <h2 className="text-xl font-bold text-ink-strong">
              다른 언론 보도 살펴보기
            </h2>
            <ul className="mt-4 grid [grid-template-columns:repeat(auto-fill,minmax(max(200px,calc(50%-14px)),1fr))] gap-7 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id} className="flex">
                  <ArticleCard
                    size={3}
                    className="w-full max-w-none"
                    href={`/press/${r.id}`}
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
    </div>
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
