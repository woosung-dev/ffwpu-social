// 어드민 폼 필드 래퍼 - 라벨·힌트·에러 표시 일관화 (shadcn 패턴 simplified)
import * as React from "react";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  name,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : null}
    </div>
  );
}
