// 소식 상세 페이지 — Figma 93:8810 정합. 900px 본문(카테고리·제목·날짜·하트·태그·본문·공유·이전다음·관련글) + 스크롤탑. (public)/layout 의 헤더·푸터 사용. Next 16 params Promise + Suspense 격리
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, List } from "lucide-react";

import { getNewsDetail, getRelatedNews } from "@/features/news";
import { NewsBodyRenderer } from "@/features/news/render/news-body-renderer";

import { SubBanner } from "../sub-banner";
import { DetailHeart } from "./detail-heart";
import { ShareRow } from "./share-row";
import { ScrollTopButton } from "./scroll-top";

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export const metadata: Metadata = {
  title: "쌀 나눔 소식 | 사회공헌단 Sow Good",
  description: "사회공헌단 Sow Good 의 쌀 나눔·가족 치유·지역 봉사·환경 캠페인 활동 소식.",
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
    <div
      className="mx-auto w-full max-w-[900px] px-4 py-12 lg:py-20"
      aria-busy
    >
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

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-12 lg:py-20">
      {/* 제목 블록 */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold text-brand-vivid">
            {item.categoryName}
          </p>
          <h1 className="text-2xl font-semibold leading-snug text-ink-strong lg:text-[32px]">
            {item.title}
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base text-ink-date">{fmtDate(item.publishedAt)}</p>
          <DetailHeart newsId={item.id} count={item.heartCount} />
        </div>
      </header>

      {/* 태그 */}
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

      {/* 목록 / 이전·다음 (이전·다음 인접 글 연결은 v1.1 — 현재 목록으로) */}
      <nav className="mt-6 flex items-center justify-between text-base font-semibold text-ink-strong">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 hover:opacity-80"
        >
          <List className="size-5" aria-hidden />
          목록 보기
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 hover:opacity-80"
          >
            <ArrowLeft className="size-5" aria-hidden />
            이전글
          </Link>
          <span aria-hidden className="h-4 w-px bg-border" />
          <Link
            href="/news"
            className="inline-flex items-center gap-1 hover:opacity-80"
          >
            다음글
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </nav>

      {/* 더 많은 소식 */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-ink-strong">
            더 많은 소식 살펴보기
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/news/${r.id}`} className="group block">
                  <div className="aspect-[313/170] w-full overflow-hidden rounded-[14px] bg-surface-soft">
                    {r.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- S3/public asset
                      <img
                        src={r.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gradient-from to-gradient-to" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 pt-3">
                    <p className="text-sm font-bold text-brand-vivid">
                      {r.categoryName}
                    </p>
                    <p className="line-clamp-2 text-lg font-bold leading-tight text-ink-strong">
                      {r.title}
                    </p>
                    <p className="text-base text-ink-date">
                      {fmtDate(r.publishedAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
