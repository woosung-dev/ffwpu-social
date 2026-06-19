// 사용자 랜딩 KPI 섹션 — Figma discrete 구간별 고정(base/md768/lg1024/wide1440). 유동 vw 스케일 0. 좌 헤딩 + 우 대시보드 비대칭 벤토. DB kpi_metrics props — 운영자 어드민 갱신
import { SectionContainer } from "@/client/components/layout";
import { formatKpiDisplay } from "@/features/kpi/format";

type Props = {
  metricsBySlug: ReadonlyMap<
    string,
    {
      label: string;
      sublabel: string | null;
      value: number | null;
      displayValue: string;
      unit: string | null;
    }
  >;
};

// 운영자가 비활성·미입력해도 카드 모양 유지 — slug 기반 안전 조회. 숫자 우선: 숫자+단위 자동, 없으면 표시값.
function pickDisplay(
  m: Props["metricsBySlug"],
  slug: string,
  fallback: string,
): string {
  const row = m.get(slug);
  if (!row) return fallback;
  return formatKpiDisplay(row.value, row.unit, row.displayValue, fallback);
}

// DB 라벨/서브라벨 — 운영자 어드민 편집분 노출(가정수 카드). 미입력 시 fallback.
function pickLabel(
  m: Props["metricsBySlug"],
  slug: string,
  fallback: string,
): string {
  return m.get(slug)?.label || fallback;
}

