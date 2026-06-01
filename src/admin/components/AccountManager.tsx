// 관리자 계정 관리 — 목록 + 추가(Dialog) + 비밀번호 재설정(Dialog) + 삭제(confirm). 본인·마지막 super 삭제 비활성. 모든 신규 계정 super 권한
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createAccountAction,
  resetPasswordAction,
  deleteAccountAction,
} from "@/features/accounts/actions";
import {
  createAccountFormSchema,
  resetPasswordFormSchema,
  type CreateAccountFormInput,
  type ResetPasswordFormInput,
} from "@/features/accounts/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "./PasswordInput";

export type AccountRow = {
  id: string;
  email: string;
  name: string;
  role: "super" | "editor" | "viewer";
  createdAt: Date;
};

type Props = {
  accounts: AccountRow[];
  currentUserId: string;
  superCount: number;
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function AccountManager({ accounts, currentUserId, superCount }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<AccountRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccountRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const addForm = useForm<CreateAccountFormInput>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: { email: "", name: "", password: "", passwordConfirm: "" },
  });

  const resetForm = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { userId: "", password: "", passwordConfirm: "" },
  });

  const onCreate = (values: CreateAccountFormInput) => {
    startTransition(async () => {
      const result = await createAccountAction({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      if (!result.success) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.";
        // 중복 이메일 등 액션 에러는 이메일 필드에 표시
        addForm.setError("email", { message: msg });
        return;
      }
      toast.success("계정이 생성되었습니다.");
      setAddOpen(false);
      addForm.reset();
      router.refresh();
    });
  };

  const openReset = (account: AccountRow) => {
    setResetTarget(account);
    resetForm.reset({ userId: account.id, password: "", passwordConfirm: "" });
  };

  const onReset = (values: ResetPasswordFormInput) => {
    startTransition(async () => {
      const result = await resetPasswordAction({
        userId: values.userId,
        password: values.password,
      });
      if (!result.success) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.";
        resetForm.setError("password", { message: msg });
        return;
      }
      toast.success("비밀번호가 재설정되었습니다.");
      setResetTarget(null);
      resetForm.reset();
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setActionError(null);
    startTransition(async () => {
      const result = await deleteAccountAction({ userId: targetId });
      if (!result.success) {
        const msg =
          typeof result.error === "string" ? result.error : "삭제 실패";
        setActionError(msg);
        setDeleteTarget(null);
        return;
      }
      toast.success("계정이 삭제되었습니다.");
      setDeleteTarget(null);
      router.refresh();
    });
  };

  // 행 액션 버튼 — 데스크탑 테이블/모바일 카드 공용 (본인·마지막 super 삭제 비활성)
  const renderRowActions = (account: AccountRow) => {
    const isSelf = account.id === currentUserId;
    const isLastSuper = account.role === "super" && superCount <= 1;
    const deleteDisabled = isPending || isSelf || isLastSuper;
    const deleteReason = isSelf
      ? "본인 계정은 삭제할 수 없습니다"
      : isLastSuper
        ? "마지막 관리자는 삭제할 수 없습니다"
        : undefined;
    return (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openReset(account)}
          disabled={isPending}
        >
          비밀번호 재설정
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteTarget(account)}
          disabled={deleteDisabled}
          title={deleteReason}
          aria-disabled={deleteDisabled}
          className="text-destructive hover:text-destructive"
        >
          삭제
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-subtle">
          신규 계정은 관리자(super) 권한으로 생성됩니다.
        </p>
        <Button onClick={() => setAddOpen(true)}>+ 계정 추가</Button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="rounded text-xs underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-2"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {/* 데스크탑 — 테이블 (md 이상) */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b text-ink-subtle">
                <tr className="text-left">
                  <th className="py-3 pr-4 font-medium">이름</th>
                  <th className="py-3 pr-4 font-medium">이메일</th>
                  <th className="py-3 pr-4 font-medium">권한</th>
                  <th className="py-3 pr-4 font-medium">생성일</th>
                  <th className="py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const isSelf = account.id === currentUserId;
                  return (
                    <tr
                      key={account.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-surface-soft/60"
                    >
                      <td className="py-3 pr-4 font-medium text-ink-strong">
                        {account.name}
                        {isSelf && (
                          <span className="ml-2 text-xs text-ink-subtle">
                            (나)
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-ink-subtle">
                        {account.email}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-brand-primary/10 px-2 py-1 text-xs font-medium text-brand-primary">
                          {account.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-ink-subtle">
                        {formatDate(account.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        {renderRowActions(account)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 모바일 — 카드 (md 미만, 가로 스크롤 없이 액션 도달) */}
          <ul className="space-y-3 md:hidden">
            {accounts.map((account) => {
              const isSelf = account.id === currentUserId;
              return (
                <li
                  key={account.id}
                  className="space-y-2 rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink-strong">
                      {account.name}
                      {isSelf && (
                        <span className="ml-1 text-xs text-ink-subtle">
                          (나)
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-brand-primary/10 px-2 py-1 text-xs font-medium text-brand-primary">
                      {account.role}
                    </span>
                  </div>
                  <p className="break-all text-sm text-ink-subtle">
                    {account.email}
                  </p>
                  <p className="text-xs text-ink-date">
                    {formatDate(account.createdAt)}
                  </p>
                  {renderRowActions(account)}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* 계정 추가 Dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) addForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 추가</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={addForm.handleSubmit(onCreate)}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="add-email">
                이메일 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Input
                id="add-email"
                type="email"
                autoComplete="off"
                required
                aria-required
                aria-invalid={!!addForm.formState.errors.email}
                aria-describedby={
                  addForm.formState.errors.email ? "add-email-error" : undefined
                }
                disabled={isPending}
                {...addForm.register("email")}
              />
              {addForm.formState.errors.email && (
                <p id="add-email-error" className="text-xs text-destructive">
                  {addForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-name">
                이름 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Input
                id="add-name"
                required
                aria-required
                aria-invalid={!!addForm.formState.errors.name}
                aria-describedby={
                  addForm.formState.errors.name ? "add-name-error" : undefined
                }
                disabled={isPending}
                {...addForm.register("name")}
              />
              {addForm.formState.errors.name && (
                <p id="add-name-error" className="text-xs text-destructive">
                  {addForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">
                비밀번호 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <PasswordInput
                id="add-password"
                autoComplete="new-password"
                required
                aria-required
                aria-invalid={!!addForm.formState.errors.password}
                aria-describedby={
                  addForm.formState.errors.password
                    ? "add-password-hint add-password-error"
                    : "add-password-hint"
                }
                disabled={isPending}
                {...addForm.register("password")}
              />
              <p id="add-password-hint" className="text-xs text-ink-date">
                최소 10자, 영문과 숫자를 포함해야 합니다.
              </p>
              {addForm.formState.errors.password && (
                <p id="add-password-error" className="text-xs text-destructive">
                  {addForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password-confirm">
                비밀번호 확인{" "}
                <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <PasswordInput
                id="add-password-confirm"
                autoComplete="new-password"
                required
                aria-required
                aria-invalid={!!addForm.formState.errors.passwordConfirm}
                aria-describedby={
                  addForm.formState.errors.passwordConfirm
                    ? "add-password-confirm-error"
                    : undefined
                }
                disabled={isPending}
                {...addForm.register("passwordConfirm")}
              />
              {addForm.formState.errors.passwordConfirm && (
                <p
                  id="add-password-confirm-error"
                  className="text-xs text-destructive"
                >
                  {addForm.formState.errors.passwordConfirm.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddOpen(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "생성 중..." : "계정 생성"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 비밀번호 재설정 Dialog */}
      <Dialog
        open={resetTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResetTarget(null);
            resetForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 재설정 — {resetTarget?.name}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={resetForm.handleSubmit(onReset)}
            noValidate
            className="space-y-4"
          >
            <input type="hidden" {...resetForm.register("userId")} />
            <div className="space-y-2">
              <Label htmlFor="reset-password">
                새 비밀번호 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <PasswordInput
                id="reset-password"
                autoComplete="new-password"
                required
                aria-required
                aria-invalid={!!resetForm.formState.errors.password}
                aria-describedby={
                  resetForm.formState.errors.password
                    ? "reset-password-hint reset-password-error"
                    : "reset-password-hint"
                }
                disabled={isPending}
                {...resetForm.register("password")}
              />
              <p id="reset-password-hint" className="text-xs text-ink-date">
                최소 10자, 영문과 숫자를 포함해야 합니다.
              </p>
              {resetForm.formState.errors.password && (
                <p id="reset-password-error" className="text-xs text-destructive">
                  {resetForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm">
                새 비밀번호 확인{" "}
                <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <PasswordInput
                id="reset-password-confirm"
                autoComplete="new-password"
                required
                aria-required
                aria-invalid={!!resetForm.formState.errors.passwordConfirm}
                aria-describedby={
                  resetForm.formState.errors.passwordConfirm
                    ? "reset-password-confirm-error"
                    : undefined
                }
                disabled={isPending}
                {...resetForm.register("passwordConfirm")}
              />
              {resetForm.formState.errors.passwordConfirm && (
                <p
                  id="reset-password-confirm-error"
                  className="text-xs text-destructive"
                >
                  {resetForm.formState.errors.passwordConfirm.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setResetTarget(null)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-subtle">
            <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}) 계정을
            삭제하시겠습니까? 되돌릴 수 없습니다.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
