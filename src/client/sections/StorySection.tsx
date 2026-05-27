// 스토리 섹션 — 쌀 나눔 활동 소개 + 카드 2개 + 통계 3개 + 배경 장식 스티커 7개 + 카드 화살표 1개 (Figma 96:7834)
import Image from "next/image";

// 장식 SVG "스티커" — % 좌표 + clamp() 크기로 1200×600 마스터를 반응형으로 적응 (7개 분산)
// story-arrow는 카드 wrap 내부 자식이라 별도 처리, story-divider는 통계 구분선이라 인라인 SVG 사용
type Sticker = {
  src: string;
  left: string;
  top: string;
  w: string;
  ratio: number;
  rotate?: string;
};

const STICKERS: ReadonlyArray<Sticker> = [
  { src: "/icons/story-deco4.svg", left: "12%", top: "7%", w: "clamp(64px,5.6vw,108px)", ratio: 108 / 57, rotate: "-11.83deg" },
  { src: "/icons/story-deco1.svg", left: "7.9%", top: "10%", w: "clamp(22px,2vw,38px)", ratio: 38 / 67, rotate: "-22.82deg" },
  { src: "/icons/story-heart.svg", left: "6.3%", top: "27%", w: "clamp(32px,2.8vw,54px)", ratio: 54 / 49, rotate: "-24.69deg" },
  { src: "/icons/story-star1.svg", left: "76.8%", top: "5.5%", w: "clamp(24px,2vw,40px)", ratio: 40 / 41 },
  { src: "/icons/story-star2.svg", left: "73.3%", top: "9.3%", w: "clamp(38px,3.2vw,62px)", ratio: 62 / 64 },
  { src: "/icons/story-deco2.svg", left: "48.1%", top: "71.3%", w: "clamp(58px,4.9vw,95px)", ratio: 95 / 79 },
  { src: "/icons/story-deco3.svg", left: "77.6%", top: "71.8%", w: "clamp(30px,2.6vw,50px)", ratio: 50 / 89 },
];

export function StorySection() {
  return (
    <section
      id="story"
      className="scroll-mt-[88px] bg-[#faf4ff] px-5 py-16 sm:py-20 lg:px-20"
    >
      <div className="relative mx-auto max-w-[1200px] lg:min-h-[600px]">
        {/* 배경 장식 스티커 7개 — lg 이상에서만 표시 */}
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          aria-hidden
        >
          {STICKERS.map((s) => (
            <Image
              key={s.src}
              src={s.src}
              alt=""
              width={120}
              height={Math.round(120 / s.ratio)}
              className="absolute"
              style={{
                left: s.left,
                top: s.top,
                width: s.w,
                height: "auto",
                transform: s.rotate ? `rotate(${s.rotate})` : undefined,
                transformOrigin: "center",
              }}
              sizes="120px"
            />
          ))}
        </div>

        {/* Contents */}
        <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-0">
          {/* 좌측 카드 영역 — 데스크탑 너비 비율 68% (Figma 816.667/1200) */}
          <div className="relative flex gap-3 lg:basis-[68%]">
            <div className="relative aspect-[538/425] flex-1 overflow-hidden rounded-[8px]">
              <Image
                src="/images/story-card1.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 60vw, 538px"
              />
            </div>
            <div className="relative aspect-[278/425] w-[34%] shrink-0 overflow-hidden rounded-[8px]">
              <Image
                src="/images/story-card2.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 30vw, 278px"
              />
            </div>
            {/* 카드 우하단 화살표 — 카드 wrap 안 absolute (Figma 776/816.667, 371/425) */}
            <Image
              src="/icons/story-arrow.svg"
              alt=""
              aria-hidden
              width={43}
              height={56}
              className="pointer-events-none absolute"
              style={{
                left: "95%",
                top: "87%",
                width: "clamp(26px,2.2vw,43px)",
                height: "auto",
              }}
              sizes="43px"
            />
          </div>

          {/* 우측 텍스트 + 통계 — 데스크탑 너비 비율 32% (Figma 383/1200) */}
          <div className="flex flex-col items-start gap-10 lg:basis-[32%] lg:items-end lg:gap-[clamp(2rem,7vw,7.5rem)] lg:pl-8">
            <div className="flex w-full flex-col items-start gap-[18px] lg:items-end">
              {/* 태그 */}
              <span className="inline-flex h-[35px] items-center rounded-full bg-[#242424] px-3 text-[16px] font-semibold leading-[1.3] text-[#e4bdff]">
                쌀 나눔 활동
              </span>

              {/* 헤딩 + 본문 */}
              <div className="flex w-full flex-col gap-3 text-left text-[#242424] lg:text-right">
                <h2 className="text-[clamp(1.5rem,2.2vw,2rem)] font-bold leading-[1.3]">
                  밥이 사랑입니다
                  <br />
                  나누는 우리는 식구입니다
                </h2>
                <p className="text-[16px] font-medium leading-[1.5]">
                  온기가 필요한 이웃에게 밥 한 공기의 진심을 전하며,
                  <br />
                  더 큰 가족을 만들어갑니다.
                </p>
              </div>
            </div>

            {/* 통계 3개 — whitespace-nowrap으로 좁은 BP에서 줄바꿈 방지 */}
            <div className="flex items-center gap-3 text-[#9257ca] sm:gap-4">
              <div className="flex flex-col items-center gap-1.5 whitespace-nowrap">
                <span className="text-[15px] font-medium leading-[1.3]">
                  후원 기관
                </span>
                <span className="text-[24px] font-bold leading-[1.3]">
                  16개
                </span>
              </div>
              <Image
                src="/icons/story-divider.svg"
                alt=""
                aria-hidden
                width={1}
                height={44}
                className="shrink-0 opacity-60"
              />
              <div className="flex flex-col items-center gap-1.5 whitespace-nowrap">
                <span className="text-[15px] font-medium leading-[1.3]">
                  지원 가정
                </span>
                <span className="text-[24px] font-bold leading-[1.3]">
                  23가정
                </span>
              </div>
              <Image
                src="/icons/story-divider.svg"
                alt=""
                aria-hidden
                width={1}
                height={44}
                className="shrink-0 opacity-60"
              />
              <div className="flex flex-col items-center gap-1.5 whitespace-nowrap">
                <span className="text-[15px] font-medium leading-[1.3]">
                  지역 시설
                </span>
                <span className="text-[24px] font-bold leading-[1.3]">
                  2시설
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
