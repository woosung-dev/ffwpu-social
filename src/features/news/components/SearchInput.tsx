// 소식 검색 입력 — 한글 IME 조합 중 Enter 는 조합 확정용이라 제출 차단. 제출 시 onSubmitAction(q) 호출 (프레젠테이션, URL 미관여)
"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  defaultValue?: string;
  /** 제출(Enter·돋보기 클릭) 시 trim 된 검색어 전달 */
  onSubmitAction: (q: string) => void;
  busy?: boolean;
  className?: string;
};

export function SearchInput({
  defaultValue = "",
  onSubmitAction,
  busy,
  className,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  // IME 조합 상태 — isComposing(nativeEvent) 보강용. compositionend 타이밍 의존 제거
  const isComposingRef = useRef(false);

  return (
    <form
      role="search"
      aria-busy={busy}
      onSubmit={(e) => {
        e.preventDefault();
        // 돋보기 클릭도 조합 중이면 무시 — onKeyDown 가드와 대칭(반쪽 자모 제출 방지)
        if (isComposingRef.current) return;
        onSubmitAction(value.trim());
      }}
      className={cn(
        // 하단 stroke 기본 #E5E7EB → hover 시에만 #BAC2D0 (focus 변화·링 없음, familyfed PageSearchbar)
        "flex h-11 items-center gap-4 border-b border-[#E5E7EB] pl-3.5 pr-1 transition-colors hover:border-[#BAC2D0]",
        className ?? "w-full md:w-[280px] lg:w-[320px]",
      )}
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
        onKeyDown={(e) => {
          // 조합 중 Enter 는 폼 기본 제출을 막아 반쪽 글자 검색 방지
          if (
            e.key === "Enter" &&
            (e.nativeEvent.isComposing || isComposingRef.current)
          ) {
            e.preventDefault();
          }
        }}
        placeholder="검색어를 입력하세요"
        maxLength={100}
        aria-label="소식 검색"
        // active(focus) 시 placeholder 숨김 · webkit clear(X) 제거 · focus 링 없음
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent text-base text-ink-strong outline-none placeholder:text-ink-subtle focus:placeholder:text-transparent focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      <button
        type="submit"
        aria-label="검색"
        // 아이콘 24px·색 #4B5563 고정 · 주변 회색 원형 hover 배경 없음
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#4B5563] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid/40"
      >
        <Search className="size-6" strokeWidth={2} aria-hidden />
      </button>
    </form>
  );
}
