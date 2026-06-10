// 사용자 랜딩 Story 섹션 — Figma 96:7834 (1440×573). 배경 #FAF4FF, 좌측 이미지 2장 + 우측 TagChip+헤딩+설명+Result 통계. ADR-009 #story 앵커 (쌀나눔 프로젝트 메뉴 매핑). 4 BP: lg+ 좌-우 / 1024↓ 세로 스택. 데코 스티커 BP별 고정 px(이전 % 비율, 비단조 image1 폭 버그 수정)
// 상단 이미지 2장 = 운영자가 /admin/landing 상단 슬롯(story_slot 1~2)에 지정한 글의 대표 이미지(미지정 시 기본 디자인 사진). 클릭 시 해당 소식으로 이동. (R7 — 어드민 큐레이션 공개 반영)
// 통계는 kpi_metrics(section='story') DB 연결 — 운영자가 /admin/landing 에서 입력. value 0/null 인 항목은 hide-when-empty 로 숨김
import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";
import { STORY_SECTION_CONTENT } from "@/features/landing/constants/story";
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

// 섹션 셸(배경+세로 패딩) — Figma 측정 79/73 의 4px 그리드 스냅(80/72, ±2px 스윕 허용오차 내).
// page.tsx Suspense 스켈레톤과 동기 유지를 위해 export 공유.
export const STORY_SECTION_SHELL =
  "w-full bg-surface-tint-faint py-20 lg:py-18";

