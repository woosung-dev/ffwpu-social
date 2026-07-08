// 공지 상위 고정 관리 — 발행 공지를 드래그(키보드 포함)로 순서 지정, 명시 Save 로 저장. HeroOrderManager 이식(썸네일·카테고리 제거)
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

import { setNoticePinOrderAction } from "@/features/notices/actions";
import { MAX_PINNED_NOTICES } from "@/features/notices/schemas";
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
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

const PIN = ADMIN_COPY.notices;

// 날짜는 서버에서 포맷(YYYY.MM.DD) — 클라 Date 포맷의 TZ hydration mismatch 회피
export type NoticePinItem = {
  id: string;
  title: string;
  dateText: string;
};

type Props = {
  initialItems: NoticePinItem[]; // 현재 고정 (rank 순)
  candidates: NoticePinItem[]; // 발행됐으나 미고정
};

function SortablePinRow({
  item,
  index,
  onRemove,
  reducedMotion,
}: {
  item: NoticePinItem;
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
        "flex items-center gap-2 rounded-lg border border-border bg-white p-2.5 md:gap-3 md:p-3",
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
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-strong">
          {item.title}
        </p>
        <p className="text-xs text-ink-subtle">{item.dateText}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        aria-label={`${item.title} 고정 해제`}
        className="min-h-10 shrink-0 text-ink-subtle md:min-h-8"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </li>
  );
}

export function NoticePinOrderManager({ initialItems, candidates }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<NoticePinItem[]>(initialItems);
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

  // 전체 발행 공지 풀 (현재 고정 + 후보). 추가 가능 목록 = 풀 중 현재 미선택
  const pool = useMemo(() => {
    const map = new Map<string, NoticePinItem>();
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

  const addItem = (item: NoticePinItem) => {
    if (items.length >= MAX_PINNED_NOTICES) return;
    setItems((cur) => [...cur, item]);
  };
  const removeItem = (id: string) =>
    setItems((cur) => cur.filter((i) => i.id !== id));

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await setNoticePinOrderAction({
        orderedNoticeIds: items.map((i) => i.id),
      });
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "저장에 실패했습니다.",
        );
        return;
      }
      toast.success("상위 고정 순서가 저장되었습니다. 공지 목록 상단에 즉시 반영됩니다.");
      router.refresh();
    });
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-xl">
          {PIN.pinTitle} (최대 {MAX_PINNED_NOTICES}개)
          <HelpTip>{PIN.pinHelp}</HelpTip>
        </CardTitle>
        <p className="text-sm text-ink-subtle">
          중요한 공지를 목록 맨 위에 최대 {MAX_PINNED_NOTICES}개까지 고정하고 드래그로
          순서를 바꾼 뒤 저장하세요. 발행된 공지만 고정할 수 있어요.
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
            고정된 공지가 없습니다. ‘공지 추가’로 최대 {MAX_PINNED_NOTICES}개까지
            선택하세요.
          </div>
        ) : (
          <DndContext
            id="notice-pin-dnd"
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
                  <SortablePinRow
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
            disabled={items.length >= MAX_PINNED_NOTICES || isPending}
            className="min-h-10 md:min-h-8"
          >
            <Plus className="mr-1 size-4" aria-hidden />
            공지 추가
          </Button>
          {items.length >= MAX_PINNED_NOTICES && (
            <span className="text-xs text-ink-date">
              최대 {MAX_PINNED_NOTICES}개까지 고정할 수 있습니다.
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

      {/* 공지 추가 picker */}
      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setQuery("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공지 추가</DialogTitle>
            <DialogDescription>
              목록 상단에 고정할 발행된 공지를 선택해 추가합니다.
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
                추가할 수 있는 발행 공지가 없습니다.
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-strong">
                        {item.title}
                      </p>
                      <p className="text-xs text-ink-subtle">{item.dateText}</p>
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
