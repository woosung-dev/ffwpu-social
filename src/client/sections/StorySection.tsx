// 사용자 랜딩 Story 섹션 — Figma 96:7834 (1440×573). 배경 #FAF4FF, 좌측 이미지 2장 + 우측 TagChip+헤딩+설명+Result 통계. ADR-009 #story 앵커 (쌀나눔 프로젝트 메뉴 매핑). 4 BP: lg+ 좌-우 / 1024↓ 세로 스택. 데코 스티커 BP별 고정 px(이전 % 비율, 비단조 image1 폭 버그 수정)
// 상단 이미지 2장 = 운영자가 /admin/landing 상단 슬롯(story_slot 1~2)에 지정한 글의 대표 이미지(미지정 시 기본 디자인 사진). 클릭 시 해당 소식으로 이동. (R7 — 어드민 큐레이션 공개 반영)
// 통계는 kpi_metrics(section='story') DB 연결 — 운영자가 /admin/landing 에서 입력하거나 쌀나눔 시트에서 자동 동기화(주간).
// 표시는 impact KPI 와 같은 숫자 우선 모델(formatKpiDisplay): 숫자 있으면 "3,210"+단위, 없으면 운영자가 쓴 표시값. 둘 다 비면 hide-when-empty.
import { Fragment } from "react";

import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";
import { STORY_SECTION_CONTENT } from "@/features/landing/constants/story";
import { formatKpiDisplay } from "@/features/kpi/format";
import { cn } from "@/lib/utils";

