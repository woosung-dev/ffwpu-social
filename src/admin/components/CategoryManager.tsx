// 카테고리 관리 UI — 상단 추가 폼 + row 리스트 (글 수·정렬·활성) + 수정 Dialog. ADR-025 slug immutable.
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  createCategoryAction,
  updateCategoryAction,
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

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  newsCount: number;
};

type Props = { rows: CategoryRow[] };

export function CategoryManager({ rows }: Props) {
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <CreateForm onError={setError} />
      <ErrorBanner message={error} onClose={() => setError(null)} />
      <CategoriesTable rows={rows} onEdit={setEditing} />
      {editing && (
        <EditDialog
          row={editing}
          onClose={() => setEditing(null)}
          onError={setError}
        />
      )}
    </div>
  );
}

// ─── 상단 추가 폼 ──────────────────────────────────────────────────────────

function CreateForm({ onError }: { onError: (msg: string | null) => void }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", slug: "", sortOrder: 0 },
  });

  const onSubmit = (values: CreateCategoryInput) => {
    onError(null);
    startTransition(async () => {
      const result = await createCategoryAction(values);
      if (!result.success) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.";
        onError(msg);
        return;
      }
      form.reset({ name: "", slug: "", sortOrder: 0 });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">새 카테고리 추가</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto] md:items-end"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
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
                  <FormLabel>slug (URL)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="environment"
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
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정렬</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={9999}
                      disabled={isPending}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
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

// ─── 리스트 ───────────────────────────────────────────────────────────────

function CategoriesTable({
  rows,
  onEdit,
}: {
  rows: CategoryRow[];
  onEdit: (row: CategoryRow) => void;
}) {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">카테고리 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b text-ink-subtle">
              <tr className="text-left">
                <th className="py-3 pr-4 font-medium">이름</th>
                <th className="py-3 pr-4 font-medium">slug</th>
                <th className="py-3 pr-4 font-medium">글 수</th>
                <th className="py-3 pr-4 font-medium">정렬</th>
                <th className="py-3 pr-4 font-medium">활성</th>
                <th className="py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 transition-colors hover:bg-surface-soft/60"
                >
                  <td className="py-3 pr-4 font-medium text-ink-strong">
                    {row.name}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-date">
                    {row.slug}
                  </td>
                  <td className="py-3 pr-4 text-ink-strong tabular-nums">
                    {row.newsCount}건
                  </td>
                  <td className="py-3 pr-4 text-ink-strong tabular-nums">
                    {row.sortOrder}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        row.isActive
                          ? "rounded-full bg-kpi-lime/40 px-2 py-1 text-xs font-medium text-ink-strong"
                          : "rounded-full bg-muted px-2 py-1 text-xs font-medium text-ink-subtle"
                      }
                    >
                      {row.isActive ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(row)}
                    >
                      수정
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 수정 Dialog ─────────────────────────────────────────────────────────

function EditDialog({
  row,
  onClose,
  onError,
}: {
  row: CategoryRow;
  onClose: () => void;
  onError: (msg: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: row.name,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    },
  });

  const onSubmit = (values: UpdateCategoryInput) => {
    onError(null);
    startTransition(async () => {
      const result = await updateCategoryAction(row.id, values);
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
        </DialogHeader>
        <div className="rounded-md border bg-muted/30 px-4 py-3 text-xs text-ink-subtle">
          slug{" "}
          <span className="font-mono text-ink-strong">{row.slug}</span>{" "}
          는 변경할 수 없습니다 (ADR-025).
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
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
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정렬</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={9999}
                      disabled={isPending}
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
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
                    <FormLabel>활성</FormLabel>
                    <p className="text-xs text-ink-subtle">
                      비활성 시 사용자 사이트 탭과 어드민 글 작성 선택지에서 숨김.
                    </p>
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
