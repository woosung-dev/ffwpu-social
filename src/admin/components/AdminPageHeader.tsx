// 어드민 페이지 공통 헤더 — 제목 + 도움말(선택) + 보조설명 + 우측 액션. 기존 페이지별 <header> 패턴을 표준화
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  helpTip,
  action,
}: {
  title: string;
  description?: string;
  helpTip?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-1.5 text-3xl font-extrabold tracking-tight text-ink-strong">
          {title}
          {helpTip}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-ink-subtle">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
