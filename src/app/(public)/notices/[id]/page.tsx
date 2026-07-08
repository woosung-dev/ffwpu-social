// 공지사항 상세 페이지 — Figma 1104-10813. 제목·날짜 + 본문(NewsBodyRenderer 재사용) + 첨부 DownloadSection + 이전/다음
// 미발행·예약·불량 uuid 는 404. Next 16 params Promise + Suspense 격리 (news 상세 미러)
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";

import { getAdjacentNotices, getNoticeDetail } from "@/features/notices";
import { DownloadSection } from "@/features/notices/components";
import { bodyToExcerpt } from "@/features/news/excerpt";
import { NewsBodyRenderer } from "@/features/news/render/news-body-renderer";

import { SubBanner } from "../../news/sub-banner";
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
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(notice.title)}`,
          width: 1200,
          height: 630,
          alt: notice.title,
        },
      ],
    },
  };
}

export default function NoticeDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <SubBanner />
      <Suspense fallback={<DetailLoading />}>
        <NoticeDetailContent paramsPromise={props.params} />
      </Suspense>
    </>
  );
}

function DetailLoading() {
  return (
    <div className="mx-auto w-full max-w-[905px] px-4 py-12 lg:py-20" aria-busy>
      <div className="h-8 w-2/3 animate-pulse rounded bg-surface-soft" />
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

  return (
    // 본문폭 — news 상세와 동일 정합 (md648/lg905, wide 는 가독 cap)
    <div className="mx-auto w-full px-4 py-12 md:max-w-[648px] md:px-0 lg:max-w-[905px] lg:py-20">
      <NoticeVisitTracker noticeId={notice.id} />

      {/* 제목 블록 — news DetailHeader 리듬(카테고리 없음) */}
      <header className="flex flex-col gap-5">
        <h1 className="break-keep text-2xl font-semibold leading-snug text-ink-strong lg:text-[32px] lg:leading-[1.5]">
          {notice.title}
        </h1>
        <p className="text-base font-medium text-ink-date">
          {fmtDate(notice.publishedAt)}
        </p>
      </header>

      {/* 본문 — news 상세와 동일 리듬 (제목 블록 →60→ 본문) */}
      <div className="mt-10 lg:mt-[60px]">
        <NewsBodyRenderer body={notice.body} />
      </div>

      {/* 첨부 다운로드 — Figma 1104-11167. 첨부 0개면 미렌더 */}
      {notice.attachments.length > 0 && (
        <div className="mt-12 lg:mt-[70px]">
          <DownloadSection
            attachments={notice.attachments.map((a) => ({
              id: a.id,
              fileName: a.fileName,
              size: a.size,
            }))}
          />
        </div>
      )}

      <hr className="mt-12 border-border lg:mt-[70px]" />

      <NoticePrevNext prev={adjacent.prev} next={adjacent.next} />
    </div>
  );
}
