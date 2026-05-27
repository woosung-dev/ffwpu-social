// 소식 카드 — size 1~4 × state default/hover/none = 12 variants 통합 컴포넌트. Server Component (Heart 만 Client child 로 슬롯). ADR-007 카테고리 5 enum
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import type { NewsCategoryValue } from "../schemas";
import { Heart } from "./Heart";

type ArticleLite = {
  id: string;
  title: string;
  category: NewsCategoryValue;
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

const CATEGORY_LABEL: Record<NewsCategoryValue, string> = {
  all: "전체",
  family_healing: "가족 치유",
  local_volunteer: "지역 봉사",
  environment: "환경 캠페인",
  rice_sharing: "쌀 나눔",
};

const SIZE_CONFIG: Record<
  Size,
  {
    container: string;
    aspectRatio: string;
    titleClass: string;
    categoryClass: string;
  }
> = {
  1: {
    container: "w-full max-w-[382px]",
    aspectRatio: "aspect-[382/210]",
    titleClass: "text-lg lg:text-xl line-clamp-2",
    categoryClass: "text-xs",
  },
  2: {
    container: "w-full max-w-[313px]",
    aspectRatio: "aspect-[313/175]",
    titleClass: "text-base lg:text-lg line-clamp-2",
    categoryClass: "text-xs",
  },
  3: {
    container: "w-full max-w-[288px]",
    aspectRatio: "aspect-[288/160]",
    titleClass: "text-base line-clamp-2",
    categoryClass: "text-xs",
  },
  4: {
    container: "w-full max-w-[200px]",
    aspectRatio: "aspect-[200/120]",
    titleClass: "text-sm line-clamp-2",
    categoryClass: "text-[10px]",
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
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-[14px] border border-border bg-white",
          config.container,
          className,
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-center text-white",
            config.aspectRatio,
          )}
          style={GRADIENT_STYLE}
        >
          <span className="text-sm font-bold tracking-wide opacity-90">
            보도자료
          </span>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <span
            className={cn(
              "self-start rounded-full bg-brand-vivid px-2.5 py-0.5 font-semibold text-white",
              config.categoryClass,
            )}
          >
            보도자료
          </span>
          <p className={cn("font-bold text-foreground", config.titleClass)}>
            준비 중인 콘텐츠
          </p>
          <p className="text-xs text-ink-date">—</p>
        </div>
      </div>
    );
  }

  if (!article) return null;
  const isHover = state === "hover";

  return (
    <Link
      href={`/news/${article.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[14px] border border-border bg-white transition-shadow",
        isHover
          ? "shadow-[0_8px_24px_-12px_rgba(80,31,126,0.25)]"
          : "hover:shadow-[0_8px_24px_-12px_rgba(80,31,126,0.25)]",
        config.container,
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-surface-soft",
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
        {(isHover || article.heartCount != null) && (
          <div
            className={cn(
              "absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 shadow-sm transition-opacity",
              isHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            <Heart
              count={article.heartCount ?? 0}
              interactive={false}
              compact
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <span
          className={cn(
            "self-start rounded-full bg-brand-vivid px-2.5 py-0.5 font-semibold text-white",
            config.categoryClass,
          )}
        >
          {CATEGORY_LABEL[article.category]}
        </span>
        <p className={cn("font-bold text-foreground", config.titleClass)}>
          {article.title}
        </p>
        <p className="text-xs text-ink-date">
          {article.publishedAt
            ? dayjs(article.publishedAt).format("YYYY.MM.DD")
            : "—"}
        </p>
      </div>
    </Link>
  );
}

export type { ArticleLite };
