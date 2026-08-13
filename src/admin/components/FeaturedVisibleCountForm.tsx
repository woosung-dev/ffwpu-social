// 랜딩 '메인 스토리' 카드 노출 개수 설정 (ADR-054) — 지정 가능한 자리(12)와 실제 화면 노출 수를 분리한다
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setFeaturedVisibleCountAction } from "@/features/landing/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FEATURED_SLOT_MAX } from "@/features/landing/constants/slots";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

const OPTIONS = Array.from({ length: FEATURED_SLOT_MAX }, (_, i) => i + 1);

export function FeaturedVisibleCountForm({ value }: { value: number }) {
  const router = useRouter();
  const [selected, setSelected] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await setFeaturedVisibleCountAction(selected);
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : (result.error.issues[0]?.message ?? "저장하지 못했습니다."),
        );
        return;
      }
      router.refresh();
    });
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-xl">
          {ADMIN_COPY.mainStory.visibleCountTitle}
          <HelpTip>{ADMIN_COPY.mainStory.visibleCountHelp}</HelpTip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={String(selected)}
            onValueChange={(next) => setSelected(Number(next))}
            disabled={isPending}
          >
            <SelectTrigger
              id="featured-visible-count"
              aria-label={ADMIN_COPY.mainStory.visibleCountTitle}
              className="h-11 w-32"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPTIONS.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count}개
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={save}
            disabled={isPending || selected === value}
            className="h-11 px-6"
          >
            {isPending ? "저장 중…" : "저장"}
          </Button>
          {selected !== value && !isPending && (
            <span className="text-sm text-ink-subtle">저장하지 않은 변경이 있어요.</span>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
