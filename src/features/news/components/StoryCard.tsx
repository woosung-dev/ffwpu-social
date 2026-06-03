// StoryCard — 277.67×425 세로 카드, 이미지 위 그라디언트 오버레이 + 라벤더 텍스트 (#F1E3FF). 랜딩 StorySection 용
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  imageUrl?: string | null;
  title: string;
  subtitle?: string;
  className?: string;
};

export function StoryCard({
  href,
  imageUrl,
  title,
  subtitle,
  className,
}: Props) {
  const Wrapper = href ? Link : "div";
  return (
    <Wrapper
      href={href ?? "#"}
      className={cn(
        "group relative block w-full max-w-[278px] overflow-hidden rounded-[12px] bg-brand-darkest outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/60 focus-visible:ring-offset-2",
        "aspect-[278/425]",
        className,
      )}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 300px"
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
