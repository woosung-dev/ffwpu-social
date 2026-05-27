// 아티클 그리드 카드 — aspect-ratio 기반 반응형 카드 + gradient 오버레이 + 제목 + 날짜 (Figma 96:7888~96:7895)
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  imageUrl: string;
  title: string;
  date: string;
  /** Figma 컬럼 너비(약 278px) 대비 카드 높이 비율 */
  aspect: `${number}/${number}`;
  href?: string;
  className?: string;
};

export function ArticleGridCard({
  imageUrl,
  title,
  date,
  aspect,
  href,
  className,
}: Props) {
  const inner = (
    <>
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/45 to-black/70"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-4 pb-3 pt-8 text-white">
        <p className="line-clamp-3 text-[clamp(1.125rem,1.5vw,1.375rem)] font-bold leading-[1.4]">
          {title}
        </p>
        <p className="text-[14px] font-bold">{date}</p>
      </div>
    </>
  );

  const wrapperClass = cn(
    "group relative block w-full overflow-hidden rounded-[12px] bg-[#242424]",
    className,
  );
  const wrapperStyle = { aspectRatio: aspect.replace("/", " / ") };

  if (href) {
    return (
      <Link href={href} className={wrapperClass} style={wrapperStyle}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {inner}
    </div>
  );
}
