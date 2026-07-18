// 어드민 홈 팝업 목록 — 노출 상태·활성 전환·수정·삭제를 한 화면에서 관리한다.
"use client";

import { useState, useTransition } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePopupAction, setPopupActiveAction } from "@/features/popups/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export type PopupRow = {
  id: string;
  title: string;
  imageUrl: string;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
};

type PopupStatus = "inactive" | "scheduled" | "active" | "ended";

const STATUS_LABEL: Record<PopupStatus, string> = {
  inactive: "꺼짐",
  scheduled: "대기",
  active: "노출 중",
  ended: "종료",
};

const STATUS_CLASS: Record<PopupStatus, string> = {
  inactive: "bg-warm/15 text-amber-700",
  scheduled: "bg-kpi-lime/30 text-ink-strong",
  active: "bg-brand-primary/10 text-brand-primary",
  ended: "bg-muted text-ink-subtle",
};

function getPopupStatus(row: PopupRow): PopupStatus {
  if (!row.isActive) return "inactive";
  const now = Date.now();
  if (new Date(row.startsAt).getTime() > now) return "scheduled";
  if (row.endsAt && new Date(row.endsAt).getTime() <= now) return "ended";
  return "active";
}

function formatDateTime(value: Date): string {
  const date = new Date(value);
  const dateText = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
    .join(".");
  const timeText = [date.getHours(), date.getMinutes()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
  return `${dateText} ${timeText}`;
}

function formatPeriod(row: PopupRow): string {
  return `${formatDateTime(row.startsAt)} ~ ${row.endsAt ? formatDateTime(row.endsAt) : "무기한"}`;
}

export function PopupTable({ rows }: { rows: PopupRow[] }) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleActive = (row: PopupRow, isActive: boolean) => {
    startTransition(async () => {
      const result = await setPopupActiveAction(row.id, isActive);
      if (!result.success) {
        toast.error(typeof result.error === "string" ? result.error : "상태 변경에 실패했습니다.");
        return;
      }
      toast.success(isActive ? "팝업을 활성화했습니다." : "팝업을 비활성화했습니다.");
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!confirmId) return;
    startTransition(async () => {
      const result = await deletePopupAction(confirmId);
      if (!result.success) {
        toast.error(typeof result.error === "string" ? result.error : "삭제에 실패했습니다.");
        return;
      }
      setConfirmId(null);
      toast.success("팝업을 삭제했습니다.");
      router.refresh();
    });
  };

  const actions = (row: PopupRow) => (
    <div className="flex justify-end gap-1">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/popups/${row.id}/edit`}>수정</Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmId(row.id)}
        disabled={isPending}
        className="text-destructive hover:text-destructive"
      >
        삭제
      </Button>
    </div>
  );

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-subtle">등록된 팝업이 없습니다.</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b text-left text-ink-subtle">
                    <tr>
                      <th className="py-3 pr-4 font-medium">이미지</th>
                      <th className="py-3 pr-4 font-medium">제목</th>
                      <th className="py-3 pr-4 font-medium">노출 기간</th>
                      <th className="py-3 pr-4 font-medium">상태</th>
                      <th className="py-3 pr-4 font-medium">활성</th>
                      <th className="py-3 text-right font-medium">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const status = getPopupStatus(row);
                      return (
                        <tr key={row.id} className="border-b transition-colors last:border-b-0 hover:bg-surface-soft/60">
                          <td className="py-3 pr-4">
                            <NextImage
                              src={row.imageUrl}
                              alt=""
                              width={64}
                              height={40}
                              className="h-10 w-16 rounded object-cover"
                              unoptimized
                            />
                          </td>
                          <td className="py-3 pr-4 font-medium text-ink-strong">
                            <Link href={`/admin/popups/${row.id}/edit`} className="rounded hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40">
                              {row.title}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-xs text-ink-subtle">{formatPeriod(row)}</td>
                          <td className="py-3 pr-4">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}>
                              {STATUS_LABEL[status]}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <Switch
                              checked={row.isActive}
                              onCheckedChange={(checked) => toggleActive(row, checked)}
                              disabled={isPending}
                              aria-label={`${row.title} 활성 상태`}
                            />
                          </td>
                          <td className="py-3">{actions(row)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {rows.map((row) => {
                  const status = getPopupStatus(row);
                  return (
                    <li key={row.id} className="space-y-3 rounded-lg border border-border p-4">
                      <div className="flex gap-3">
                        <NextImage
                          src={row.imageUrl}
                          alt=""
                          width={64}
                          height={40}
                          className="h-10 w-16 shrink-0 rounded object-cover"
                          unoptimized
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <Link href={`/admin/popups/${row.id}/edit`} className="font-medium text-ink-strong hover:text-brand-primary">
                            {row.title}
                          </Link>
                          <p className="text-xs text-ink-subtle">{formatPeriod(row)}</p>
                        </div>
                        <span className={`h-fit shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-subtle">활성</span>
                        <Switch
                          checked={row.isActive}
                          onCheckedChange={(checked) => toggleActive(row, checked)}
                          disabled={isPending}
                          aria-label={`${row.title} 활성 상태`}
                        />
                      </div>
                      {actions(row)}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmId !== null} onOpenChange={(open) => !open && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>팝업을 삭제할까요?</DialogTitle>
            <DialogDescription>삭제한 팝업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)} disabled={isPending}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
