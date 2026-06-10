// 소식 상세 하단 네비 — 목록 보기 + 이전/다음 글. Figma 93:8851 정합. 인접 글 없으면 비활성. 터치 타깃 ≥44px
import Link from "next/link";
import { ArrowLeft, ArrowRight, List } from "lucide-react";

type Adjacent = { id: string; title: string } | null;

// 이전/다음 단일 항목 — 글 있으면 Link, 없으면 비활성 span. dir 로 아이콘 위치·라벨 결정 (4중 중복 제거)
function AdjacentLink({ dir, item }: { dir: "prev" | "next"; item: Adjacent }) {
  const label = dir === "prev" ? "이전글" : "다음글";
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  const inner =
    dir === "prev" ? (
      <>
        <Icon className="size-5" aria-hidden />
        {label}
      </>
    ) : (
      <>
        {label}
        <Icon className="size-5" aria-hidden />
      </>
    );

  if (!item) {
    return (
      <span
        aria-disabled
        className="inline-flex min-h-11 items-center gap-1 px-2 py-2 opacity-40"
      >
        {inner}
      </span>
    );
  }
  return (
    <Link
      href={`/news/${item.id}`}
      aria-label={`${label}: ${item.title}`}
      className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 py-2 hover:opacity-80"
    >
      {inner}
    </Link>
  );
}

export function PrevNextNav({
  prev,
  next,
}: {
  prev: Adjacent;
  next: Adjacent;
}) {
  // 1440 리듬: 디바이더 →16→ 행 — 터치타깃(min-h-11) 상단 여유 10px 보정해 lg mt 6px [추론 — 텍스트 기준 정합]
  return (
    <nav className="mt-6 flex items-center justify-between gap-2 text-base font-semibold text-ink-strong lg:mt-1.5">
      <Link
        href="/news"
        className="-mx-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 hover:opacity-80"
      >
        {/* 목록 아이콘 — Figma 749:8099 menu 24×24 */}
        <List className="size-6" aria-hidden />
        목록 보기
      </Link>
      {/* 이전/다음 그룹 — Figma 749:8103 gap 16: gap-2(8) + 항목 px-2(8) = 텍스트 시각 간격 16px */}
      <div className="flex items-center gap-2">
        <AdjacentLink dir="prev" item={prev} />
        <span aria-hidden className="h-4 w-px bg-border" />
        <AdjacentLink dir="next" item={next} />
      </div>
    </nav>
  );
}
