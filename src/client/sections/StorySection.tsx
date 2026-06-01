// 사용자 랜딩 Story 섹션 — Figma 96:7834 (1440×573). 배경 #FAF4FF, 좌측 이미지 2장 + 우측 TagChip+헤딩+설명+Result 통계. ADR-009 #story 앵커 (쌀나눔 프로젝트 메뉴 매핑). 4 BP: lg+ 좌-우 / 1024↓ 세로 스택 (Result 라인은 모바일 가로 → 데스크탑 세로)
// 통계는 kpi_metrics(section='story') DB 연결 — 운영자가 /admin/landing 에서 입력. value 0/null 인 항목은 hide-when-empty 로 숨김

export type StoryStat = {
  slug: string;
  label: string;
  displayValue: string;
  value: number | null;
};

type Props = {
  stats: StoryStat[];
};

export function StorySection({ stats }: Props) {
  // hide-when-empty — value 0/null 항목 제외. 전부 숨으면 통계 블록 자체 비노출
  const visibleStats = stats.filter((s) => s.value != null && s.value > 0);
  return (
    <section id="story" className="w-full bg-surface-tint-faint py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 lg:flex-row lg:items-center lg:gap-[70px] lg:px-0">
        {/* 좌측 이미지 2장 — 큰 + 작은 */}
        <div className="relative grid w-full grid-cols-2 gap-3 lg:w-[560px] lg:shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- public asset */}
          <img
            src="/images/story-card1.png"
            alt=""
            width={560}
            height={420}
            className="col-span-2 aspect-[4/3] w-full rounded-lg object-cover"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- public asset */}
          <img
            src="/images/story-card2.png"
            alt=""
            width={280}
            height={280}
            className="col-span-1 aspect-square w-full rounded-lg object-cover"
          />
          {/* 장식 — 데스크탑에만 */}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
          <img
            src="/icons/story-heart.svg"
            alt=""
            aria-hidden
            className="absolute -right-4 -top-6 hidden size-16 lg:block"
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
            <ul className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
              {visibleStats.map((stat) => (
                <li
                  key={stat.slug}
                  className="flex flex-col gap-1 lg:px-8 lg:text-right [&:not(:first-child)]:border-t [&:not(:first-child)]:border-brand-mid/30 [&:not(:first-child)]:pt-4 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-t-0 lg:[&:not(:first-child)]:pt-0"
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
      </div>
    </section>
  );
}