function pickSublabel(m: Props["metricsBySlug"], slug: string): string | null {
  return m.get(slug)?.sublabel ?? null;
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

// 섹션 셸(배경+세로 패딩) — Figma Contents y-offset 44/58/90/96 의 4px 그리드 스냅(±2px, 스윕 허용오차 내).
// page.tsx Suspense 스켈레톤과 동기 유지를 위해 export 공유.
export const KPI_SECTION_SHELL =
  "w-full bg-white py-11 md:py-14 lg:py-22 wide:py-24";

export function KpiSection({ metricsBySlug }: Props) {
  const volunteerCount = pickDisplay(metricsBySlug, "volunteer_count", "—");
  const volunteerPeriod = pickDisplay(metricsBySlug, "volunteer_period", "—");
  const eventCount = pickDisplay(metricsBySlug, "event_count", "—");
  const helpedHousehold = pickDisplay(
    metricsBySlug,
    "helped_household_count",
    "—",
  );
  // 카드 제목 — 4개 모두 DB 라벨(어드민 편집) 반영. 미입력 시 Figma 기본 카피 fallback.
  const volunteerCountLabel = pickLabel(
    metricsBySlug,
    "volunteer_count",
    "누적 봉사자 수",
  );
  const volunteerPeriodLabel = pickLabel(
    metricsBySlug,
    "volunteer_period",
    "누적 봉사 기간",
  );
  const eventCountLabel = pickLabel(metricsBySlug, "event_count", "봉사활동 횟수");
  // 가정수 카드 — DB 라벨(어드민 편집) + 작은 서브라벨. 미입력 시 기본 카피.
  const householdLabel = pickLabel(
    metricsBySlug,
    "helped_household_count",
    "행복응원 가정수",
  );
  const householdSublabel = pickSublabel(metricsBySlug, "helped_household_count");
  return (
    <section
      aria-labelledby="kpi-heading"
      className={KPI_SECTION_SHELL}
    >
      {/* 섹션 방향: base/md/lg column · wide row(헤딩 좌 | 대시보드 우). 헤딩↔대시보드 gap = 30/40/40/70 (discrete) */}
      {/* 헤더 클릭 착지(ADR-038): id 를 콘텐츠 래퍼에 둬 상단 패딩을 헤더 뒤로 흡수 → "숫자로 보는…" 헤딩이 헤더 아래 호흡 간격(16/20/24)으로 착지 */}
      <SectionContainer
        id="kpi"
        className="flex scroll-mt-4 flex-col gap-[30px] md:scroll-mt-5 md:gap-10 lg:scroll-mt-6 wide:flex-row wide:items-start wide:gap-[70px]"
      >
        {/* 좌측 헤딩 — base 중앙정렬, md+ 좌측. wide(1440)만 251px 좌측 사이드.
            wide 한정 섹션 내 스티키: 우측 대시보드(760)가 뷰포트보다 길 때 헤딩이 헤더 아래(--sticky-top=112)에 핀 → 섹션 하단서 해제(earthrap 지구랩 인터랙션). 부모 wide:items-start 가 전제. 헤딩↔본문 gap = 6/6/6/16 */}
        <div
          data-fid="kpi-heading"
          className="flex flex-col gap-1.5 text-center text-surface-dark md:text-left wide:sticky wide:top-[var(--sticky-top)] wide:w-[251px] wide:shrink-0 wide:gap-4 wide:self-start"
        >
          <h2
            id="kpi-heading"
            className="text-[22px] font-bold leading-[1.3] md:text-[36px]"
          >
            {/* <wide: 풀폭 자연 줄바꿈 · wide+: 좁은 251 컬럼 강제 2줄 */}
            숫자로 보는{" "}
            <br className="hidden wide:block" />
            우리의 변화
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
              data-reveal
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
              data-reveal
              className="relative flex min-w-0 flex-1 flex-col justify-center gap-[2px] overflow-hidden rounded-[12px] bg-kpi-gray px-[14px] py-3 text-ink-strong-mid md:gap-1 md:rounded-[20px] md:px-6 md:py-5"
            >
              <p className="text-[14px] font-semibold md:text-[22px]">
                {volunteerCountLabel}
              </p>
              <p className="whitespace-nowrap text-[26px] font-bold leading-none tabular-nums md:text-[42px]">
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
                {/* 누적 봉사 기간 — Figma 375 px≈18 py≈12(값 우정렬) / 768 px30 py20(값 좌정렬).
                    폭 산식: 375 셀 199−36=163 ≥ "38년 5개월" 24px ≈117 OK / 768 셀 200−60=140 vs 30px ≈141~147 — 경계(아래 [확인 필요]) */}
                <div
                  data-fid="card-volunteer-period"
                  data-reveal
                  className="flex flex-col justify-between gap-3 rounded-[12px] bg-kpi-gray px-[18px] py-3 text-ink-strong-mid md:rounded-[20px] md:px-[30px] md:py-5"
                >
                  <p className="text-[14px] font-semibold md:text-[22px]">
                    {volunteerPeriodLabel}
                  </p>
                  <p className="whitespace-nowrap text-right text-[26px] font-bold leading-none tabular-nums md:text-left md:text-[32px]">
                    {volunteerPeriod}
                  </p>
                </div>
                <div
                  data-fid="card-sowgood"
                  data-reveal
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
                data-reveal
                className="flex flex-1 flex-col justify-between gap-2 overflow-hidden rounded-[12px] bg-kpi-lime px-[14px] py-3 text-ink-on-lime md:rounded-[20px] md:px-6 md:py-5"
              >
                <p className="text-[14px] font-semibold md:text-[22px]">
                  {eventCountLabel}
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
                  <p className="whitespace-nowrap text-[26px] font-bold tabular-nums md:text-[42px]">
                    {eventCount}
                  </p>
                </div>
              </div>
            </div>

            <div
              data-fid="card-helped-household"
              data-reveal
              className="relative flex flex-1 flex-col gap-4 overflow-hidden rounded-[12px] bg-brand-bright md:rounded-[20px]"
            >
              <div className="px-[14px] pt-3 md:px-6 md:pt-5">
                <p className="break-keep text-[14px] font-semibold text-white md:text-[22px]">
                  {householdLabel}
                </p>
                {householdSublabel ? (
                  <p className="break-keep text-[11px] font-medium text-white/85 md:text-[14px]">
                    {householdSublabel}
                  </p>
                ) : null}
                {/* 값 = 22/34 (흰색). 768 '개+' 줄바꿈 방지 nowrap */}
                <p className="whitespace-nowrap text-[22px] font-bold leading-tight tabular-nums text-white md:text-[34px]">
                  {helpedHousehold}
                </p>
              </div>
              {/* 인물 컷아웃 사진: **absolute** 바닥중앙 앵커(카드 폭 영향無). 밴드 375~767 은 표시 높이 고정(폭 176 고정·-bottom-42 로 머리가 상단 값 텍스트 아래로 내려와 겹침 방지)·중앙정렬 — 카드가 넓어져도 인물 크기 불변. md(768~1023, h392)는 255·바닥 overhang. object-cover object-bottom 으로 투명상단 크롭. personOutline drop-shadow 유지 */}
              <div className="absolute -bottom-[42px] left-1/2 aspect-[176/203] w-[176px] max-w-none -translate-x-1/2 md:aspect-[297/343] md:-bottom-[45px] md:w-[255px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo */}
                <img
                  src="/images/kpi-purple-card-photo.png"
                  alt=""
                  width={366}
                  height={423}
                  aria-hidden
                  style={{ filter: personOutline(2) }}
                  className="absolute inset-0 h-full w-full object-cover object-bottom"
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
              data-reveal
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
              data-reveal
              className="flex flex-1 items-start justify-between gap-6 rounded-[20px] bg-kpi-gray px-6 py-5"
            >
              <div className="flex flex-col gap-1 text-ink-strong-mid">
                <p className="text-[22px] font-semibold">{volunteerCountLabel}</p>
                <p className="text-[54px] font-bold leading-none tabular-nums">
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
                {/* 누적 봉사 기간 — Figma px30 py20 복원. 폭 산식: 셀 295.5−60=235.5 ≥ "38년 5개월" 45px ≈211 — 현 데이터 오버플로 없음. label 20 / value 45 */}
                <div
                  data-fid="card-volunteer-period"
                  data-reveal
                  className="flex flex-col justify-between rounded-[20px] bg-kpi-gray px-[30px] py-5 text-ink-strong-mid"
                >
                  <p className="text-[22px] font-semibold">{volunteerPeriodLabel}</p>
                  <p className="whitespace-nowrap text-[47px] font-bold leading-none tabular-nums">
                    {volunteerPeriod}
                  </p>
                </div>
                {/* 노란 Sow Good 카드 — 로고 204 */}
                <div
                  data-fid="card-sowgood"
                  data-reveal
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
                data-reveal
                className="flex flex-1 flex-col justify-between gap-[31px] rounded-[20px] bg-kpi-lime px-6 py-5 text-ink-on-lime"
              >
                <p className="text-[22px] font-semibold">{eventCountLabel}</p>
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
                  <p className="whitespace-nowrap text-[54px] font-bold tabular-nums">
                    {eventCount}
                  </p>
                </div>
              </div>
            </div>

            {/* 우측: 도움 가정 수 보라 카드. lg↑ flex-1(잔여폭 — lg 282 / wide 256), 높이 Row2 518. label 20 / value 42 */}
            <div
              data-fid="card-helped-household"
              data-reveal
              className="relative flex w-full flex-col gap-4 overflow-hidden rounded-[20px] bg-brand-bright lg:flex-1 wide:gap-10"
            >
              <div className="px-6 py-5">
                <p className="text-[22px] font-semibold text-white">
                  {householdLabel}
                </p>
                {householdSublabel ? (
                  <p className="text-[14px] font-medium text-white/85">
                    {householdSublabel}
                  </p>
                ) : null}
                <p className="whitespace-nowrap text-[44px] font-bold tabular-nums text-white">
                  {helpedHousehold}
                </p>
              </div>
              {/* 인물 컷아웃 사진: object-cover object-bottom(자산 0.746 < 프레임0.865 → 가로주도 cover·투명상단 바닥앵커로 프레임 밖, 박스 하단만 overhang → overflow-hidden 바닥 클립). **absolute** 라 카드 폭(flex-1=256/282)에 영향無(in-flow 면 프레임 폭이 대시보드 폭 밀어 910 으로 깨짐). 바닥중앙 앵커·-bottom overhang. personOutline drop-shadow 유지 */}
              <div className="absolute bottom-0 left-1/2 aspect-[366/423] w-[335px] max-w-none -translate-x-1/2 translate-y-[40px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo */}
                <img
                  src="/images/kpi-purple-card-photo.png"
                  alt=""
                  width={366}
                  height={423}
                  aria-hidden
                  style={{ filter: personOutline(3) }}
                  className="absolute inset-0 h-full w-full object-cover object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
