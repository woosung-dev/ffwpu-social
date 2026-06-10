// 소식 상세 헤더 — 카테고리 + 제목 + 날짜. Figma 749:8059(B 시안 Title 블록) 정합 — 날짜 줄에 하트 없음(하트는 하단 Bottom 줄로 이동). Server Component
function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export function DetailHeader({
  categoryName,
  title,
  publishedAt,
}: {
  categoryName: string;
  title: string;
  publishedAt: Date | string | null;
}) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold text-brand-vivid">{categoryName}</p>
        {/* 제목 lh — Figma 749:8063: 32px × 1.5 = 48px (lg). 모바일은 기존 leading-snug 유지 */}
        <h1 className="break-keep text-2xl font-semibold leading-snug text-ink-strong lg:text-[32px] lg:leading-[1.5]">
          {title}
        </h1>
      </div>
      {/* 날짜 — Figma 749:8068: SUIT Medium(500) */}
      <p className="text-base font-medium text-ink-date">{fmtDate(publishedAt)}</p>
    </header>
  );
}
