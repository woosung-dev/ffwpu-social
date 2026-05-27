// 사용자 랜딩 KPI 섹션 — Figma 96:7773 (1440×952). 좌측 251px 헤딩 + gap-70 + 우측 dashboard 760px 비대칭 그리드. 4 BP: lg(1024+) Figma 정합 / md·sm KpiCard 2x2·세로 폴백 (디자인 매트릭스 docs/design.md L151)
import { KpiCard } from "@/features/news/components";

export function KpiSection() {
  return (
    <section id="kpi" className="w-full bg-white py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 lg:flex-row lg:items-start lg:gap-[70px] lg:px-0">
        {/* 좌측 헤딩 */}
        <div className="flex flex-col gap-4 text-[#242424] lg:w-[251px] lg:shrink-0">
          <h2 className="text-3xl font-bold leading-[1.3] lg:text-[36px]">
            한 해동안
            <br />
            만들어낸 변화
          </h2>
          <p className="text-base font-medium leading-[1.5]">
            가정연합은 도움이 필요한 사람들에게 오랜기간 손을 건네왔습니다.
            앞으로도 변함없이 온기를 전하겠습니다.
          </p>
        </div>

        {/* 모바일/태블릿 (< 1024px): KpiCard 4 단순 grid */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          <KpiCard variant="gray" label="누적 봉사자 수" value="45,217" unit="명+" />
          <KpiCard variant="gray" label="누적 봉사 기간" value="38년 5개월" />
          <KpiCard variant="green" label="봉사활동 횟수" value="3,614" unit="회+" />
          <KpiCard variant="purple" label="도움을 주게 된 가정 수" value="80,257" unit="개+" />
        </div>

        {/* 데스크탑 (lg+): Figma Dashboard 비대칭 그리드 760px */}
        <div className="hidden h-[760px] flex-1 flex-col gap-4 lg:flex">
          {/* 상단 Wrap */}
          <div className="flex gap-4">
            {/* 보라 캐릭터 카드 */}
            <div className="flex w-[293px] shrink-0 items-center justify-center rounded-[20px] bg-brand-bright">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img
                src="/icons/kpi-smile-illustration.svg"
                alt=""
                width={121}
                height={86}
                aria-hidden
                className="h-auto w-[121px]"
              />
            </div>
            {/* 누적 봉사자 수 카드 */}
            <div className="flex flex-1 items-start justify-between gap-6 rounded-[20px] bg-kpi-gray px-6 py-5">
              <div className="flex flex-col gap-1 text-[#343434]">
                <p className="text-[20px] font-semibold">누적 봉사자 수</p>
                <p className="text-[52px] font-bold leading-none tabular-nums">
                  45,217명+
                </p>
              </div>
              <div className="flex items-end gap-[30px] self-end">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-graph-icon.svg"
                  alt=""
                  width={84}
                  height={84}
                  aria-hidden
                  className="size-[84px]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-star-icon.svg"
                  alt=""
                  width={83}
                  height={83}
                  aria-hidden
                  className="size-[83px]"
                />
              </div>
            </div>
          </div>

          {/* 하단 Wrap */}
          <div className="flex flex-1 items-stretch gap-4">
            {/* 좌측 (607px): 봉사 기간 + 노란 Sow Good + 봉사활동 횟수 */}
            <div className="flex w-[607px] shrink-0 flex-col gap-4">
              <div className="flex gap-4">
                {/* 누적 봉사 기간 */}
                <div className="flex flex-1 flex-col justify-between rounded-[20px] bg-kpi-gray px-[30px] py-5 text-[#343434]">
                  <p className="text-[20px] font-semibold">누적 봉사 기간</p>
                  <p className="text-[45px] font-bold leading-none tabular-nums">
                    38년 5개월
                  </p>
                </div>
                {/* 노란 Sow Good 카드 */}
                <div className="flex flex-1 items-center justify-center rounded-[20px] bg-kpi-yellow">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                  <img
                    src="/icons/kpi-yellow-card-wordmark.svg"
                    alt="Sow Good"
                    width={204}
                    height={49}
                    className="h-auto w-[204px]"
                  />
                </div>
              </div>
              {/* 봉사활동 횟수 */}
              <div className="flex flex-1 flex-col justify-end gap-6 rounded-[20px] bg-kpi-lime px-6 py-5 text-[#3B4700]">
                <p className="text-[20px] font-semibold">봉사활동 횟수</p>
                <div className="flex items-end justify-between">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                  <img
                    src="/icons/kpi-lime-card-illustration.svg"
                    alt=""
                    width={172}
                    height={172}
                    aria-hidden
                    className="size-[172px]"
                  />
                  <p className="text-[52px] font-bold tabular-nums">3,614회+</p>
                </div>
              </div>
            </div>

            {/* 우측 (flex-1): 도움 가정 수 보라 카드 */}
            <div className="relative flex flex-1 flex-col gap-10 overflow-hidden rounded-[20px] bg-brand-bright">
              <div className="px-6 py-5">
                <p className="text-[20px] font-semibold text-white">
                  도움을 주게 된 가정 수
                </p>
                <p className="text-[42px] font-bold tabular-nums text-white">
                  80,257개+
                </p>
              </div>
              <div className="relative h-[423px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-purple-card-vector.svg"
                  alt=""
                  width={285}
                  height={422}
                  aria-hidden
                  className="absolute left-[51px] top-[22px] h-[422px] w-[285px]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo */}
                <img
                  src="/images/kpi-purple-card-photo.png"
                  alt=""
                  width={366}
                  height={423}
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
