// 공지 상세 하단 네비 — 목록 보기 + 이전/다음 공지. news PrevNextNav 미러(/notices 경로) — Figma 대조 후 동일 확정 시 공용화 후보
import Link from "next/link";
import { ArrowLeft, ArrowRight, List } from "lucide-react";

type Adjacent = { id: string; title: string } | null;

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
      href={`/notices/${item.id}`}
      aria-label={`${label}: ${item.title}`}
      className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 py-2 hover:opacity-80"
    >
      {inner}
    </Link>
  );
}

export function NoticePrevNext({
  prev,
  next,
}: {
  prev: Adjacent;
  next: Adjacent;
}) {
  return (
    <nav className="mt-4 flex items-center justify-between gap-2 text-base font-semibold text-ink-strong">
      <Link
        href="/notices"
        className="-mx-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 hover:opacity-80"
      >
        <List className="size-6" aria-hidden />
        목록 보기
      </Link>
      <div className="flex items-center gap-2">
        <AdjacentLink dir="prev" item={prev} />
        <span aria-hidden className="h-4 w-px bg-border" />
        <AdjacentLink dir="next" item={next} />
      </div>
    </nav>
  );
}
