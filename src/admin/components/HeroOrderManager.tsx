// /news 소식 히어로 정렬 — 최대 4개 발행 글을 드래그(키보드 포함)로 순서 지정, 명시 Save 로 저장. @dnd-kit sortable
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";

import { setHeroOrderAction } from "@/features/news/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type HeroItem = {
  id: string;
  title: string;
  categoryName: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

type Props = {
  initialItems: HeroItem[]; // 현재 hero (rank 순)
  candidates: HeroItem[]; // 발행됐으나 미지정
};

const MAX_HERO = 4;

function Thumb({ item }: { item: HeroItem }) {
  if (!item.coverImageUrl) {
    return <div className="size-12 shrink-0 rounded bg-surface-soft" aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- MinIO/R2 직접 URL, next/image unoptimized 불필요
    <img
      src={item.coverImageUrl}
      alt=""
      className="size-12 shrink-0 rounded object-cover"
    />
  );
}

function SortableHeroRow({
  item,
  index,
  onRemove,
  reducedMotion,
}: {
  item: HeroItem;
  index: number;
  onRemove: (id: string) => void;
  reducedMotion: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: reducedMotion ? "none" : transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-white p-3",
        isDragging && "opacity-60 shadow-md",
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none rounded p-1 text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
        aria-label={`${item.title} 순서 변경 (현재 ${index + 1}번)`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary"
        aria-hidden
      >
        {index + 1}
      </span>
      <Thumb item={item} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-strong">
          {item.title}
        </p>
        <p className="text-xs text-ink-subtle">{item.categoryName}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        aria-label={`${item.title} 히어로에서 제거`}
        className="shrink-0 text-ink-subtle"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </li>
  );
}

export function HeroOrderManager({ initialItems, candidates }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<HeroItem[]>(initialItems);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialIds = useMemo(
    () => initialItems.map((i) => i.id).join(","),
    [initialItems],
  );
  const isDirty = items.map((i) => i.id).join(",") !== initialIds;

  const reducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 전체 발행 글 풀 (현재 hero + 후보). 추가 가능 목록 = 풀 중 현재 미선택
  const pool = useMemo(() => {
    const map = new Map<string, HeroItem>();
    for (const it of [...initialItems, ...candidates]) map.set(it.id, it);
    return Array.from(map.values());
  }, [initialItems, candidates]);

  const available = useMemo(() => {
    const selected = new Set(items.map((i) => i.id));
    const q = query.trim().toLowerCase();
    return pool
      .filter((p) => !selected.has(p.id))
      .filter((p) => (q ? p.title.toLowerCase().includes(q) : true));
  }, [pool, items, query]);

  const labelOf = (id: string) =>
    items.find((i) => i.id === id)?.title ?? "항목";
  const posOf = (id: string) => items.findIndex((i) => i.id === id) + 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setItems((cur) => {
        const from = cur.findIndex((i) => i.id === active.id);
        const to = cur.findIndex((i) => i.id === over.id);
        return arrayMove(cur, from, to);
      });
    }
  };

  const addItem = (item: HeroItem) => {
    if (items.length >= MAX_HERO) return;
    setItems((cur) => [...cur, item]);
  };
  const removeItem = (id: string) =>
    setItems((cur) => cur.filter((i) => i.id !== id));

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await setHeroOrderAction({
        orderedNewsIds: items.map((i) => i.id),
      });
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "저장에 실패했습니다.",
        );
        return;
      }
      toast.success("히어로 순서가 저장되었습니다. /news 상단에 즉시 반영됩니다.");
      router.refresh();
    });
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-xl">소식 히어로 (최대 {MAX_HERO}개)</CardTitle>
        <p className="text-sm text-ink-subtle">
          /news 소식 페이지 상단에 우선 노출할 글을 최대 {MAX_HERO}개까지 지정하고
          드래그로 순서를 바꾼 뒤 저장하세요. 미지정 시 히어로는 노출되지 않습니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-ink-subtle">
            히어로에 표시할 소식이 없습니다. ‘소식 추가’로 최대 {MAX_HERO}개까지
            선택하세요.
          </div>
        ) : (
          <DndContext
            id="news-hero-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={onDragEnd}
            accessibility={{
              announcements: {
                onDragStart: ({ active }) =>
                  `${labelOf(active.id as string)} 항목을 집었습니다.`,
                onDragOver: ({ active, over }) =>
                  over
                    ? `${labelOf(active.id as string)} 항목을 ${posOf(over.id as string)}번 위치로 이동 중입니다.`
                    : "",
                onDragEnd: ({ active, over }) =>
                  over
                    ? `${labelOf(active.id as string)} 항목을 ${posOf(over.id as string)}번 위치에 놓았습니다.`
                    : "이동을 취소했습니다.",
                onDragCancel: ({ active }) =>
                  `${labelOf(active.id as string)} 이동을 취소했습니다.`,
              },
            }}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <SortableHeroRow
                    key={item.id}
                    item={item}
                    index={i}
                    onRemove={removeItem}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
            disabled={items.length >= MAX_HERO || isPending}
          >
            <Plus className="mr-1 size-4" aria-hidden />
            소식 추가
          </Button>
          {items.length >= MAX_HERO && (
            <span className="text-xs text-ink-date">
              최대 {MAX_HERO}개까지 지정할 수 있습니다.
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setItems(initialItems)}
              disabled={isPending}
            >
              되돌리기
            </Button>
          )}
          <Button
            type="button"
            onClick={onSave}
            disabled={!isDirty || isPending}
          >
            {isPending ? "저장 중..." : "순서 저장"}
          </Button>
        </div>
      </CardContent>

      {/* 소식 추가 picker */}
      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setQuery("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>소식 추가</DialogTitle>
            <DialogDescription>
              소식 히어로에 노출할 발행 글을 선택해 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="제목으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="max-h-80 divide-y overflow-y-auto">
            {available.length === 0 ? (
              <li className="py-6 text-center text-sm text-ink-subtle">
                추가할 수 있는 발행 글이 없습니다.
              </li>
            ) : (
              available.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      addItem(item);
                      setPickerOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-surface-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                  >
                    <Thumb item={item} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-strong">
                        {item.title}
                      </p>
                      <p className="text-xs text-ink-subtle">
                        {item.categoryName}
                      </p>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