export function StorySection({ stats, slots }: Props) {
  // hide-when-empty — value 0/null 항목 제외. 전부 숨으면 통계 블록 자체 비노출
  const visibleStats = stats.filter((s) => s.value != null && s.value > 0);
  return (
    <section id="story" className={`${STORY_SECTION_SHELL} overflow-x-clip`}>
      <SectionContainer className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-0">
        {/* 좌측 이미지 2장 — 각 이미지를 relative 래퍼로 감싸 장식을 "그 이미지" 기준으로 앵커링.
            바깥 래퍼는 overflow visible(장식 오버행 허용), StoryImage 내부 overflow-hidden 은 둥근 사진만 클리핑.
            Figma 반응형: <1024 stacked(이미지그룹 위/텍스트 아래) · lg(1025~1439) & wide(1440) 모두 side-by-side(좌 이미지/우 텍스트).
            lg(content 905px 고정): 이미지그룹 545 + 텍스트 360, 이미지1 347 / 이미지2 186, h333 (Figma 1439 프레임 332:8976).
            wide(content 1200): 이미지그룹 817(이미지1 527 / 이미지2 278), h425. */}
        <div className="flex w-full flex-row gap-1.5 md:gap-3 h-[221px] md:h-[294px] lg:h-[333px] lg:w-[545px] lg:flex-none wide:h-[425px] wide:w-[817px]">
          {/* 이미지 1 (좌) + 장식(SOW·heart) — 이 이미지 기준 px offset */}
          <div className="relative h-full flex-1" data-fid="story-img1">
            <StoryImage
              slot={slots[0] ?? null}
              fallback={FALLBACK_IMAGES[0]}
              wrapperClass="h-full w-full"
              width={560}
              height={420}
            />
            {/* SOW — 좌상단 오버행 */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/icons/story-sow.svg"
              alt=""
              aria-hidden
              data-fid="story-sow"
              className="pointer-events-none absolute z-10 h-auto -rotate-[5deg] w-[91px] left-[-16px] top-[-30px] md:w-[110px] md:left-[-18px] lg:w-[127px] lg:left-[-33px] lg:top-[-31px] wide:w-[167px] wide:left-[-25px]"
            />
            {/* heart — 좌측 중상단 */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/icons/story-heart.svg"
              alt=""
              aria-hidden
              data-fid="story-heart"
              className="pointer-events-none absolute z-10 h-auto w-[39px] left-[78px] top-[-41px] md:w-[45px] md:left-[-23px] md:top-[48px] lg:w-[52px] lg:left-[-33px] lg:top-[79px] wide:w-[69px] wide:left-[-45px] wide:top-[90px]"
            />
          </div>

          {/* 이미지 2 (우) + 장식(sparkles·Go·od = Good) — 이 이미지 기준 px offset */}
          <div className="relative h-full w-[165px] shrink-0 md:w-[186px] wide:w-[278px]" data-fid="story-img2">
            <StoryImage
              slot={slots[1] ?? null}
              fallback={FALLBACK_IMAGES[1]}
              wrapperClass="h-full w-full"
              width={280}
              height={280}
            />
            {/* sparkles — 우상단 */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/icons/story-sparkles.svg"
              alt=""
              aria-hidden
              data-fid="story-sparkles"
              className="pointer-events-none absolute z-10 h-auto w-[40px] left-[132px] top-[-30px] md:w-[49px] md:left-[159px] md:top-[-28px] lg:w-[56px] lg:left-[154px] lg:top-[-29px] wide:w-[82px] wide:left-[221px] wide:top-[-41px]"
            />
            {/* Good: Go — 좌하단 오버행(갭 쪽) */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/icons/story-go.svg"
              alt=""
              aria-hidden
              data-fid="story-go"
              className="pointer-events-none absolute z-10 h-auto -rotate-[3deg] w-[72px] left-[-29px] top-[183px] md:w-[88px] md:left-[-56px] md:top-[242px] lg:w-[101px] lg:left-[-67px] lg:top-[276px] wide:w-[119px] wide:left-[-82px] wide:top-[354px]"
            />
            {/* Good: od — 우하단 오버행 */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/icons/story-od.svg"
              alt=""
              aria-hidden
              data-fid="story-od"
              className="pointer-events-none absolute z-10 h-auto rotate-[5deg] w-[68px] left-[119px] top-[192px] md:w-[84px] md:left-[151px] md:top-[245px] lg:w-[97px] lg:left-[154px] lg:top-[287px] wide:w-[115px] wide:left-[237px] wide:top-[357px]"
            />
          </div>
        </div>

        {/* 텍스트 + Result — 카피는 constants/story.ts SSoT.
            base: 세로(본문 위/통계 아래 풀폭) · md(768~1024): 가로 [본문 좌 | 통계 우, 하단정렬] · lg+: 세로 우정렬(side-by-side 컬럼) */}
        <div className="flex flex-1 flex-col gap-6 text-surface-dark md:flex-row md:items-end md:justify-between md:gap-8 lg:flex-col lg:items-end lg:justify-start lg:gap-6 lg:text-right">
          {/* 내부 갭 — tag→title 16(Figma 14/18 의 ±2 스냅, BP 단일화) · title→desc 4(base)/12(md+) */}
          <div className="flex flex-col md:max-w-[300px] lg:max-w-none lg:items-end">
            <span className="self-start rounded-full bg-surface-dark px-4 py-2 text-base font-semibold text-ink-on-purple lg:self-end">
              {STORY_SECTION_CONTENT.tag}
            </span>

            <h2 className="mt-4 whitespace-pre-line break-keep text-2xl font-bold leading-tight lg:text-[32px]">
              {STORY_SECTION_CONTENT.title}
            </h2>

            <p className="mt-1 text-base font-medium leading-[1.6] md:mt-3 lg:max-w-[420px]">
              {STORY_SECTION_CONTENT.subtitle}
            </p>
          </div>

          {/* Result 통계 — Bold 24px #9257CA value / Medium 15px label, lg+ 가로 라인 / 모바일 세로 라인. hide-when-empty 적용 */}
          {visibleStats.length > 0 && (
            <ul
              aria-label="쌀 나눔 활동 성과"
              className="mt-2 flex flex-row items-stretch gap-0 md:mt-0 lg:mt-2"
            >
              {visibleStats.map((stat) => (
                <li
                  key={stat.slug}
                  className="flex flex-1 flex-col gap-1 px-[clamp(0.75rem,2.5vw,2rem)] text-left md:flex-initial md:px-4 lg:text-right wide:px-8 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-brand-mid/30"
                  aria-label={`${stat.label} ${stat.displayValue}`}
                >
                  <p className="text-[15px] font-medium">{stat.label}</p>
                  <p className="text-brand-mid text-2xl font-bold tabular-nums">
                    {stat.displayValue}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionContainer>
    </section>
  );
}
