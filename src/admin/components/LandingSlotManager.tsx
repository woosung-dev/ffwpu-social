// 메인 랜딩 큐레이션 — StorySection 상단 2 슬롯 (직접 지정 only) + ArticleGrid 하단 7 슬롯 (지정 + 쌀 나눔 카테고리 최신순 자동 fallback)
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setLandingSlotAction } from "@/features/news/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CurationNews = {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  publishedAt: Date | null;
  storySlot: number | null;
  featuredRank: number | null;
};

type Props = {
  riceSharingPublished: CurationNews[];
  storySlots: Array<CurationNews | null>;
  featuredSlots: Array<CurationNews | null>;
};

const STORY_SLOT_COUNT = 2;
const FEATURED_SLOT_COUNT = 7;
const UNSET = "__unset__";

export function LandingSlotManager({
  riceSharingPublished,
  storySlots,
  featuredSlots,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // slot 변경 — null = 해제, newsId = 점유
  const onSlotChange = (
    kind: "story" | "featured",
    slot: number,
    newsId: string | null,
  ) => {
    setError(null);
    const key = `${kind}-${slot}`;
    setBusySlot(key);
    startTransition(async () => {
      try {
        // 해제 (newsId === null) — 기존 점유자 찾아 setLandingSlot(newsId, kind, null)
        if (newsId === null) {
          const current =
            kind === "story" ? storySlots[slot - 1] : featuredSlots[slot - 1];
          if (current) {
            const result = await setLandingSlotAction({
              newsId: current.id,
              kind,
              slot: null,
            });
            if (!result.success) {
              setError(
                typeof result.error === "string"
                  ? result.error
                  : "슬롯 해제 실패",
              );
              return;
            }
          }
        } else {
          // 점유 (newsId 글을 slot 자리에 pin)
          const result = await setLandingSlotAction({ newsId, kind, slot });
          if (!result.success) {
            setError(
              typeof result.error === "string"
                ? result.error
                : "슬롯 점유 실패",
            );
            return;
          }
        }
        router.refresh();
      } finally {
        setBusySlot(null);
      }
    });
  };

  const renderSlotRow = (
    kind: "story" | "featured",
    slot: number,
    current: CurationNews | null,
  ) => {
    const key = `${kind}-${slot}`;
    const isBusy = busySlot === key;
    const slotLabel = kind === "story" ? `${slot}번 사진` : `${slot}번 자리`;
    return (
      <div
        key={key}
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-border bg-white p-3 sm:flex-row sm:items-center sm:gap-3",
          isBusy && "opacity-60",
        )}
      >
        <span className="w-20 shrink-0 text-sm font-medium text-ink-strong">
          {slotLabel}
        </span>
        <div className="min-w-0 flex-1">
          <Select
            value={current?.id ?? UNSET}
            onValueChange={(v) =>
              onSlotChange(kind, slot, v === UNSET ? null : v)
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full" aria-label={`${slotLabel} 글 선택`}>
              <SelectValue
                placeholder={
                  kind === "featured"
                    ? "선택 안 함 (자동 — 쌀 나눔 최신)"
                    : "선택 안 함 (비노출)"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>
                {kind === "featured"
                  ? "선택 안 함 (자동 — 쌀 나눔 최신)"
                  : "선택 안 함 (비노출)"}
              </SelectItem>
              {riceSharingPublished.map((n) => {
                // 다른 슬롯에 이미 점유된 글은 표시하되 라벨에 명시
                const ownStory =
                  n.storySlot != null && (kind !== "story" || n.storySlot !== slot);
                const ownFeatured =
                  n.featuredRank != null &&
                  (kind !== "featured" || n.featuredRank !== slot);
                const suffix = ownStory
                  ? ` · 상단 ${n.storySlot}번`
                  : ownFeatured
                    ? ` · 하단 ${n.featuredRank}번`
                    : "";
                return (
                  <SelectItem key={n.id} value={n.id}>
                    {n.title}
                    {suffix}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        {current && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSlotChange(kind, slot, null)}
            disabled={isPending}
            className="shrink-0 text-xs text-ink-subtle"
          >
            해제
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-xl">상단 — 쌀 나눔 활동 (StorySection)</CardTitle>
          <p className="text-sm text-ink-subtle">
            ※ 지정한 글의 대표 이미지가 메인 상단 사진 2장에 노출됩니다(클릭 시 해당 소식으로 이동). 미지정 자리는 기본 사진.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: STORY_SLOT_COUNT }).map((_, i) =>
            renderSlotRow("story", i + 1, storySlots[i] ?? null),
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-xl">하단 — 활동 스토리 (ArticleGrid)</CardTitle>
          <p className="text-sm text-ink-subtle">
            ※ 지정한 자리만 점유, 미지정 자리는 쌀 나눔 카테고리 최신 글이 자동
            채움
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: FEATURED_SLOT_COUNT }).map((_, i) =>
            renderSlotRow("featured", i + 1, featuredSlots[i] ?? null),
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-xl">발행된 쌀 나눔 글 (참고)</CardTitle>
        </CardHeader>
        <CardContent>
          {riceSharingPublished.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-subtle">
              발행된 쌀 나눔 글이 없습니다.
            </p>
          ) : (
            <ul className="divide-y">
              {riceSharingPublished.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="truncate text-ink-strong">{n.title}</span>
                  <span className="shrink-0 text-xs text-ink-date">
                    {n.storySlot != null && (
                      <span className="mr-2 rounded-full bg-warm/15 px-2 py-0.5 text-amber-700">
                        상단 {n.storySlot}
                      </span>
                    )}
                    {n.featuredRank != null && (
                      <span className="mr-2 rounded-full bg-brand-primary/10 px-2 py-0.5 text-brand-primary">
                        하단 {n.featuredRank}
                      </span>
                    )}
                    {n.publishedAt &&
                      new Date(n.publishedAt).toLocaleDateString("ko-KR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
