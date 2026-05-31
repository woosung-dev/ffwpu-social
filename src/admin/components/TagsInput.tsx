// 어드민 태그 입력 — 칩 + autocomplete (빈도순). Enter/Comma 모두 추가 (결정 로그 [T8 구분자]). debounce 200ms
"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { searchTagsAction } from "@/features/news/actions";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  disabled?: boolean;
};

const DEBOUNCE_MS = 200;

// 태그 정규화 — service.ts 와 동일 규칙. 클라 입력 직후 정규화로 중복 체크 정확
function normalize(raw: string): string {
  return raw.replace(/^#/, "").trim().toLowerCase();
}

export function TagsInput({
  value,
  onChange,
  maxTags = 20,
  disabled,
}: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reachedMax = value.length >= maxTags;

  // 디바운스 autocomplete — input 200ms 후 searchTagsAction 호출
  useEffect(() => {
    const trimmed = normalize(input);
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      const result = await searchTagsAction(trimmed);
      if (!result.success) {
        setSuggestions([]);
        return;
      }
      const filtered = result.data
        .map((r) => r.tag)
        .filter((t) => !value.includes(t));
      setSuggestions(filtered);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [input, value]);

  const addTag = (raw: string) => {
    const tag = normalize(raw);
    if (!tag || value.includes(tag) || reachedMax) return;
    onChange([...value, tag]);
    setInput("");
    setSuggestions([]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim().length > 0) addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      // 빈 입력에서 Backspace → 마지막 태그 제거
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5",
          "focus-within:ring-2 focus-within:ring-brand-primary/50",
          disabled && "cursor-not-allowed opacity-60",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="rounded-full hover:bg-brand-primary/20"
                aria-label={`${tag} 제거`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={
            reachedMax
              ? `최대 ${maxTags}개`
              : value.length === 0
                ? "Enter 또는 , 로 추가"
                : ""
          }
          disabled={disabled || reachedMax}
          maxLength={50}
          className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none placeholder:text-ink-subtle"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="relative">
          <ul
            role="listbox"
            className="absolute z-10 max-h-48 w-full overflow-y-auto rounded-md border bg-background shadow-lg"
          >
            {suggestions.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // blur 전에 click
                  onClick={() => addTag(tag)}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-ink-subtle">
        {value.length} / {maxTags} 태그
      </p>
    </div>
  );
}
