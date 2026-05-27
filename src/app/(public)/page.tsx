// 사용자 사이트 홈 placeholder — D-3 스프린트에서 디자인 시안(스크롤스파이 6 섹션) 본격 구현 시 교체
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-20 text-center lg:py-32">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-vivid">
        준비 중
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-brand-primary lg:text-4xl">
        사회공헌단 Sow Good
      </h1>
      <p className="mt-3 text-base text-foreground/80 lg:text-lg">
        가치를 삶으로 증명합니다.
      </p>
      <p className="mt-8 text-sm text-ink-subtle">
        곧 더 풍성한 활동 이야기로 인사드릴 예정입니다.
      </p>
    </div>
  );
}
