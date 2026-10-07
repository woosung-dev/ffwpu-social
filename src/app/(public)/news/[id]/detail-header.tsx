// 소식 상세 헤더 — 카테고리 + 제목 + 날짜(+공감 수). Figma 749:8059(B 시안 Title 블록) 기반, 날짜 옆 공감 수는 사회공헌국 요청(후보 2)으로 추가, 이후 상단에서도 누를 수 있게 확장(ADR-066 후속). Server Component
import type { ReactNode } from "react";

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export function DetailHeader({
  categoryName,
  title,
  publishedAt,
  heart,
}: {
  categoryName: string;
  title: string;
  publishedAt: Date | string | null;
  /** 날짜 옆 공감 버튼 슬롯 — 클라이언트 컴포넌트를 주입 (미지정 시 날짜만) */
  heart?: ReactNode;
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
      {/* 날짜 — Figma 749:8068: SUIT Medium(500) · 공감 수는 날짜 오른쪽 */}
      <div className="flex items-center gap-3">
        <p className="text-base font-medium text-ink-date">{fmtDate(publishedAt)}</p>
        {heart}
      </div>
    </header>
  );
}
