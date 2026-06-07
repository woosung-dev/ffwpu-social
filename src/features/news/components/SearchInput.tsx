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
        // 밑줄은 중립 유지 — 입력(focus) 시 색상 변화 없음(familyfed 일관). 키보드 포커스만 subtle ring 으로 a11y 표시(마우스엔 비표시)
        "flex h-11 items-center gap-2 rounded-sm border-b border-border pl-3.5 pr-1 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand-vivid/30",
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
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent text-base text-ink-strong outline-none placeholder:text-ink-subtle"
      />
      <button
        type="submit"
        aria-label="검색"
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
      >
        <Search className="size-5" aria-hidden />
      </button>
    </form>
  );
}
