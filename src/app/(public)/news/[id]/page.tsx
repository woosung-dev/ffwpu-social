// 소식 상세 페이지 — Figma 749:7920(B 시안) 정합. 900px 본문(헤더·태그·본문·공유+공감·이전다음·관련글) + 스크롤탑. (public)/layout 의 헤더·푸터 사용. Next 16 params Promise + Suspense 격리
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getAdjacentNews, getNewsDetail, getRelatedNews } from "@/features/news";
import { bodyToExcerpt } from "@/features/news/excerpt";
import { NewsBodyRenderer } from "@/features/news/render/news-body-renderer";
import { ArticleCard } from "@/features/news/components";
import { ShareRow } from "@/client/components/ShareRow";
import { SITE_NAME } from "@/lib/site";

import { SubBanner } from "../sub-banner";
import { DetailHeader } from "./detail-header";
import { DetailHeart } from "./detail-heart";
import { NewsViewTracker } from "./news-view-tracker";
import { PrevNextNav } from "./prev-next-nav";
import { ScrollTopButton } from "./scroll-top";

// 글별 메타 — 공유 시 제목·요약·커버 썸네일이 뜨도록(이전엔 전 글 동일 일반 타이틀). 커버 없으면 동적 OG(/api/og)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getNewsDetail("story", id);
  if (!article) {
    return {
      title: "찾을 수 없는 소식 | 사회공헌단 Sow Good",
      robots: { index: false, follow: false },
    };
  }
  const description =
    bodyToExcerpt(article.body, 150) ||
    `${article.categoryName} · 사회공헌단 Sow Good 의 활동 소식.`;
  const ogImage =
    article.coverImageUrl ??
    `/api/og?title=${encodeURIComponent(article.title)}`;
  const url = `/news/${id}`;
  return {
    title: `${article.title} | 사회공헌단 Sow Good`,
    description,
    alternates: { canonical: url },
    openGraph: {
      siteName: SITE_NAME,
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
  const item = await getNewsDetail("story", id);
  if (!item) notFound();
  const related = await getRelatedNews("story", id, item.categoryId, 3);
  // 이전/다음 글 — publishedAt 인접 (발행 상세는 publishedAt non-null)
  const adjacent = item.publishedAt
    ? await getAdjacentNews("story", id, item.publishedAt)
    : { prev: null, next: null };

  return (
    // 배경 밴드 기준 래퍼 — isolate 로 -z-10 밴드를 콘텐츠 뒤·페이지 배경 앞 stacking context 에 격리
    <div className="relative isolate">
      <NewsViewTracker newsId={item.id} />
      {/* 배경 밴드 — Figma 749:7979: 풀블리드 수직 그라데이션 white→rgba(249,244,255,0.8).
          1440 기준 h598, 하단(디바이더~관련글) 뒤에 깔리고 푸터 직전에서 끝남 — 컨테이너 하단 앵커.
          모바일 h360 은 비례 축소 [추론 — Figma 모바일 상세 프레임 없음] */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[360px] bg-gradient-to-b from-white to-[#F9F4FF]/80 lg:h-[598px]"
      />
      <div className="mx-auto w-full px-4 md:max-w-[648px] md:px-0 lg:max-w-[905px] py-12 lg:py-20">
        {/* 본문폭: 리스트 밴드 정합 md648/lg905, wide는 가독 cap(1200 미적용) */}
        <DetailHeader
          categoryName={item.categoryName}
          title={item.title}
          publishedAt={item.publishedAt}
        />

        {/* 본문 — 1440 리듬: 제목 블록 →60→ 본문 */}
        <div className="mt-10 lg:mt-[60px]">
          <NewsBodyRenderer body={item.body} />
        </div>

        {/* 하단 — Figma 1024:7940/7930: 공감(중앙) → 공유(중앙·30) → 태그(좌·50). 본문 →120→ 공감.
            모바일 값은 wide 리듬 비례 축소 [추론 — 모바일 상세 프레임 없음] */}
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

        {/* 1440 리듬: 태그 →70→ 디바이더 */}
        <hr className="mt-12 border-border lg:mt-[70px]" />

        <PrevNextNav prev={adjacent.prev} next={adjacent.next} basePath="/news" />

        {/* 더 많은 소식 — Figma 93:8865 관련글 ArticleCard(인스턴스 93:8868) size=3.
            1440 리듬: 이전/다음 행 →40→ 제목 — 행 터치타깃 하단 여유 10px 보정해 mt 30px [추론 — 텍스트 기준 정합] */}
        {related.length > 0 && (
          <section className="mt-12 lg:mt-[30px]">
            <h2 className="text-xl font-bold text-ink-strong">
              더 많은 소식 살펴보기
            </h2>
            <ul className="mt-4 grid [grid-template-columns:repeat(auto-fill,minmax(max(200px,calc(50%-14px)),1fr))] gap-7 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
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
    </div>
  );
}
