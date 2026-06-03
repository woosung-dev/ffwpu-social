// 소식 페이지 서브 배너 — Figma 125:8915/135:12492 정합 (bg #f2eff4)
// 데스크탑: 로고 + 세로 구분선 + 문구 가로 배치 / 모바일: 로고 → 가로 구분선 → 문구 세로 스택
import Image from "next/image";

export function SubBanner() {
  return (
    <section aria-label="Sow Good 소개" className="bg-[#f2eff4]">
      {/* 모바일 (< md): 세로 스택 — Figma 135:12492 정합 */}
      <div className="flex flex-col gap-4 px-4 py-6 md:hidden">
        <Image
          src="/icons/featured-mini-logo.svg"
          alt="Sow Good"
          width={116}
          height={46}
          className="h-auto w-[116px]"
        />
        <div className="h-px w-32 bg-brand-soft/40" aria-hidden />
        <p className="text-[14px] font-medium leading-relaxed text-brand-soft">
          <span className="font-black text-brand-primary">Sow Good</span>{" "}
          가족이 아니어도, 같은 동네가 아니어도,
          <br />
          밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다.
        </p>
      </div>

      {/* 태블릿 이상 (md+): 가로 배치 — Figma 125:8915 정합 */}
      <div className="hidden md:flex md:items-center md:justify-center md:gap-10 md:px-[120px] md:py-[34px]">
        <Image
          src="/icons/featured-mini-logo.svg"
          alt="Sow Good"
          width={160}
          height={64}
          className="h-14 w-auto shrink-0"
        />
        <div aria-hidden className="h-9 w-px shrink-0 bg-brand-soft/40" />
        <p className="break-keep text-[16px] font-medium leading-relaxed text-brand-soft">
          <span className="font-black text-brand-primary">Sow Good</span>{" "}
          가족이 아니어도, 같은 동네가 아니어도,
          <br />
          밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다.
        </p>
      </div>
    </section>
  );
}
