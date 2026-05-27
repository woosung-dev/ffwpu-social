// KPI 카드 — 4 색 variant. 라벨 + 값 + 선택적 단위. ADR-003 (재정 투명성) — 시계열 누적 의도
import { cn } from "@/lib/utils";

type Variant = "gray" | "green" | "purple" | "yellow";

type Props = {
  variant?: Variant;
  label: string;
  value: string | number;
  unit?: string;
  /** 본 카드 너비. 기본은 부모 grid 가 결정 */
  className?: string;
};

const VARIANT_CLASS: Record<Variant, string> = {
  gray: "bg-kpi-gray text-ink-strong",
  green: "bg-kpi-lime text-brand-deep",
  purple: "bg-kpi-purple text-white",
  yellow: "bg-kpi-yellow text-brand-deep",
};

export function KpiCard({
  variant = "gray",
  label,
  value,
  unit,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl p-5 lg:p-6",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      <p className="text-sm font-semibold opacity-80 lg:text-base">{label}</p>
      <p className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tabular-nums lg:text-4xl">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium opacity-80 lg:text-base">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
