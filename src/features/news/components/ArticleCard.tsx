// 소식 카드 — Figma 114:8193 정합. 이미지 + [카테고리(좌) | 하트(우)] + 제목 + 날짜. Server Component (Heart 만 Client child)
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { Heart } from "./Heart";

type ArticleLite = {
  id: string;
  title: string;
  /** categories join 으로 내려온 카테고리 표시 이름 — 예: "쌀 나눔" */
  categoryName: string;
  coverImageUrl: string | null;
  publishedAt: Date | string | null;
  /** 있으면 카드 우상단에 표시(목록). 관련 글 카드처럼 없으면 Heart 미렌더 */
  heartCount?: number;
};

type Size = 1 | 2 | 3 | 4;

type Props = {
  size?: Size;
  article: ArticleLite;
  className?: string;
};

// Figma ArticleCard Size 1~4 — 컨테이너 max-w + 이미지 aspect
const SIZE_CONFIG: Record<Size, { container: string; aspectRatio: string }> = {
  1: { container: "w-full max-w-[384px]", aspectRatio: "aspect-[313/170]" },
  2: { container: "w-full max-w-[313px]", aspectRatio: "aspect-[313/170]" },
  3: { container: "w-full max-w-[288px]", aspectRatio: "aspect-[288/156]" },
  4: { container: "w-full max-w-[200px]", aspectRatio: "aspect-[200/110]" },
};

// 커버 없는 글의 placeholder — 보라 2색 그라디언트 (Figma None 상태)
const GRADIENT_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-to))",
};

export function ArticleCard({ size = 1, article, className }: Props) {
  const config = SIZE_CONFIG[size];

  return (
    <Link
      href={`/news/${article.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[14px]",
        config.container,
        className,
      )}
    >
      {/* 이미지 컨테이너 — 커버 없으면 그라디언트 placeholder */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[14px] bg-surface-soft",
          config.aspectRatio,
        )}
      >
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 400px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <div className="absolute inset-0" style={GRADIENT_STYLE} />
        )}
      </div>

      {/* 텍스트 영역 — Figma 114:8195 정합. 카테고리(좌)+하트(우) → 제목 → 날짜 */}
      <div className="flex flex-col gap-5 px-0.5 pb-3.5 pt-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <span className="text-[14px] font-bold leading-[1.6] text-brand-vivid">
              {article.categoryName}
            </span>
            {article.heartCount != null && (
              <Heart count={article.heartCount} interactive={false} compact />
            )}
          </div>
          <p className="line-clamp-2 text-[18px] font-bold leading-[1.4] text-ink-strong">
            {article.title}
          </p>
        </div>
        <span className="text-[16px] font-medium text-ink-date">
          {article.publishedAt
            ? dayjs(article.publishedAt).format("YYYY.MM.DD")
            : "—"}
        </span>
      </div>
    </Link>
  );
}

export type { ArticleLite };
