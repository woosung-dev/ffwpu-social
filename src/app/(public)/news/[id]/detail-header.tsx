// 소식 상세 헤더 — 카테고리 + 제목 + 날짜 + 익명 좋아요(DetailHeart). Figma 93:8821(Title 블록) 정합. Server Component (DetailHeart 만 client child)
import { DetailHeart } from "./detail-heart";

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export function DetailHeader({
  newsId,
  categoryName,
  title,
  publishedAt,
  heartCount,
}: {
  newsId: string;
  categoryName: string;
  title: string;
  publishedAt: Date | string | null;
  heartCount: number;
}) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold text-brand-vivid">{categoryName}</p>
        <h1 className="break-keep text-2xl font-semibold leading-snug text-ink-strong lg:text-[32px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-base text-ink-date">{fmtDate(publishedAt)}</p>
        <DetailHeart newsId={newsId} count={heartCount} />
      </div>
    </header>
  );
}
