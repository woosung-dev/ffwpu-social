// [임시 프로토타입] 스크롤 리빌 + 섹션 내 스티키 좌블록 라이브 데모 — 방향 확정용 체크포인트. PR 전 삭제 예정.
import type { Metadata } from "next";

import { Reveal } from "@/client/components/motion";
import { SectionContainer } from "@/client/components/layout";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function MotionLabPage() {
  return (
    <div className="bg-white">
      <SectionContainer className="py-16">
        <h1 className="text-2xl font-bold text-surface-dark">
          Motion Lab — 스크롤 리빌 + 스티키 데모 (임시)
        </h1>
        <p className="mt-2 text-ink-subtle">
          아래로 스크롤하면 각 블록이 아래→위로 페이드업. 1440↑ 폭에서 좌측 블록이 섹션 내 스티키.
        </p>
      </SectionContainer>

      {/* 1) 섹션 단위 페이드업 */}
      {["가족 치유", "지역 봉사", "환경 캠페인"].map((label, i) => (
        <section key={label} className="w-full border-t border-border bg-white py-24">
          <SectionContainer>
            <Reveal>
              <div className="rounded-2xl bg-surface-soft p-12">
                <p className="text-sm font-semibold text-brand-vivid">섹션 페이드업 #{i + 1}</p>
                <h2 className="mt-2 text-3xl font-bold text-surface-dark">{label}</h2>
                <p className="mt-3 max-w-prose text-ink-subtle">
                  진입 시 한 번만 페이드업(translateY 20→0, 500ms ease-out). 모션 끔 설정 시 즉시 표시.
                </p>
              </div>
            </Reveal>
          </SectionContainer>
        </section>
      ))}

      {/* 2) 카드 그룹 stagger (60ms) */}
      <section className="w-full border-t border-border bg-white py-24">
        <SectionContainer>
          <h2 className="text-3xl font-bold text-surface-dark">카드 그룹 stagger</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Reveal key={i} delayMs={Math.min(i, 5) * 60}>
                <div className="flex h-40 items-center justify-center rounded-xl bg-brand-bright text-lg font-bold text-white">
                  카드 {i + 1} · {Math.min(i, 5) * 60}ms
                </div>
              </Reveal>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* 3) wide(1440↑) 전용 섹션 내 스티키 좌블록 — 우측이 길어 좌블록이 핀→섹션 하단서 해제 */}
      <section className="w-full border-t border-border bg-white py-24">
        <SectionContainer className="flex flex-col gap-8 wide:flex-row wide:items-start wide:gap-16">
          <div className="rounded-2xl bg-surface-dark p-10 text-ink-on-purple wide:sticky wide:top-[var(--sticky-top)] wide:w-[319px] wide:shrink-0 wide:self-start">
            <h2 className="text-2xl font-extrabold">스티키 좌블록</h2>
            <p className="mt-3 text-sm opacity-90">
              1440↑ 에서 헤더 아래(--sticky-top)에 고정. 우측을 다 스크롤하면 해제.
            </p>
          </div>
          <div className="flex-1 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex h-48 items-center justify-center rounded-xl bg-surface-soft text-ink-subtle">
                우측 콘텐츠 블록 {i + 1}
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      <div className="h-[60vh]" />
    </div>
  );
}
