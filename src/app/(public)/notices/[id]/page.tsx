// 공지사항 상세 페이지 — Figma 1104:10813 정합. 중앙 타이틀 블록(News eyebrow·클립) + 본문 + 첨부 다운로드(본문 아래) + 목록/이전다음
// 미발행·예약·불량 uuid 는 404. Next 16 params Promise + Suspense 격리 (news 상세 미러)
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";

import { getAdjacentNotices, getNoticeDetail } from "@/features/notices";
import { DownloadSection } from "@/features/notices/components";
import { NoticeClipIcon } from "@/features/notices/components/notice-icons";
import { bodyToExcerpt } from "@/features/news/excerpt";
import { NewsBodyRenderer } from "@/features/news/render/news-body-renderer";
import { JsonLd } from "@/client/components/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

import { SubBanner } from "../../news/sub-banner";
import { ScrollTopButton } from "../../news/[id]/scroll-top";
import { NoticePrevNext } from "./notice-prev-next";
import { NoticeVisitTracker } from "./notice-visit-tracker";

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

// uuid 형식 불량은 DB 조회 없이 null (직접 URL 진입 대비)
async function getNoticeIfValid(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  return getNoticeDetail(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNoticeIfValid(id);
  if (!notice) {
    return {
      title: "찾을 수 없는 공지 | 사회공헌단 Sow Good",
      robots: { index: false, follow: false },
    };
  }
  const description =
    bodyToExcerpt(notice.body, 150) || "사회공헌단 Sow Good 의 공지사항.";
  const url = `/notices/${id}`;
  const ogImage = `/api/og?title=${encodeURIComponent(notice.title)}`;
  return {
    title: `${notice.title} | 사회공헌단 Sow Good`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: notice.title,
      description,
      type: "article",
      locale: "ko_KR",
      url,
      publishedTime: notice.publishedAt?.toISOString(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: notice.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: notice.title,
      description,
      images: [ogImage],
    },
  };
}

export default function NoticeDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    // 하단 그라데이션 제거 — 목록과 동일 처리, 흰 배경 (사용자 요청 2026-07-09, Figma Background h598 미반영)
    <>
      <SubBanner />
      <Suspense fallback={<DetailLoading />}>
        <NoticeDetailContent paramsPromise={props.params} />
      </Suspense>
      <ScrollTopButton />
    </>
  );
}

function DetailLoading() {
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-12 wide:py-[154px]" aria-busy>
      <div className="mx-auto h-8 w-2/3 animate-pulse rounded bg-surface-soft" />
      <div className="mt-6 h-[420px] animate-pulse rounded-2xl bg-surface-soft" />
    </div>
  );
}

async function NoticeDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const notice = await getNoticeIfValid(id);
  if (!notice) notFound();
  // 이전/다음 공지 — publishedAt 인접 (발행 상세는 publishedAt non-null)
  const adjacent = notice.publishedAt
    ? await getAdjacentNotices(id, notice.publishedAt)
    : { prev: null, next: null };

  // Article 구조화 데이터 — 이미 조회한 notice 재사용. 커버 없어 image 는 동적 OG(절대 URL). 카피는 site.ts 상수 재사용
  const canonicalUrl = `${SITE_URL}/notices/${notice.id}`;
  const organization = {
    "@type": "Organization",
    name: SITE_NAME,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
  };
  const noticeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: notice.title,
    description: bodyToExcerpt(notice.body, 150) || `${SITE_NAME} 의 공지사항.`,
    image: `${SITE_URL}/api/og?title=${encodeURIComponent(notice.title)}`,
    datePublished: notice.publishedAt?.toISOString(),
    dateModified: notice.updatedAt.toISOString(),
    author: organization,
    publisher: organization,
    mainEntityOfPage: canonicalUrl,
    inLanguage: "ko",
  };

  return (
    // 본문폭 — Figma 4-BP: 343(px16)/648/905≈900/900. 배너→타이틀 65/85/154/154 (docs/design/notices-fidelity-2026-07-08.md)
    <div className="mx-auto w-full px-4 pt-[65px] pb-[100px] md:max-w-[648px] md:px-0 md:pt-[85px] lg:max-w-[900px] lg:pt-[154px] wide:pb-[180px]">
      <JsonLd data={noticeJsonLd} />
      <NoticeVisitTracker noticeId={notice.id} />

      {/* 타이틀 블록 — Figma 1104:10952: News eyebrow(18) +4+ 제목(중앙 28→32, 첨부 시 클립 28) +20+ 날짜(16, 중앙) */}
      <header className="flex flex-col gap-5 text-center">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold leading-[1.6] text-[#b35feb]">
            News
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <h1 className="break-keep text-[28px] font-semibold leading-[1.5] text-[#1f2937] md:text-[32px]">
              {notice.title}
            </h1>
            {notice.attachments.length > 0 && (
              <NoticeClipIcon
                aria-label="첨부파일 있음"
                className="size-6 text-[#d6d0d8] md:size-7"
              />
            )}
          </div>
        </div>
        <p className="text-base font-medium text-[#959ba9]">
          {fmtDate(notice.publishedAt)}
        </p>
      </header>

      {/* 본문 — 타이틀 →60→ 본문 (Figma LeftBlock gap-60, 전 BP) */}
      <div className="mt-[60px]">
        <NewsBodyRenderer body={notice.body} />
      </div>

      {/* 첨부 다운로드 (본문 아래) — 사용자 피드백으로 상단→하단 이동. 본문 →60→ 다운로드 (Figma 하단 배치·gap-60). 첨부 0개면 미렌더 */}
      {notice.attachments.length > 0 && (
        <div className="mt-[60px]">
          <DownloadSection
            attachments={notice.attachments.map((a) => ({
              id: a.id,
              fileName: a.fileName,
              size: a.size,
            }))}
          />
        </div>
      )}

      {/* 본문/다운로드 →70→ 디바이더 →16→ 목록/이전다음 (Figma 전 BP) */}
      <hr className="mt-[70px] border-border" />

      <NoticePrevNext prev={adjacent.prev} next={adjacent.next} />
    </div>
  );
}
