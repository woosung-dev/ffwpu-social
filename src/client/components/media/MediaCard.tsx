// MediaCard — 이미지 fill + 하단 그라디언트 오버레이 + 라벤더 텍스트 카드. 랜딩 ArticleGrid 마조네리용 (구 StoryCard, ADR-024 client 영역으로 이동 — 랜딩 전용이라 features/news 의존 제거)
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  imageUrl?: string | null;
  title: string;
  subtitle?: string;
  className?: string;
  // 커버 실제 픽셀 — 박스 비율 = 이미지 비율이라 object-cover 크롭 0(마조네리 가변 높이). 없으면 폴백 4/5
  width?: number | null;
  height?: number | null;
};

export function MediaCard({
  href,
  imageUrl,
  title,
  subtitle,
  className,
  width,
  height,
}: Props) {
  const Wrapper = href ? Link : "div";
  const aspectRatio = width && height ? `${width} / ${height}` : "4 / 5";
  return (
    <Wrapper
      href={href ?? "#"}
      style={{ aspectRatio }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[12px] bg-brand-darkest outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/60 focus-visible:ring-offset-2",
        className,
      )}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-darkest/95 via-brand-darkest/40 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-5 text-brand-lavender">
        {subtitle && (
          <p className="text-xs font-medium opacity-80">{subtitle}</p>
        )}
        <p className="mt-1 text-xl font-extrabold leading-tight">{title}</p>
      </div>
    </Wrapper>
  );
}
