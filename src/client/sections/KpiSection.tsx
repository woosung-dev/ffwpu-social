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
    <section
      id="kpi"
      aria-labelledby="kpi-heading"
      className="w-full bg-white py-16 lg:py-24"
    >
      <SectionContainer className="flex flex-col gap-[30px] md:gap-10 wide:flex-row wide:items-start wide:gap-[clamp(40px,5vw,70px)]">
        {/* 좌측 헤딩 — Figma 1024~1439 는 stacked(헤딩 top 풀폭), 1440(wide)만 251px 좌측 사이드. 375 는 중앙정렬. 헤딩↔대시보드 gap = 375:30 / 768·1025:40 / 1440:70 */}
        <div
          data-fid="kpi-heading"
          className="flex flex-col gap-4 text-center text-surface-dark md:text-left wide:w-[clamp(216px,18vw,251px)] wide:shrink-0"
        >
          <h2
            id="kpi-heading"
            className="text-2xl font-bold leading-[1.3] md:text-3xl lg:text-[36px]"
          >
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

        {/* 모바일·태블릿 (<1024): Figma 벤토 유동 복원 — 데스크탑 블록(lg:flex)과 상호배타(lg:hidden). 고정폭→clamp/%/aspect 로 375~1023 가로 오버플로 0. 데코는 좁은 폭(<640) 숨김, 하단 블록은 640↑ 좌우 배치(Figma 768). Sow Good 은 640↑(Figma 375 export 미노출). 거터 375≈6·768≈10(gap-1.5 md:gap-2.5), Row gap 동일 */}
        <div
          data-fid="kpi-dashboard"
          className="flex w-full flex-col gap-1.5 md:gap-2.5 lg:hidden"
        >
          {/* 상단 Row1: 보라 스마일 + 누적 봉사자 수(+데코). h 375:115 / 768:180 */}
          <div data-fid="kpi-row1" className="flex h-[115px] gap-1.5 md:h-[180px] md:gap-2.5">
            <div
              data-fid="card-smile"
              className="flex w-[115px] shrink-0 items-center justify-center rounded-[20px] bg-brand-bright py-[clamp(20px,5vw,40px)] md:w-[200px]"
            >
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
            <div
              data-fid="card-volunteer-count"
              className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-[20px] bg-kpi-gray px-[clamp(16px,3.2vw,24px)] py-5 text-ink-strong-mid"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-[clamp(14px,3.2vw,20px)] font-semibold">
                  누적 봉사자 수
                </p>
                <p className="text-[clamp(20px,6vw,40px)] font-bold leading-none tabular-nums">
                  {volunteerCount}
                </p>
              </div>
              {/* 데코(그래프+별): 전 BP 노출(Figma 99:7026 375 포함). 375 는 작게(24~) 줄여 222px 카드 가로 오버플로 0 */}
              <div className="flex shrink-0 items-center gap-[clamp(4px,1.5vw,20px)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-graph-icon.svg"
                  alt=""
                  width={84}
                  height={84}
                  aria-hidden
                  className="size-[clamp(24px,7vw,72px)]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-star-icon.svg"
                  alt=""
                  width={83}
                  height={83}
                  aria-hidden
                  className="size-[clamp(24px,7vw,72px)]"
                />
              </div>
            </div>
          </div>

          {/* 하단 Row2: 좌 칼럼(봉사 기간·Sow Good·봉사 횟수) + 우 사진 카드. 전 sub-lg 좌우 2열(Figma 768·375 동일 구조). Sow Good 은 640↑ 만(Figma 375 는 생략). h 375:232 / 768:392, 좌:우 = 375≈1.44:1 / 768≈1.8:1 */}
          <div data-fid="kpi-row2" className="flex h-[232px] gap-1.5 md:h-[392px] md:gap-2.5">
            <div className="flex flex-[1.442] flex-col gap-1.5 md:flex-[1.798] md:gap-2.5">
              {/* 상단 sub-row(봉사기간[+SowGood]): h 375:106 / 768:180. 봉사횟수가 잔여 흡수.
                  grid 로 강제 균등 분할 — 375 는 SowGood hidden 이라 cols-1(봉사기간 풀폭 199), sm+ cols-2(각 200) */}
              <div className="grid h-[106px] shrink-0 grid-cols-1 gap-1.5 sm:grid-cols-2 md:h-[180px] md:gap-2.5">
                <div
                  data-fid="card-volunteer-period"
                  className="flex flex-col justify-between gap-3 rounded-[20px] bg-kpi-gray pl-[16px] py-5 text-ink-strong-mid"
                >
                  <p className="text-[clamp(14px,3.2vw,20px)] font-semibold">
                    누적 봉사 기간
                  </p>
                  <p className="text-[clamp(22px,4vw,40px)] font-bold leading-none whitespace-nowrap tabular-nums">
                    {volunteerPeriod}
                  </p>
                </div>
                <div
                  data-fid="card-sowgood"
                  className="hidden items-center justify-center rounded-[20px] bg-kpi-yellow py-[clamp(16px,4vw,28px)] sm:flex"
                >
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
              <div
                data-fid="card-event-count"
                className="flex flex-1 flex-col justify-between gap-2 overflow-hidden rounded-[20px] bg-kpi-lime px-[clamp(16px,3.2vw,24px)] py-5 text-ink-on-lime"
              >
                <p className="text-[clamp(14px,3.2vw,20px)] font-semibold">
                  봉사활동 횟수
                </p>
                {/* 일러스트 좌하단 + 값 우하단(Figma): label top / value-row bottom */}
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

            <div
              data-fid="card-helped-household"
              className="relative flex flex-1 flex-col gap-4 overflow-hidden rounded-[20px] bg-brand-bright"
            >
              <div className="px-[clamp(16px,3.2vw,24px)] pt-5">
                <p className="text-[clamp(14px,3.2vw,20px)] font-semibold break-keep text-white">
                  도움을 주게 된 가정 수
                </p>
                {/* 768 에서 '개+' 줄바꿈 방지 — 228px 카드에 1줄(≤26px) + whitespace-nowrap */}
                <p className="text-[clamp(16px,3.3vw,26px)] font-bold leading-tight whitespace-nowrap tabular-nums text-white">
                  {helpedHousehold}
                </p>
              </div>
              {/* Row2 고정높이 안에서 사진이 잔여 흡수(375:~162 / 768:~322) */}
              <div className="relative flex-1">
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

        {/* 데스크탑 벤토(lg↑, 1024↑): Figma Dashboard 비대칭 그리드. 1024~1439 는 헤딩 아래 풀폭 stacked, wide(1440)↑ 는 우측 컬럼. 고정폭 데코가 1023↓ 오버플로라 lg↑ 한정. h760 고정은 lg·wide 동일(Row1 226 / gap16 / Row2 518). flex-1 은 wide(flex-row)에서만 — lg(flex-col)에선 세로축 지배로 h-760 붕괴되므로 wide:flex-1 */}
        <div
          data-fid="kpi-dashboard"
          className="hidden flex-col gap-4 lg:flex lg:h-[760px] wide:flex-1"
        >
          {/* 상단 Wrap — Figma Row1 h226 고정(lg·wide 동일). content height 로 collapse 방지 */}
          <div data-fid="kpi-row1" className="flex gap-4 lg:h-[226px]">
            {/* 보라 캐릭터 카드 */}
            <div
              data-fid="card-smile"
              className="flex w-[293px] shrink-0 items-center justify-center rounded-[20px] bg-brand-bright"
            >
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
            <div
              data-fid="card-volunteer-count"
              className="flex flex-1 items-start justify-between gap-6 rounded-[20px] bg-kpi-gray px-6 py-5"
            >
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

          {/* 하단 Wrap — lg↑ 좌/우 가로 (Figma 데스크탑). Row2 = flex-1(→518). 좌블록 607 고정 + 우블록 flex-1 → lg(905)=607:282 · wide(879)=607:256 정확 재현 */}
          <div data-fid="kpi-row2" className="flex flex-1 flex-col items-stretch gap-4 lg:flex-row">
            {/* 좌측: 봉사 기간 + 노란 Sow Good + 봉사활동 횟수. Figma 좌블록 607px 고정 */}
            <div className="flex w-full flex-col gap-4 lg:w-[607px] lg:shrink-0">
              {/* sub-row(봉사기간+SowGood): Figma h225 고정 → event-count(flex-1)=518−225−16=277. grid-cols-2 로 강제 균등 분할(각 (607−16)/2=295.5) — flex+min-w-0 는 콘텐츠로 치우쳐 실패 */}
              <div className="grid grid-cols-2 gap-4 lg:h-[225px]">
                {/* 누적 봉사 기간 — Figma 값이 우측 끝까지 채움 → pl-only(대칭 px-30 은 295.5 셀 오버플로) */}
                <div
                  data-fid="card-volunteer-period"
                  className="flex flex-col justify-between rounded-[20px] bg-kpi-gray pl-[30px] py-5 text-ink-strong-mid"
                >
                  <p className="text-[20px] font-semibold">누적 봉사 기간</p>
                  <p className="text-[45px] font-bold leading-none whitespace-nowrap tabular-nums">
                    {volunteerPeriod}
                  </p>
                </div>
                {/* 노란 Sow Good 카드 */}
                <div
                  data-fid="card-sowgood"
                  className="flex items-center justify-center rounded-[20px] bg-kpi-yellow"
                >
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
              {/* 봉사활동 횟수 — Figma: label top-left / 일러스트 좌하단 + 값 우하단 → justify-between */}
              <div
                data-fid="card-event-count"
                className="flex flex-1 flex-col justify-between gap-[31px] rounded-[20px] bg-kpi-lime px-6 py-5 text-ink-on-lime"
              >
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
                  <p className="text-[52px] font-bold tabular-nums">
                    {eventCount}
                  </p>
                </div>
              </div>
            </div>

            {/* 우측: 도움 가정 수 보라 카드. lg↑ flex-1(잔여폭 흡수 — lg 282 / wide 256), 높이 Row2 518 채움 */}
            <div
              data-fid="card-helped-household"
              className="relative flex w-full flex-col gap-4 overflow-hidden rounded-[20px] bg-brand-bright lg:flex-1 wide:gap-10"
            >
              <div className="px-6 py-5">
                <p className="text-[20px] font-semibold text-white">
                  도움을 주게 된 가정 수
                </p>
                <p className="text-[42px] font-bold whitespace-nowrap tabular-nums text-white">
                  {helpedHousehold}
                </p>
              </div>
              <div className="relative min-h-[clamp(240px,22vw,320px)] flex-1">
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
