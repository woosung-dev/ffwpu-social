// KPI 섹션 — 벤토 그리드 (Figma 96:7773). 1280px(xl) 이상에서 가로 벤토, 미만은 1열 stack
import Image from "next/image";

export function KpiSection() {
  return (
    <section
      id="kpi"
      className="scroll-mt-[88px] bg-white px-5 py-16 lg:px-20 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Figma: gap-[70px], left 251 + right flex-1 — xl 이상에서 가로 분기 */}
        <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-[70px]">
          {/* ─── 좌측 텍스트 ─── */}
          <div className="flex shrink-0 flex-col gap-4 xl:w-[251px]">
            <h2 className="text-[28px] font-bold leading-[1.3] text-[#242424] xl:text-[36px]">
              한 해동안
              <br />
              만들어낸 변화
            </h2>
            <p className="text-base font-medium leading-[1.5] text-[#343434]">
              가정연합은 도움이 필요한 사람들에게 오랜기간 손을 건네왔습니다.
              앞으로도 변함없이 온기를 전하겠습니다.
            </p>
          </div>

          {/* ─── 우측 벤토 (Figma h-760) ─── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 xl:h-[760px]">
            {/* Row 1: 보라 smile (293×226) + 45,217명+ (flex-1 self-stretch) — xl에서 가로 */}
            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="flex shrink-0 items-center justify-center rounded-[20px] bg-[#b769ff] px-8 py-10 xl:h-[226px] xl:w-[293px] xl:px-[84px] xl:py-[70px]">
                <Image
                  src="/icons/kpi-smile-illustration.svg"
                  alt=""
                  width={121}
                  height={86}
                />
              </div>

              <div className="flex min-w-0 flex-1 items-start justify-between self-stretch overflow-hidden rounded-[20px] bg-[#f6f6f6] px-6 py-5">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-[#343434] xl:text-xl">
                    누적 봉사자 수
                  </p>
                  <p className="whitespace-nowrap text-[clamp(2rem,3.8vw,52px)] font-bold text-[#343434]">
                    45,217명+
                  </p>
                </div>
                <div className="hidden shrink-0 items-end gap-6 self-stretch xl:flex">
                  <Image
                    src="/icons/kpi-graph-icon.svg"
                    alt=""
                    width={84}
                    height={84}
                  />
                  <Image
                    src="/icons/kpi-star-icon.svg"
                    alt=""
                    width={83}
                    height={83}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: 좌 컬럼 (sub-row + 연두) + 우 보라 tall — xl에서 가로 */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
              {/* 좌 컬럼 — Figma w-607이지만 우 보라가 너무 좁아져 사진 잘림 → max-w로 제약하되 flex-1 분할 */}
              <div className="flex min-w-0 flex-1 flex-col gap-4 xl:max-w-[607px]">
                {/* Sub-row: 38년 5개월 + Sow Good */}
                <div className="flex flex-col gap-4 xl:flex-row">
                  <div className="flex min-w-0 flex-1 flex-col gap-12 overflow-hidden rounded-[20px] bg-[#f6f6f6] px-5 py-5 xl:gap-[95px] xl:px-6">
                    <p className="text-base font-semibold text-[#343434] xl:text-xl">
                      누적 봉사 기간
                    </p>
                    <p className="whitespace-nowrap text-[clamp(1.5rem,2.3vw,38px)] font-bold text-[#343434]">
                      38년 5개월
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[20px] bg-[#ffcf41] px-8 py-10 xl:px-[45px] xl:py-[88px]">
                    <Image
                      src="/icons/kpi-yellow-card-wordmark.svg"
                      alt="Sow Good"
                      width={204}
                      height={49}
                      style={{ height: "auto" }}
                      className="max-w-full"
                    />
                  </div>
                </div>

                {/* 연두 봉사활동 횟수 */}
                <div className="flex flex-1 flex-col justify-end gap-6 overflow-hidden rounded-[20px] bg-[#dcef7d] px-6 py-5 xl:gap-[31px]">
                  <p className="text-base font-semibold text-[#3b4700] xl:text-xl">
                    봉사활동 횟수
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="relative hidden size-[172px] overflow-hidden xl:block">
                      <Image
                        src="/icons/kpi-lime-card-illustration.svg"
                        alt=""
                        width={198}
                        height={206}
                        className="absolute"
                        style={{ left: "-14px", top: "-18px" }}
                      />
                    </div>
                    <p className="whitespace-nowrap text-right text-[clamp(2rem,3.8vw,52px)] font-bold text-[#3b4700]">
                      3,614회+
                    </p>
                  </div>
                </div>
              </div>

              {/* 우 보라 tall — 도움을 주게 된 가정 수 + 사람 사진 */}
              <div className="relative flex min-w-0 flex-1 flex-col gap-10 overflow-hidden rounded-[20px] bg-[#b769ff]">
                <div className="flex flex-col gap-1 px-6 py-5">
                  <p className="text-base font-semibold text-white xl:text-xl">
                    도움을 주게 된 가정 수
                  </p>
                  <p className="whitespace-nowrap text-[clamp(1.75rem,3vw,42px)] font-bold text-white">
                    80,257개+
                  </p>
                </div>
                {/* 사람 사진 — object-position center 25% (사진 상단 25%인 사람 얼굴이 컨테이너 가운데에 정렬, 머리+가방 모두 노출) */}
                <div className="relative mt-auto h-[360px] w-full max-w-[300px] self-center overflow-hidden xl:h-[423px] xl:max-w-none xl:self-stretch">
                  <Image
                    src="/images/kpi-purple-card-photo.png"
                    alt=""
                    fill
                    className="object-cover"
                    style={{ objectPosition: "50% 25%" }}
                    sizes="(max-width: 1280px) 300px, 432px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
