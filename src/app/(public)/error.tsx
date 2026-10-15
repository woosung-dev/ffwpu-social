// 공개 페이지 오류 경계 — 서버 렌더 실패(DB 장애 등) 시 Next 기본 "Application error" 대신 헤더·푸터를 유지한 안내 화면.
// 상세 원인은 노출하지 않는다 (prod 에선 digest 만 전달됨). 재시도 = 같은 경로 다시 렌더
"use client";

import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SectionContainer className="py-24 text-center lg:py-32">
      <h1 className="text-2xl font-bold text-ink-strong lg:text-[28px]">
        페이지를 불러오지 못했습니다
      </h1>
      <p className="mt-3 text-base text-ink-date">잠시 후 다시 시도해 주세요.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand-darkest px-5 py-2.5 text-white transition-opacity hover:opacity-90"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-full border border-ink-date px-5 py-2.5 text-ink-strong transition-opacity hover:opacity-80"
        >
          홈으로
        </Link>
      </div>
    </SectionContainer>
  );
}
