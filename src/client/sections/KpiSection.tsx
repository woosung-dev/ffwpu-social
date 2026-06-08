// 사용자 랜딩 KPI 섹션 — Figma discrete 구간별 고정(base/md768/lg1024/wide1440). 유동 vw 스케일 0. 좌 헤딩 + 우 대시보드 비대칭 벤토. DB kpi_metrics props — 운영자 어드민 갱신
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

// 도움가정 인물 컷아웃의 흰색 스티커 아웃라인(Figma 96:9919) — alpha 실루엣 따라 8방향 white drop-shadow.
// 자산에 흰 테두리가 없어 CSS 로 구현(어느 크기에서도 실루엣 추종). n=두께(px)
function personOutline(n: number): string {
  return [
    [n, 0],
    [-n, 0],
    [0, n],
    [0, -n],
    [n, n],
    [-n, n],
    [n, -n],
    [-n, -n],
  ]
    .map(([x, y]) => `drop-shadow(${x}px ${y}px 0 #fff)`)
    .join(" ");
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
      {/* 섹션 방향: base/md/lg column · wide row(헤딩 좌 | 대시보드 우). 헤딩↔대시보드 gap = 30/40/40/70 (discrete) */}
      <SectionContainer className="flex flex-col gap-[30px] md:gap-10 wide:flex-row wide:items-start wide:gap-[70px]">
        {/* 좌측 헤딩 — base 중앙정렬, md+ 좌측. wide(1440)만 251px 좌측 사이드. 헤딩↔본문 gap = 6/6/6/16 */}
        <div
          data-fid="kpi-heading"
          className="flex flex-col gap-1.5 text-center text-surface-dark md:text-left wide:w-[251px] wide:shrink-0 wide:gap-4"
        >
          <h2
            id="kpi-heading"
            className="text-[22px] font-bold leading-[1.3] md:text-[36px]"
          >
            {/* <wide: 풀폭 자연 줄바꿈 · wide+: 좁은 251 컬럼 강제 2줄 */}
            한 해동안{" "}
            <br className="hidden wide:block" />
            만들어낸 변화
          </h2>
          <p className="text-[14px] font-medium leading-[1.35] text-pretty md:text-[16px] md:leading-[1.5]">
            가정연합은 도움이 필요한 사람들에게 오랜기간 손을 건네왔습니다.
            앞으로도 변함없이 온기를 전하겠습니다.
          </p>
        </div>

        {/* 모바일·태블릿 (<1024): Figma 벤토. 데스크탑 블록(lg:flex)과 상호배타(lg:hidden). 거터 = 6/10 (gap-1.5 md:gap-2.5), radius = 12/20 (rounded-[12px] md:rounded-[20px]). Sow Good 은 640↑(Figma 375 미노출) */}
        <div
          data-fid="kpi-dashboard"
          className="flex w-full flex-col gap-1.5 md:gap-2.5 lg:hidden"
        >
          {/* 상단 Row1: 보라 스마일 + 누적 봉사자 수(+데코). h 375:115 / 768:180 */}
          <div data-fid="kpi-row1" className="flex h-[115px] gap-1.5 md:h-[180px] md:gap-2.5">
            <div
              data-fid="card-smile"
              className="flex w-[115px] shrink-0 items-center justify-center rounded-[12px] bg-brand-bright md:w-[200px] md:rounded-[20px]"
            >
              {/* 스마일 글리프 폭: base 72 → md+ 121 */}
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img
                src="/icons/kpi-smile-illustration.svg"
                alt=""
                width={121}
                height={86}
                aria-hidden
                className="h-auto w-[72px] md:w-[121px]"
              />
            </div>
            {/* 데코를 absolute(카드 우하단)로 빼서 값(텍스트)이 카드 전폭 1줄 차지 — Figma 처럼 값 1줄 + 데코 우하단 겹침. relative+overflow-hidden 으로 좌측 overhang 클립 */}
            <div
              data-fid="card-volunteer-count"
              className="relative flex min-w-0 flex-1 flex-col justify-center gap-[2px] overflow-hidden rounded-[12px] bg-kpi-gray px-[14px] py-3 text-ink-strong-mid md:gap-1 md:rounded-[20px] md:px-6 md:py-5"
            >
              <p className="text-[12px] font-semibold md:text-[20px]">
                누적 봉사자 수
              </p>
              <p className="whitespace-nowrap text-[24px] font-bold leading-none tabular-nums md:text-[40px]">
                {volunteerCount}
              </p>
              {/* 데코(그래프+별): base 36 → md+ 84/83 (discrete). 카드 우하단 앵커, 값 아래쪽으로 겹침. 데코 간 gap 4(375)/20(768+) */}
              <div className="pointer-events-none absolute bottom-0 right-[14px] flex items-end gap-1 md:right-6 md:gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-graph-icon.svg"
                  alt=""
                  width={84}
                  height={84}
                  aria-hidden
                  className="size-9 md:size-[84px]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                <img
                  src="/icons/kpi-star-icon.svg"
                  alt=""
                  width={83}
                  height={83}
                  aria-hidden
                  className="size-9 md:size-[83px]"
                />
              </div>
            </div>
          </div>

          {/* 하단 Row2: 좌 칼럼(봉사 기간·[md+ Sow Good]·봉사 횟수) + 우 사진 카드. Figma 375~767 밴드는 5카드 연속(Sow Good·grid·도움가정확장 reflow 는 768=md 경계에서만). 좌칼럼 199 고정·도움가정 stretch(138→524). h 375:232 / 768:392 */}
          <div data-fid="kpi-row2" className="flex h-[232px] gap-1.5 md:h-[392px] md:gap-2.5">
            <div className="flex w-[199px] shrink-0 flex-col gap-1.5 md:w-auto md:flex-[1.798] md:gap-2.5">
              {/* 상단 sub-row(봉사기간[+SowGood]): h 375:106 / 768:180. 375~767 cols-1(풀폭 199, Sow Good 미노출), md+ cols-2(각 200). 봉사횟수가 잔여 흡수 */}
              <div className="grid h-[106px] shrink-0 grid-cols-1 gap-1.5 md:h-[180px] md:grid-cols-2 md:gap-2.5">
                <div
                  data-fid="card-volunteer-period"
                  className="flex flex-col justify-between gap-3 rounded-[12px] bg-kpi-gray py-3 pl-[14px] text-ink-strong-mid md:rounded-[20px] md:py-5 md:pl-6"
                >
                  <p className="text-[12px] font-semibold md:text-[20px]">
                    누적 봉사 기간
                  </p>
                  <p className="whitespace-nowrap text-[24px] font-bold leading-none tabular-nums md:text-[30px]">
                    {volunteerPeriod}
                  </p>
                </div>
                <div
                  data-fid="card-sowgood"
                  className="hidden items-center justify-center rounded-[12px] bg-kpi-yellow md:flex md:rounded-[20px]"
                >
                  {/* SowGood 로고: md 138 (lg+ 는 데스크탑 블록에서 204) */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                  <img
                    src="/icons/kpi-yellow-card-wordmark.svg"
                    alt="Sow Good"
                    width={204}
                    height={49}
                    className="h-auto w-[138px]"
                  />
                </div>
              </div>
              <div
                data-fid="card-event-count"
                className="flex flex-1 flex-col justify-between gap-2 overflow-hidden rounded-[12px] bg-kpi-lime px-[14px] py-3 text-ink-on-lime md:rounded-[20px] md:px-6 md:py-5"
              >
                <p className="text-[12px] font-semibold md:text-[20px]">
                  봉사활동 횟수
                </p>
                {/* 일러스트 좌하단 + 값 우하단(Figma): label top / value-row bottom. 값 = 24/40 + nowrap(전 BP 1줄) */}
                <div className="flex items-end justify-between gap-2">
                  {/* 데코 일러스트: base 48 → md+ 121 (discrete) */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
                  <img
                    src="/icons/kpi-lime-card-illustration.svg"
                    alt=""
                    width={172}
                    height={172}
                    aria-hidden
                    className="size-12 md:size-[121px]"
                  />
                  <p className="whitespace-nowrap text-[24px] font-bold tabular-nums md:text-[40px]">
                    {eventCount}
                  </p>
                </div>
              </div>
            </div>

            <div
              data-fid="card-helped-household"
              className="relative flex flex-1 flex-col gap-4 overflow-hidden rounded-[12px] bg-brand-bright md:rounded-[20px]"
            >
              <div className="px-[14px] pt-3 md:px-6 md:pt-5">
                <p className="break-keep text-[12px] font-semibold text-white md:text-[20px]">
                  도움을 주게 된 가정 수
                </p>
                {/* 값 = 20/32 (흰색). 768 '개+' 줄바꿈 방지 nowrap */}
                <p className="whitespace-nowrap text-[20px] font-bold leading-tight tabular-nums text-white md:text-[32px]">
                  {helpedHousehold}
                </p>
              </div>
              {/* 인물 컷아웃 사진: 바닥 중앙 앵커, 자연 비율(object-contain), 바닥 살짝 overhang(음수 bottom). 375~767 밴드는 카드가 stretch(138→524)라 인물도 함께 커짐(이미지-fill, 텍스트 아님): 폭 176→280. md(768~1023, 카드 228 고정)는 297 고정 */}
              <div className="relative flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo */}
                <img
                  src="/images/kpi-purple-card-photo.png"
                  alt=""
                  width={366}
                  height={423}
                  aria-hidden
                  style={{ filter: personOutline(2) }}
                  className="absolute -bottom-[8px] left-1/2 w-[clamp(176px,36.5vw,280px)] max-w-none -translate-x-1/2 object-contain object-bottom md:-bottom-[14px] md:left-auto md:right-0 md:w-[297px] md:translate-x-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 데스크탑 벤토(lg↑, 1024↑): Figma Dashboard 비대칭 그리드. lg(1024~1439) 헤딩 아래 풀폭 stacked, wide(1440)↑ 우측 컬럼. 고정폭 데코가 1023↓ 오버플로라 lg↑ 한정. h760 고정(Row1 226 / gap16 / Row2 518). radius 20 (lg+). flex-1 은 wide(flex-row)에서만 — lg(flex-col)에선 세로축 지배로 h-760 붕괴 */}
        <div
          data-fid="kpi-dashboard"
          className="hidden flex-col gap-4 lg:flex lg:h-[760px] wide:flex-1"
        >
          {/* 상단 Wrap — Figma Row1 h226 고정(lg·wide 동일). 거터 16 (gap-4) */}
          <div data-fid="kpi-row1" className="flex gap-4 lg:h-[226px]">
            {/* 보라 캐릭터 카드 — 폭 293 고정 */}
            <div
              data-fid="card-smile"
              className="flex w-[293px] shrink-0 items-center justify-center rounded-[20px] bg-brand-bright"
            >
              {/* 스마일 글리프 폭 121 */}
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
            {/* 누적 봉사자 수 카드 — 패딩 24/20, label 20 / value 52 */}
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
              {/* 데코(그래프+별) 84/83 — 1024↑ 풀폭이라 회색 카드 넓어 노출 */}
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

          {/* 하단 Wrap — lg↑ 좌/우 가로. Row2 = flex-1(→518). 좌블록 607 고정 + 우블록 flex-1 → lg(905)=607:282 · wide(879)=607:256 */}
          <div data-fid="kpi-row2" className="flex flex-1 flex-col items-stretch gap-4 lg:flex-row">
            {/* 좌측: 봉사 기간 + 노란 Sow Good + 봉사활동 횟수. Figma 좌블록 607px 고정 */}
            <div className="flex w-full flex-col gap-4 lg:w-[607px] lg:shrink-0">
              {/* sub-row(봉사기간+SowGood): Figma h225 고정 → event-count(flex-1)=518−225−16=277. grid-cols-2 강제 균등(각 295.5) */}
              <div className="grid grid-cols-2 gap-4 lg:h-[225px]">
                {/* 누적 봉사 기간 — 값 우측까지 → pl-only(대칭 px-30 은 295.5 셀 오버플로). label 20 / value 45 */}
                <div
                  data-fid="card-volunteer-period"
                  className="flex flex-col justify-between rounded-[20px] bg-kpi-gray py-5 pl-[30px] text-ink-strong-mid"
                >
                  <p className="text-[20px] font-semibold">누적 봉사 기간</p>
                  <p className="whitespace-nowrap text-[45px] font-bold leading-none tabular-nums">
                    {volunteerPeriod}
                  </p>
                </div>
                {/* 노란 Sow Good 카드 — 로고 204 */}
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
              {/* 봉사활동 횟수 — label top-left / 일러스트 좌하단 + 값 우하단. label↔value 31 고정. 값 52 + nowrap */}
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
                  <p className="whitespace-nowrap text-[52px] font-bold tabular-nums">
                    {eventCount}
                  </p>
                </div>
              </div>
            </div>

            {/* 우측: 도움 가정 수 보라 카드. lg↑ flex-1(잔여폭 — lg 282 / wide 256), 높이 Row2 518. label 20 / value 42 */}
            <div
              data-fid="card-helped-household"
              className="relative flex w-full flex-col gap-4 overflow-hidden rounded-[20px] bg-brand-bright lg:flex-1 wide:gap-10"
            >
              <div className="px-6 py-5">
                <p className="text-[20px] font-semibold text-white">
                  도움을 주게 된 가정 수
                </p>
                <p className="whitespace-nowrap text-[42px] font-bold tabular-nums text-white">
                  {helpedHousehold}
                </p>
              </div>
              {/* 인물 컷아웃 사진: 카드 우하단 바닥 앵커, 자연 비율(object-contain), Figma 366px. 바닥이 카드 바닥 살짝 넘어 overhang(음수 bottom) — overflow-hidden 으로 좌측 클립. (Figma 미존재 cream vector 제거) */}
              <div className="relative min-h-[240px] flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo */}
                <img
                  src="/images/kpi-purple-card-photo.png"
                  alt=""
                  width={366}
                  height={423}
                  aria-hidden
                  style={{ filter: personOutline(3) }}
                  className="absolute -bottom-[18px] right-0 w-[366px] max-w-none object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
