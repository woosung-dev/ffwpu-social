// 피처드 스토리 캐러셀 — 4 슬라이드, 좌 텍스트 / 우 이미지 612×411. shadcn Carousel (Embla) 위에 Figma 인디케이터 (Active 22px / Inactive 17px) 커스텀
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export type FeaturedStory = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** null 이면 보라 그라디언트 fallback */
  imageUrl: string | null;
  badge?: string;
};

type Props = {
  stories: readonly FeaturedStory[];
};

export function FeaturedStoryCard({ stories }: Props) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (stories.length === 0) return null;

  return (
    <section className="w-full">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {stories.map((s) => (
            <CarouselItem key={s.id}>
              <div className="grid gap-6 rounded-2xl bg-surface-soft p-6 lg:grid-cols-2 lg:gap-10 lg:p-10">
                <div className="order-2 flex flex-col justify-center lg:order-1">
                  {s.badge && (
                    <span className="self-start rounded-full bg-brand-vivid px-3 py-1 text-xs font-semibold text-white">
                      {s.badge}
                    </span>
                  )}
                  <h3 className="mt-4 text-2xl font-extrabold leading-tight text-ink-strong lg:text-3xl">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground lg:text-base">
                    {s.description}
                  </p>
                  <Link
                    href={s.href}
                    className="mt-6 inline-flex w-fit items-center gap-1 rounded-md bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
                  >
                    자세히 보기
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative aspect-[612/411] overflow-hidden rounded-xl bg-white">
                    {s.imageUrl ? (
                      <Image
                        src={s.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 612px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-to))",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-6 flex items-center justify-center gap-2">
        {stories.map((s, i) => {
          const isActive = i === selected;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`${i + 1}번째 스토리로 이동`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                isActive ? "w-[22px] bg-brand-vivid" : "w-[17px] bg-tag-default/40",
              )}
            />
          );
        })}
      </div>
    </section>
  );
}
