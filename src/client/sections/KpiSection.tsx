// 사용자 랜딩 KPI 섹션 — Figma 96:7773 (1440×952). 좌측 251px 헤딩 + gap-70 + 우측 dashboard 760px 비대칭 그리드. DB kpi_metrics props (PR B) — 운영자 어드민 갱신 (PR C)
import { SectionContainer } from "@/client/components/layout";

type Props = {
  metricsBySlug: ReadonlyMap<
    string,
    { label: string; displayValue: string; unit: string | null }
  >;
};

// 운영자가 비활성·미입력해도 카드 모양 유지 — slug 기반 안전 조회
function pickDisplay(
  m: Props["metricsBySlug"],
  slug: string,
  fallback: string,
): string {
  return m.get(slug)?.displayValue ?? fallback;
}

export function KpiSection({ metricsBySlug }: Props) {
  const volunteerCount = pickDisplay(metricsBySlug, "volunteer_count", "—");
  const volunteerPeriod = pickDisplay(metricsBySlug, "volunteer_period", "—");
  const eventCount = pickDisplay(metricsBySlug, "event_count", "—");
  const helpedHousehold = pickDisplay(
    metricsBySlug,
    "helped_household_count",
    "—",
  );
  return (
    <section id="kpi" className="w-full bg-white py-16 lg:py-24">
      <SectionContainer className="flex flex-col gap-10 wide:flex-row wide:items-start wide:gap-[clamp(40px,5vw,70px)]">
        {/* 좌측 헤딩 — Figma 1024~1439 는 stacked(헤딩 top 풀폭), 1440(wide)만 251px 좌측 사이드. 375 는 중앙정렬 */}
        <div className="flex flex-col gap-4 text-center text-surface-dark md:text-left wide:w-[clamp(216px,18vw,251px)] wide:shrink-0">
          <h2 className="text-2xl font-bold leading-[1.3] md:text-3xl lg:text-[36px]">
            {/* <wide: 풀폭 자연 줄바꿈 · wide+: 좁은 251 컬럼 강제 2줄 */}
            한 해동안{" "}
            <br className="hidden wide:block" />
            만들어낸 변화
          </h2>
          <p className="text-base font-medium leading-[1.5] text-pretty">
            가정연합은 도움이 필요한 사람들에게 오랜기간 손을 건네왔습니다.
            앞으로도 변함없이 온기를 전하겠습니다.
          </p>
        </div>

        {/* 모바일·태블릿 (<1024): Figma 벤토 유동 복원 — 데스크탑 블록(lg:flex)과 상호배타(lg:hidden). 고정폭→clamp/%/aspect 로 375~1023 가로 오버플로 0. 데코는 좁은 폭(<640) 숨김, 하단 블록은 640↑ 좌우 배치(Figma 768) */}
        <div className="flex w-full flex-col gap-4 lg:hidden">
          {/* 상단: 보라 스마일 + 누적 봉사자 수(+데코) */}
          <div className="flex gap-4">
            <div className="flex flex-[0.62] items-center justify-center rounded-[20px] bg-brand-bright py-[clamp(20px,5vw,40px)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img
                src="/icons/kpi-smile-illustration.svg"
                alt=""
                width={121}
                height={86}
                aria-hidden
                className="h-auto w-[clamp(72px,16vw,121px)]"
              />
            </div>
            <div className="flex flex-1 items-center justify-between gap-3 rounded-[20px] bg-kpi-gray px-[clamp(16px,3.2vw,24px)] py-5 text-ink-strong-mid">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-[clamp(14px,3.2vw,20px)] font-semibold">
                  누적 봉사자 수
                </p>
                <p className="text-[clamp(26px,6vw,40px)] font-bold leading-none tabular-nums">
                  {volunteerCount}
                </p>
              </div>
              {/* 데코(그래프+별): 640↑ 만 노출 — 좁은 폭 가로 오버플로 방지 */}
              <div className="hidden shrink-0 items-center gap-[clamp(8px,2vw,20px)] sm:flex">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-graph-icon.svg"
                  alt=""
                  width={84}
                  height={84}
                  aria-hidden
                  className="size-[clamp(40px,7vw,72px)]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-star-icon.svg"
                  alt=""
                  width={83}
                  height={83}
                  aria-hidden
                  className="size-[clamp(40px,7vw,72px)]"
                />
              </div>
            </div>
          </div>

          {/* 하단: 좌 칼럼(봉사 기간·Sow Good·봉사 횟수) + 우 사진 카드. 전 sub-lg 좌우 2열(Figma 768·375 동일 구조). Sow Good 은 640↑ 만(Figma 375 는 생략) */}
          <div className="flex gap-3 sm:gap-4">
            <div className="flex flex-[1.6] flex-col gap-3 sm:gap-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex flex-1 flex-col justify-between gap-3 rounded-[20px] bg-kpi-gray px-[clamp(16px,3.2vw,24px)] py-5 text-ink-strong-mid">
                  <p className="text-[clamp(14px,3.2vw,20px)] font-semibold">
                    누적 봉사 기간
                  </p>
                  <p className="text-[clamp(22px,4vw,40px)] font-bold leading-none tabular-nums">
                    {volunteerPeriod}
                  </p>
                </div>
                <div className="hidden flex-1 items-center justify-center rounded-[20px] bg-kpi-yellow py-[clamp(16px,4vw,28px)] sm:flex">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                  <img
                    src="/icons/kpi-yellow-card-wordmark.svg"
                    alt="Sow Good"
                    width={204}
                    height={49}
                    className="h-auto w-[clamp(104px,42%,204px)]"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end gap-4 rounded-[20px] bg-kpi-lime px-[clamp(16px,3.2vw,24px)] py-5 text-ink-on-lime">
                <p className="text-[clamp(14px,3.2vw,20px)] font-semibold">
                  봉사활동 횟수
                </p>
                <div className="flex items-end justify-between gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                  <img
                    src="/icons/kpi-lime-card-illustration.svg"
                    alt=""
                    width={172}
                    height={172}
                    aria-hidden
                    className="size-[clamp(48px,15vw,172px)]"
                  />
                  <p className="text-[clamp(22px,5.5vw,52px)] font-bold tabular-nums">
                    {eventCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex flex-1 flex-col gap-4 overflow-hidden rounded-[20px] bg-brand-bright">
              <div className="px-[clamp(16px,3.2vw,24px)] pt-5">
                <p className="text-[clamp(14px,3.2vw,20px)] font-semibold text-white">
                  도움을 주게 된 가정 수
                </p>
                <p className="text-[clamp(16px,4.8vw,40px)] font-bold leading-tight tabular-nums text-white">
                  {helpedHousehold}
                </p>
              </div>
              <div className="relative min-h-[clamp(170px,40vw,280px)] flex-1">
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

        {/* 데스크탑 벤토(lg↑, 1024↑): Figma Dashboard 비대칭 그리드. 1024~1439 는 헤딩 아래 풀폭 stacked, wide(1440)↑ 는 우측 컬럼. 고정폭 데코가 1023↓ 오버플로라 lg↑ 한정 */}
        <div className="hidden flex-1 flex-col gap-4 lg:flex wide:h-[760px]">
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
              <div className="flex flex-col gap-1 text-ink-strong-mid">
                <p className="text-[20px] font-semibold">누적 봉사자 수</p>
                <p className="text-[52px] font-bold leading-none tabular-nums">
                  {volunteerCount}
                </p>
              </div>
              {/* 장식(그래프+별) — 1024↑ 풀폭 stacked 라 회색 카드 넓어 노출 가능(Figma 정합). 1023↓ 만 숨김 */}
              <div className="hidden items-end gap-[30px] self-end lg:flex">
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

          {/* 하단 Wrap — lg↑ 좌/우 가로 (Figma 데스크탑). content max-w-1200 캡이라 flex-[2.4]:1 ≈ Figma 607:256 비율, 1440 좌블록 ≈607px 재현 */}
          <div className="flex flex-1 flex-col items-stretch gap-4 lg:flex-row">
            {/* 좌측: 봉사 기간 + 노란 Sow Good + 봉사활동 횟수. Figma 좌:우 ≈ 2.4:1 (좌블록 ≈607px) */}
            <div className="flex w-full flex-col gap-4 lg:flex-[2.4]">
              <div className="flex gap-4">
                {/* 누적 봉사 기간 */}
                <div className="flex flex-1 flex-col justify-between rounded-[20px] bg-kpi-gray px-6 py-5 text-ink-strong-mid xl:px-[30px]">
                  <p className="text-[20px] font-semibold">누적 봉사 기간</p>
                  <p className="text-[clamp(26px,3.1vw,45px)] font-bold leading-none tabular-nums">
                    {volunteerPeriod}
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
              <div className="flex flex-1 flex-col justify-end gap-6 rounded-[20px] bg-kpi-lime px-6 py-5 text-ink-on-lime">
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
                  <p className="text-[clamp(36px,4vw,52px)] font-bold tabular-nums">
                    {eventCount}
                  </p>
                </div>
              </div>
            </div>

            {/* 우측: 도움 가정 수 보라 카드. lg↑ flex-1, 그 아래는 full-width */}
            <div className="relative flex w-full flex-col gap-10 overflow-hidden rounded-[20px] bg-brand-bright lg:flex-1">
              <div className="px-6 py-5">
                <p className="text-[20px] font-semibold text-white">
                  도움을 주게 된 가정 수
                </p>
                <p className="text-[40px] font-bold whitespace-nowrap tabular-nums text-white">
                  {helpedHousehold}
                </p>
              </div>
              <div className="relative h-[clamp(280px,26vw,360px)] wide:h-[423px]">
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
      </SectionContainer>
    </section>
  );
}