export type StoryStat = {
  slug: string;
  label: string;
  displayValue: string;
  value: number | null;
  // 숫자 뒤에 붙는 운영자 소유 단위("kg" · "가정" · "개 시설"). 시트 동기화는 value 만 갱신하므로 여기는 안 건드린다.
  unit: string | null;
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
  // 카피 — 운영자가 /admin/landing 에서 편집. 빈값이면 STORY_SECTION_CONTENT 상수 fallback (DB 미시드·미입력 안전)
  tag?: string;
  titleLines?: string[];
  subtitleLines?: string[];
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

export function StorySection({
  stats,
  slots,
  tag,
  titleLines,
  subtitleLines,
}: Props) {
  // 카피 — 운영자 입력값 우선, 빈값이면 코드 상수 fallback
  const content = {
    tag: tag && tag.trim() !== "" ? tag : STORY_SECTION_CONTENT.tag,
    titleLines:
      titleLines && titleLines.length > 0
        ? titleLines
        : STORY_SECTION_CONTENT.titleLines,
    subtitleLines:
      subtitleLines && subtitleLines.length > 0
        ? subtitleLines
        : STORY_SECTION_CONTENT.subtitleLines,
  };
  // hide-when-empty — 숫자도 표시값도 없으면 제외. 전부 숨으면 통계 블록 자체 비노출
  const visibleStats = stats
    .map((s) => ({
      ...s,
      text: formatKpiDisplay(s.value, s.unit, s.displayValue, ""),
    }))
    .filter((s) => s.text !== "");
  return (
    <section className={`${STORY_SECTION_SHELL} overflow-x-clip`}>
      {/* 헤더 클릭 착지(ADR-038): 좌측 이미지 그룹(섹션 hook) 기준. 데코 스티커가 위로 ~30-41px 오버행 →
          scroll-mt 에 오버행+호흡 간격 합산(56/48/56/64)으로 스티커가 헤더에 안 잘리게 착지 */}
      <SectionContainer
        id="story"
        className="flex scroll-mt-14 flex-col gap-12 md:scroll-mt-12 lg:scroll-mt-14 lg:flex-row lg:items-center lg:gap-0 wide:scroll-mt-16"
      >
        {/* 좌측 이미지 2장 — 각 이미지를 relative 래퍼로 감싸 장식을 "그 이미지" 기준으로 앵커링.
            바깥 래퍼는 overflow visible(장식 오버행 허용), StoryImage 내부 overflow-hidden 은 둥근 사진만 클리핑.
            Figma 반응형: <1024 stacked(이미지그룹 위/텍스트 아래) · lg(1025~1439) & wide(1440) 모두 side-by-side(좌 이미지/우 텍스트).
            lg(content 905px 고정): 이미지그룹 545 + 텍스트 360, 이미지1 347 / 이미지2 186, h333 (Figma 1439 프레임 332:8976).
            wide(content 1200): 이미지그룹 817(이미지1 527 / 이미지2 278), h425. */}
        <div className="flex w-full flex-row gap-1.5 md:gap-3 h-[221px] md:h-[294px] lg:h-[333px] lg:w-[545px] lg:flex-none wide:h-[425px] wide:w-[817px]">
          {/* 이미지 1 (좌) + 장식(SOW·heart) — 이 이미지 기준 px offset. data-reveal: 사진+스티커 한 덩어리로 페이드업(스티커는 독립 모션 없이 사진과 함께 이동) */}
          <div className="relative h-full flex-1" data-fid="story-img1" data-reveal>
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

          {/* 이미지 2 (우) + 장식(sparkles·Go·od = Good) — 이 이미지 기준 px offset. data-reveal: 사진2(+스티커) 페이드업 */}
          <div className="relative h-full w-[165px] shrink-0 md:w-[186px] wide:w-[278px]" data-fid="story-img2" data-reveal>
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
            {/* Good: od — 우하단 오버행.
                lg/wide left 는 Figma(154/237)보다 각각 51/38px 왼쪽. Figma 더미 통계("16개·23가정·2시설")보다
                실데이터 통계("나눔 쌀 1340kg" 포함, 폭 326px)가 넓어 우측 정렬로 자라며 스티커 오버행과 겹침
                (lg −35px · wide −22px 측정). 통계 좌측에 16px 여백 확보. base/md 는 통계가 이미지 아래로
                스택돼 겹침 없음 → Figma 값 유지. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/icons/story-od.svg"
              alt=""
              aria-hidden
              data-fid="story-od"
              className="pointer-events-none absolute z-10 h-auto rotate-[5deg] w-[68px] left-[119px] top-[192px] md:w-[84px] md:left-[151px] md:top-[245px] lg:w-[97px] lg:left-[103px] lg:top-[287px] wide:w-[115px] wide:left-[199px] wide:top-[357px]"
            />
          </div>
        </div>

        {/* 텍스트 + Result — 카피는 constants/story.ts SSoT.
            base: 세로 스택(텍스트 ─40─ Result, Figma 375) · md(768~1024): 가로 [본문 좌 | 통계 우, 하단정렬]
            lg(1025~1439): 세로 우정렬 풀하이트(self-stretch) — 텍스트 ─80─ Result 하단 flush · wide(1440): 센터링 + 텍스트 ─119─ Result */}
        <div className="flex flex-1 flex-col gap-10 text-surface-dark md:flex-row md:items-end md:justify-between md:gap-8 lg:flex-col lg:items-end lg:justify-end lg:gap-[80px] lg:self-stretch lg:text-right wide:justify-center wide:gap-[119px]">
          {/* 내부 갭 Figma 정합: tag→title 14(base)/18(md+) · title→desc 4(base)/12(md+) (이전 일률 gap-6=24 과대) */}
          <div className="flex flex-col md:max-w-[300px] lg:max-w-none lg:items-end">
            {/* 태그칩 — Figma 375: 14px·py6(h30) / 768: 16px·py8(h40) / 1025·1440: h35(Tag 117×35 — py6·lh1.4) */}
            <span className="self-start rounded-full bg-surface-dark px-4 py-1.5 text-sm leading-[1.3] font-semibold text-ink-on-purple md:py-2 md:text-base md:leading-normal lg:self-end lg:py-1.5 lg:leading-[1.4]">
              {content.tag}
            </span>

            {/* 헤딩 — Figma 22(375)/28(768)/32(1025+), lh 1.3 공통. 줄마다 block 엘리먼트로 분리해
                줄바꿈 지점 고정(통짜 \n 의존 제거). gap 없이 쌓으면 line-height 130% 와 동일한 행간 재현.
                data-reveal: 헤딩만 페이드업(태그·설명·통계는 즉시). transform 은 flex item 시각 이동이라 mt 간격·reflow 영향 0 */}
            <h2
              data-reveal
              className="mt-3.5 break-keep text-[22px] font-bold leading-[1.3] md:mt-[18px] md:text-[28px] lg:text-[32px]"
            >
              {content.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>

            {/* 부제 — Figma 14px 이나 본문 16px 접근성 제약 우선. 줄마다 block 엘리먼트로 분리해
                "전하며," 뒤에서만 줄바꿈(통짜 자연 래핑의 "가/족" 어긋남 제거). lh 150% gap0 으로 통짜 행간 재현 */}
            <p className="mt-1 break-keep text-base font-medium leading-[1.5] md:mt-3 lg:max-w-[420px]">
              {content.subtitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          {/* Result 통계 — Figma 구조 정합: 칼럼 gap16 + 구분선 h44(w1) 분리 렌더(이전 px 패딩+full-height border 구조가 1440 폭 +93 원인).
              라벨 15/1.3 · 수치 24/1.3 · 칼럼 내 gap6 → 박스 h≈56. base 는 li flex-1 로 풀폭 분배(Figma 375 w323). hide-when-empty 적용 */}
          {visibleStats.length > 0 && (
            <ul
              aria-label="쌀 나눔 활동 성과"
              className="flex flex-row items-center gap-4"
            >
              {visibleStats.map((stat, index) => (
                <Fragment key={stat.slug}>
                  {/* 구분선 — Figma 세로 라인 h44, 칼럼 사이 gap16 양측 */}
                  {index > 0 && (
                    <li aria-hidden className="h-11 w-px bg-brand-mid/30" />
                  )}
                  <li
                    className="flex flex-1 flex-col gap-1.5 text-left md:flex-initial lg:text-right"
                    aria-label={`${stat.label} ${stat.text}`}
                  >
                    <p className="text-brand-mid text-[17px] font-medium leading-[1.3]">
                      {stat.label}
                    </p>
                    <p className="text-brand-mid text-[26px] font-bold leading-[1.3] tabular-nums">
                      {stat.text}
                    </p>
                  </li>
                </Fragment>
              ))}
            </ul>
          )}
        </div>
      </SectionContainer>
    </section>
  );
}
