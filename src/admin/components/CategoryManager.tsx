// 카테고리 관리 UI — 상단 추가 폼 + 드래그 정렬 리스트(글 수·활성·수정) + 수정 Dialog. 정렬은 @dnd-kit 드래그 전용(소식 히어로 동일 UX). ADR-025 slug immutable.
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { GripVertical } from "lucide-react";

import {
  createCategoryAction,
  updateCategoryAction,
  reorderCategoriesAction,
} from "@/features/categories/actions";
import {
  createCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  updateCategorySchema,
} from "@/features/categories/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { HelpTip } from "@/admin/components/HelpTip";
import { CategoryTabsPreview } from "@/admin/components/CategoryTabsPreview";
import type { NewsBoard } from "@/features/news/board";
import { ADMIN_COPY } from "@/admin/copy";

const CAT = ADMIN_COPY.categories;

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  newsCount: number;
};

type Props = {
  /** 어느 게시판 카테고리인가 (ADR-056) — 생성·수정·정렬 대상 게시판을 결정 */
  board: NewsBoard;
  rows: CategoryRow[];
};

export function CategoryManager({ board, rows }: Props) {
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 서버 revalidate 로 rows 가 갱신되면(추가·수정·정렬저장·활성토글) 드래그 로컬 상태를 새 값으로 리셋 (anti-slop: prop→state 동기화는 key remount).
  // name·isActive 도 포함 — 수정 다이얼로그로 이름/활성만 바꾸면 sortOrder 불변이라 remount 안 돼 리스트가 stale 로 남던 버그 수정.
  const rowsKey = rows
    .map((r) => `${r.id}:${r.sortOrder}:${r.name}:${r.isActive}`)
    .join("|");

  return (
    <div className="space-y-8">
      <CategoryTabsPreview
        names={rows.filter((r) => r.isActive).map((r) => r.name)}
      />
      <CreateForm board={board} onError={setError} />
      <ErrorBanner message={error} onClose={() => setError(null)} />
      <CategoryOrderList
        key={rowsKey}
        board={board}
        rows={rows}
        onEdit={setEditing}
        onError={setError}
      />
      {editing && (
        <EditDialog
          board={board}
          row={editing}
          onClose={() => setEditing(null)}
          onError={setError}
        />
      )}
    </div>
  );
}

// ─── 상단 추가 폼 (sortOrder 입력 없음 — 새 카테고리는 맨 끝 자동 배치) ──────

function CreateForm({
  board,
  onError,
}: {
  board: NewsBoard;
  onError: (msg: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", slug: "" },
  });

  const onSubmit = (values: CreateCategoryInput) => {
    onError(null);
    startTransition(async () => {
      const result = await createCategoryAction(board, values);
      if (!result.success) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.";
        onError(msg);
        return;
      }
      form.reset({ name: "", slug: "" });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">새 카테고리 추가</CardTitle>
        <p className="text-sm text-ink-subtle">
          추가하면 목록 맨 아래에 들어갑니다. 노출 순서는 아래에서 드래그로
          조정하세요.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1.5">
                    <FormLabel>{CAT.nameLabel}</FormLabel>
                    <HelpTip>{CAT.nameHelp}</HelpTip>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="예: 환경 캠페인"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1.5">
                    <FormLabel>{CAT.slugLabel}</FormLabel>
                    <HelpTip>{CAT.slugHelp}</HelpTip>
                  </div>
                  <FormControl>
                    <Input
                      placeholder={CAT.slugPlaceholder}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "추가 중..." : "추가"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ─── 드래그 정렬 리스트 ─────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-kpi-lime/40 text-ink-strong"
          : "bg-muted text-ink-subtle",
      )}
    >
      {active ? CAT.activeOn : CAT.activeOff}
    </span>
  );
}

function SortableCategoryRow({
  row,
  index,
  onEdit,
  reducedMotion,
}: {
  row: CategoryRow;
  index: number;
  onEdit: (row: CategoryRow) => void;
  reducedMotion: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });
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
        aria-label={`${row.name} 순서 변경 (현재 ${index + 1}번)`}
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
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink-strong">
            {row.name}
          </p>
          <ActiveBadge active={row.isActive} />
        </div>
        <p className="truncate text-xs text-ink-subtle">
          <span className="font-mono text-ink-date">{row.slug}</span>
          <span className="tabular-nums"> · 글 {row.newsCount}건</span>
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onEdit(row)}
        className="min-h-10 shrink-0 md:min-h-8"
      >
        수정
      </Button>
    </li>
  );
}

function CategoryOrderList({
  board,
  rows,
  onEdit,
  onError,
}: {
  board: NewsBoard;
  rows: CategoryRow[];
  onEdit: (row: CategoryRow) => void;
  onError: (msg: string | null) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CategoryRow[]>(rows);
  const [isPending, startTransition] = useTransition();

  const initialIds = useMemo(() => rows.map((r) => r.id).join(","), [rows]);
  const isDirty = items.map((i) => i.id).join(",") !== initialIds;

  const reducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const labelOf = (id: string) =>
    items.find((i) => i.id === id)?.name ?? "카테고리";
  const posOf = (id: string) => items.findIndex((i) => i.id === id) + 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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

  const onSave = () => {
    onError(null);
    startTransition(async () => {
      const result = await reorderCategoriesAction(board, {
        orderedIds: items.map((i) => i.id),
      });
      if (!result.success) {
        onError(
          typeof result.error === "string"
            ? result.error
            : "정렬 저장에 실패했습니다.",
        );
        return;
      }
      toast.success("카테고리 순서가 저장되었습니다. 사용자 사이트 탭에 즉시 반영됩니다.");
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-ink-subtle">
          등록된 카테고리가 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-xl">카테고리 목록</CardTitle>
        <p className="text-sm text-ink-subtle">
          드래그로 노출 순서를 바꾼 뒤 저장하세요. 순서는 사용자 사이트의 소식
          분류 탭에 그대로 반영됩니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          id="admin-categories-dnd"
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
              {items.map((row, i) => (
                <SortableCategoryRow
                  key={row.id}
                  row={row}
                  index={i}
                  onEdit={onEdit}
                  reducedMotion={reducedMotion}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setItems(rows)}
              disabled={isPending}
            >
              되돌리기
            </Button>
          )}
          <Button type="button" onClick={onSave} disabled={!isDirty || isPending}>
            {isPending ? "저장 중..." : "순서 저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 수정 Dialog (이름 + 활성 — 정렬은 드래그 전용) ──────────────────────────

function EditDialog({
  board,
  row,
  onClose,
  onError,
}: {
  board: NewsBoard;
  row: CategoryRow;
  onClose: () => void;
  onError: (msg: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: row.name,
      isActive: row.isActive,
    },
  });

  const onSubmit = (values: UpdateCategoryInput) => {
    onError(null);
    startTransition(async () => {
      const result = await updateCategoryAction(board, row.id, values);
      if (!result.success) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.";
        onError(msg);
        return;
      }
      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카테고리 수정</DialogTitle>
          <DialogDescription>
            카테고리 이름과 사용자 사이트 표시 여부를 수정합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border bg-muted/30 px-4 py-3 text-xs text-ink-subtle">
          <span className="font-mono text-ink-strong">{row.slug}</span> —{" "}
          {CAT.slugLockNotice}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <FormLabel>{CAT.activeLabel}</FormLabel>
                    <p className="text-xs text-ink-subtle">{CAT.activeHelp}</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── 에러 배너 ───────────────────────────────────────────────────────────

function ErrorBanner({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="rounded text-xs underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-2"
        aria-label="닫기"
      >
        닫기
      </button>
    </div>
  );
}
