// 발행·예약 일시 선택 — shadcn Calendar(Popover) + 시간 입력.
"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { ko } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatLabel(d: Date): string {
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toTimeInput(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

type Props = {
  value: Date;
  onChange: (next: Date) => void;
  disabled?: boolean;
};

export function DateTimePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);

  const onSelectDate = (picked: Date | undefined) => {
    if (!picked) return;
    const next = new Date(value);
    next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    onChange(next);
  };

  const onTimeChange = (time: string) => {
    const [h, m] = time.split(":").map((n) => Number(n));
    const next = new Date(value);
    next.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2 font-normal"
          aria-label="발행 일시 선택"
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-ink-subtle" />
          <span className="truncate">{formatLabel(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onSelectDate}
          defaultMonth={value}
          locale={ko}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t border-border p-3">
          <label
            htmlFor="publish-time"
            className="shrink-0 text-sm text-ink-subtle"
          >
            시간
          </label>
          <input
            id="publish-time"
            type="time"
            value={toTimeInput(value)}
            onChange={(e) => onTimeChange(e.target.value)}
            className={cn(
              "h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-sm",
              "outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(new Date())}
          >
            지금
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
