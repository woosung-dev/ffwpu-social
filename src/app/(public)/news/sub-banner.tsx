// 소식 페이지 상단 서브 배너 — Figma node 125:8915 정합 (bg #f2eff4, h:132, Sow Good 로고 + 카피)
import Image from "next/image";

export function SubBanner() {
  return (
    <section
      aria-label="Sow Good 소개"
      className="bg-[#f2eff4]"
    >
      <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 py-6 sm:flex-row sm:gap-10 sm:py-8 lg:px-20">
        <Image
          src="/icons/featured-mini-logo.svg"
          alt="Sow Good"
          width={160}
          height={64}
          className="h-12 w-auto shrink-0 sm:h-14"
        />
        <div
          aria-hidden
          className="hidden h-9 w-px shrink-0 bg-brand-soft/40 sm:block"
        />
        <p className="break-keep text-center text-sm leading-relaxed text-brand-soft sm:text-left sm:text-base">
          <span className="font-extrabold text-brand-primary">Sow Good</span>{" "}
          가족이 아니어도, 같은 동네가 아니어도,
          <br className="hidden sm:block" />
          <span className="sm:inline">
            {" "}
            밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다.
          </span>
        </p>
      </div>
    </section>
  );
}
