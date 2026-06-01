// 비밀번호 입력 — show/hide 토글(눈 아이콘) 내장. shadcn Input 래핑 + RHF register/field props 그대로 전달 (B4 접근성).
// FormControl(Slot) 이 주입하는 id·aria-* 와 ref 는 props 로 들어와 내부 Input 으로 전달된다.
"use client";

import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentPropsWithoutRef<typeof Input>, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 text-ink-subtle hover:text-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    );
  },
);
