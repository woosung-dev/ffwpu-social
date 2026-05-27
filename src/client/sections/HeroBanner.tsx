// 랜딩 히어로 — Figma 각 BP 절대 좌표 명세 적용 (375/768/1025/1440/1920 노드)
import Image from "next/image";
import Link from "next/link";

// Figma BP별 명세 (각 노드 get_metadata 결과):
// - 375 (99:6950) : Hero 241, Header 54, Wrap 187, padding 16, Title w193, Text y30 60×24px, Menu y102, flower 150×137 y50
// - 768 (97:9014) : Hero 450, Header 70, Container 340, padding 60, Title w393, Text y60 80×32px, Menu y160, flower 320×292 y48
// - 1025 (97:8573): Hero 533, Header 88, Container 405, padding 60, Title w505, Text y40 106×42px, Menu y166, flower 400×365 y40
// - 1440 (96:7690): Hero 740, Header 88, Container 612, padding 120, Title w640, Text y100 150×60px, Menu y270, flower 560×511 y100.5
// - 1920 (126:11816): Hero 740, padding 120, Contents w1680, Title w1120, flower x1120, 외 동일

// Tailwind BP 매핑: <md=mobile / md=768 / lg=1024(=1025) / xl=1280 / 2xl=1536

export function HeroBanner() {
  return (
    // Hero를 page top 0부터 시작 (PublicHeader sticky가 위에 떠 있음).
    // Figma HeroBanner total = Header + gap + Container 740 height.
    // -mt 로 PublicHeader 영역까지 hero 확장 → ellipse가 page top부터 그려짐 (Figma 명세 일치).
    <section className="relative overflow-hidden bg-white -mt-[54px] md:-mt-[70px] lg:-mt-[88px]">
      {/* Figma BannerBackground (Ellipse 444) — Dev Mode 정확 CSS:
          border-radius: 50% (ellipse), Figma get_metadata 절대 좌표 각 BP 명세
          top은 HeroBanner top(=page 0) 기준 -752/-159 */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute rounded-[50%] bg-brand-bright max-w-none
          -left-[214px] -top-[159px] h-[389px] w-[777px]
          md:-left-[774px] md:-top-[752px] md:h-[1154px] md:w-[2301px]
          lg:-left-[739px] lg:h-[1239px] lg:w-[2471px]
          xl:-left-[718px] xl:h-[1441px] xl:w-[2875px]
        "
      />

      {/* HeroBanner total height — Figma 명세 (375:241/768:450/1025:533/1440:740) */}
      <div className="relative mx-auto h-[241px] md:h-[450px] lg:h-[533px] xl:h-[740px]">
        {/* Inner — padding (375:16 / 768:60 / 1024:60 / 1280:120) + max-w (1920) */}
        <div
          className="relative mx-auto flex h-full items-start justify-between px-4 md:px-[60px] xl:px-[120px]"
          style={{ maxWidth: "1920px" }}
        >
          {/* Title — BP별 pt = Header(54/70/88) + gap(0~40) + Container Text y
              Figma Text 절대 y from HeroBanner top: 84(375)/130(768)/128(1025)/228(1440) */}
          <div className="flex flex-col gap-3 pt-[84px] md:gap-4 md:pt-[130px] lg:pt-[128px] xl:gap-5 xl:pt-[228px]">
            <h1
              className="font-[family-name:--font-gmarket] font-medium leading-[1.25] text-brand-deep
                         text-[24px] md:text-[32px] lg:text-[42px] xl:text-[60px]"
            >
              가치를 삶으로,
              <br />
              변화를 꽃피우는 동행
            </h1>
            <Link
              href="/#kpi"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-darkest text-[#E9D1FF] transition-opacity hover:opacity-90
                         px-[14px] py-1.5 text-sm font-bold
                         md:px-[20px] md:py-2.5 md:text-base
                         lg:px-[26px] lg:py-3 lg:text-base
                         xl:text-xl"
            >
              지난 활동 살펴보기
              <Image
                src="/icons/hero-cta-arrow.svg"
                alt=""
                width={20}
                height={20}
                className="size-4 md:size-5"
              />
            </Link>
          </div>

          {/* flower — BP별 절대 size + Figma y from HeroBanner top:
              104(375) / 118(768) / 128(1025) / 228(1440) */}
          <Image
            src="/icons/hero-flower.svg"
            alt=""
            width={560}
            height={511}
            priority
            className="h-auto shrink-0
                       mt-[104px] w-[150px]
                       md:mt-[118px] md:w-[320px]
                       lg:mt-[128px] lg:w-[400px]
                       xl:mt-[228px] xl:w-[560px]"
            sizes="(max-width: 768px) 150px, (max-width: 1024px) 320px, (max-width: 1280px) 400px, 560px"
          />
        </div>
      </div>
    </section>
  );
}
