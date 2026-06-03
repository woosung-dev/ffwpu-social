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
  heartCount?: number;
};

type Size = 1 | 2 | 3 | 4;
type State = "default" | "hover" | "none";

type Props = {
  size?: Size;
  state?: State;
  article?: ArticleLite;
  className?: string;
};

const SIZE_CONFIG: Record<
  Size,
  {
    container: string;
    aspectRatio: string;
  }
> = {
  1: {
    container: "w-full max-w-[384px]",
    aspectRatio: "aspect-[313/170]",
  },
  2: {
    container: "w-full max-w-[313px]",
    aspectRatio: "aspect-[313/170]",
  },
  3: {
    container: "w-full max-w-[288px]",
    aspectRatio: "aspect-[288/156]",
  },
  4: {
    container: "w-full max-w-[200px]",
    aspectRatio: "aspect-[200/110]",
  },
};

const GRADIENT_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-to))",
};

export function ArticleCard({
  size = 1,
  state = "default",
  article,
  className,
}: Props) {
  const config = SIZE_CONFIG[size];

  if (state === "none") {
    // 이미지 없는 그라디언트 플레이스홀더 카드 (Figma 114:8202)
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-[14px]",
          config.container,
          className,
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-[14px]",
            config.aspectRatio,
          )}
          style={GRADIENT_STYLE}
        >
          <span className="text-2xl font-bold text-white">보도자료</span>
        </div>
        {article && (
          <div className="flex flex-col gap-5 px-0.5 pb-3.5 pt-3">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-bold text-brand-vivid">
                {article.categoryName}
              </span>
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
        )}
      </div>
    );
  }

  if (!article) return null;

  return (
    <Link
      href={`/news/${article.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[14px] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(80,31,126,0.25)]",
        state === "hover" && "shadow-[0_8px_24px_-12px_rgba(80,31,126,0.25)]",
        config.container,
        className,
      )}
    >
      {/* 이미지 컨테이너 */}
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
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={GRADIENT_STYLE} />
        )}
      </div>

      {/* 텍스트 영역 — Figma 114:8195 정합 */}
      <div className="flex flex-col gap-5 px-0.5 pb-3.5 pt-3">
        <div className="flex flex-col gap-1">
          {/* 카테고리(좌) + 하트(우) 행 — Figma 114:8288 정합 */}
          <div className="flex items-start justify-between">
            <span className="text-[14px] font-bold leading-[1.6] text-brand-vivid">
              {article.categoryName}
            </span>
            {/* 이미지 있는 카드만 하트 표시 — Figma 114:8288 정합 */}
            {article.coverImageUrl != null && article.heartCount != null && (
              <Heart
                count={article.heartCount}
                interactive={false}
                compact
              />
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
