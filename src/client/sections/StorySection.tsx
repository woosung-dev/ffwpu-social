// 사용자 랜딩 Story 섹션 — Figma 96:7834 (1440×573). 배경 #FAF4FF, 좌측 이미지 2장 + 우측 TagChip+헤딩+설명+Result 통계. ADR-009 #story 앵커 (쌀나눔 프로젝트 메뉴 매핑). 4 BP: lg+ 좌-우 / 1024↓ 세로 스택 (Result 라인은 모바일 가로 → 데스크탑 세로)
// 상단 이미지 2장 = 운영자가 /admin/landing 상단 슬롯(story_slot 1~2)에 지정한 글의 대표 이미지(미지정 시 기본 디자인 사진). 클릭 시 해당 소식으로 이동. (R7 — 어드민 큐레이션 공개 반영)
// 통계는 kpi_metrics(section='story') DB 연결 — 운영자가 /admin/landing 에서 입력. value 0/null 인 항목은 hide-when-empty 로 숨김
import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";
import { cn } from "@/lib/utils";

export type StoryStat = {
  slug: string;
  label: string;
  displayValue: string;
  value: number | null;
};

// 상단 슬롯 글 — coverImageUrl 있으면 대표 이미지+소식 링크, 없으면 기본 사진
export type StorySlotItem = {
  id: string;
  title: string;
  coverImageUrl: string | null;
};

type Props = {
  stats: StoryStat[];
  slots: Array<StorySlotItem | null>; // [상단 1번(큰), 상단 2번(작은)]
};

const FALLBACK_IMAGES = [
  "/images/story-card1.png",
  "/images/story-card2.png",
] as const;

// 상단 슬롯 이미지 — wrapperClass 로 크기/비율 지정, 이미지는 컨테이너를 object-cover 로 채움(좌우 동일 높이 배치 지원). 지정 글 대표 이미지(글 링크) 또는 기본 사진
function StoryImage({
  slot,
  fallback,
  wrapperClass,
  width,
  height,
}: {
  slot: StorySlotItem | null;
  fallback: string;
  wrapperClass: string;
  width: number;
  height: number;
}) {
  const hasArticleImage = Boolean(slot?.coverImageUrl);
  const src = slot?.coverImageUrl ?? fallback;
  const alt = hasArticleImage ? slot!.title : "";
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- S3/public asset
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );

  if (slot && hasArticleImage) {
    return (
      <Link
        href={`/news/${slot.id}`}
        className={cn(
          "relative block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/60 focus-visible:ring-offset-2",
          wrapperClass,
        )}
      >
        {img}
      </Link>
    );
  }
  return (
    <div className={cn("relative overflow-hidden rounded-lg", wrapperClass)}>
      {img}
    </div>
  );
}

export function StorySection({ stats, slots }: Props) {
  // hide-when-empty — value 0/null 항목 제외. 전부 숨으면 통계 블록 자체 비노출
  const visibleStats = stats.filter((s) => s.value != null && s.value > 0);
  return (
    <section id="story" className="w-full bg-surface-tint-faint py-16 lg:py-24">
      <SectionContainer className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-[70px]">
        {/* 좌측 이미지 2장 — Figma 375~(flex-row 나란히), sm h-340, lg h-420 */}
        <div className="relative flex w-full flex-row gap-3 h-[240px] sm:h-[340px] lg:h-[420px] lg:flex-[1.8]">
          <StoryImage
            slot={slots[0] ?? null}
            fallback={FALLBACK_IMAGES[0]}
            wrapperClass="h-full flex-1"
            width={560}
            height={420}
          />
          <StoryImage
            slot={slots[1] ?? null}
            fallback={FALLBACK_IMAGES[1]}
            wrapperClass="h-full w-[42%] shrink-0 lg:w-[280px] lg:shrink-0"
            width={280}
            height={280}
          />
          {/* 장식 — 별·하트 (데스크탑) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
          <img
            src="/icons/story-star1.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -top-6 -left-5 z-10 hidden size-12 lg:block"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
          <img
            src="/icons/story-heart.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-5 left-[30%] z-10 hidden size-14 lg:block"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
          <img
            src="/icons/story-star2.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -top-4 -right-4 z-10 hidden size-12 lg:block"
          />
        </div>

        {/* 우측 텍스트 + Result */}
        <div className="flex flex-1 flex-col gap-6 text-surface-dark lg:items-end lg:text-right">
          <span className="self-start rounded-full bg-surface-dark px-4 py-2 text-base font-semibold text-ink-on-purple lg:self-end">
            쌀 나눔 활동
          </span>

          <h2 className="text-2xl font-bold leading-tight md:text-3xl lg:text-[32px]">
            밥이 사랑입니다
            <br />
            나누는 우리는 식구입니다
          </h2>

          <p className="text-base font-medium leading-[1.6] lg:max-w-[420px]">
            온기가 필요한 이웃에게 밥 한 공기의 진심을 전하며, 나누는 우리는
            모두 식구가 됩니다.
          </p>

          {/* Result 통계 — Bold 24px #9257CA value / Medium 15px label, lg+ 가로 라인 / 모바일 세로 라인. hide-when-empty 적용 */}
          {visibleStats.length > 0 && (
            <ul className="mt-2 flex flex-row items-stretch gap-0">
              {visibleStats.map((stat) => (
                <li
                  key={stat.slug}
                  className="flex flex-1 flex-col gap-1 px-[clamp(0.75rem,2.5vw,2rem)] text-left lg:flex-initial lg:px-8 lg:text-right [&:not(:first-child)]:border-l [&:not(:first-child)]:border-brand-mid/30"
                  aria-label={`${stat.label} ${stat.displayValue}`}
                >
                  <p className="text-brand-mid text-2xl font-bold tabular-nums">
                    {stat.displayValue}
                  </p>
                  <p className="text-[15px] font-medium">{stat.label}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionContainer>
    </section>
  );
}
