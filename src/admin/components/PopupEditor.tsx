// 어드민 홈 팝업 작성·수정 — 이미지·노출 기간·활성 상태를 함께 저장한다.
"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createPopupAction, updatePopupAction } from "@/features/popups/actions";
import { popupFormSchema, type PopupInput } from "@/features/popups/schemas";
import { ADMIN_COPY } from "@/admin/copy";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CoverImageUploader } from "./CoverImageUploader";
import { DateTimePicker } from "./DateTimePicker";
import { HelpTip } from "./HelpTip";

export type PopupEditorInitial = {
  id: string;
  title: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  linkUrl: string | null;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
};

type Props = {
  mode: "new" | "edit";
  initial?: PopupEditorInitial;
};

// 이미지·기간·활성 상태는 RHF 밖에서 관리해 업로더와 날짜 선택기의 상태를 단순하게 유지한다.
// Zod v4 는 refine 붙은 스키마에 omit 을 허용하지 않아 schemas.ts 의 pick 파생을 사용한다.
const formSchema = popupFormSchema;
type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function getActionError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "입력값을 확인해주세요.";
  return "입력값을 확인해주세요.";
}

export function PopupEditor({ mode, initial }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [newPopupNonce, setNewPopupNonce] = useState(0);
  const generatedId = useMemo(() => crypto.randomUUID(), [newPopupNonce]);
  const popupId = isEdit ? initial!.id : generatedId;
  const [image, setImage] = useState({
    url: initial?.imageUrl ?? null,
    width: initial?.imageWidth ?? null,
    height: initial?.imageHeight ?? null,
  });
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? new Date());
  const [endsAt, setEndsAt] = useState<Date | null>(initial?.endsAt ?? null);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initial?.title ?? "",
      linkUrl: initial?.linkUrl ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    if (!image.url) {
      toast.error("이미지를 업로드해주세요");
      return;
    }
    const payload: PopupInput = {
      title: values.title,
      imageUrl: image.url,
      imageWidth: image.width,
      imageHeight: image.height,
      linkUrl: values.linkUrl || null,
      startsAt,
      endsAt,
      isActive,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updatePopupAction(initial!.id, payload)
        : await createPopupAction(popupId, payload);
      if (!result.success) {
        setError(getActionError(result.error));
        return;
      }
      if (!isEdit) {
        form.reset({ title: "", linkUrl: "" });
        setImage({ url: null, width: null, height: null });
        setStartsAt(new Date());
        setEndsAt(null);
        setIsActive(true);
        setNewPopupNonce((nonce) => nonce + 1);
      }
      toast.success(isEdit ? "팝업을 수정했습니다." : "팝업을 등록했습니다.");
      router.push("/admin/popups");
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="popup-title" className="text-sm font-semibold text-ink-strong">
                제목 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Input
                id="popup-title"
                placeholder="팝업 제목을 입력하세요"
                required
                aria-required
                aria-invalid={!!form.formState.errors.title}
                aria-describedby={form.formState.errors.title ? "popup-title-error" : undefined}
                disabled={isPending}
                className="h-11 text-base"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p id="popup-title-error" className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-ink-strong">이미지</h2>
                <HelpTip>{ADMIN_COPY.popups.imageHelp}</HelpTip>
              </div>
              <CoverImageUploader
                value={image.url}
                onChange={(url, dims) =>
                  setImage({
                    url,
                    width: dims?.width ?? null,
                    height: dims?.height ?? null,
                  })
                }
                scope={{ popupId }}
                onError={setError}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="popup-link" className="text-sm font-semibold text-ink-strong">
                  링크 주소
                </Label>
                <HelpTip>{ADMIN_COPY.popups.linkHelp}</HelpTip>
              </div>
              <Input
                id="popup-link"
                placeholder="/news 또는 https://example.com"
                disabled={isPending}
                {...form.register("linkUrl")}
              />
              {form.formState.errors.linkUrl && (
                <p className="text-xs text-destructive">{form.formState.errors.linkUrl.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-ink-strong">노출 시작일</h2>
                  <DateTimePicker value={startsAt} onChange={setStartsAt} disabled={isPending} />
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-ink-strong">종료일 설정</h2>
                      <p className="text-xs text-ink-subtle">끄면 무기한으로 노출됩니다.</p>
                    </div>
                    <Switch
                      checked={endsAt !== null}
                      onCheckedChange={(checked) => setEndsAt(checked ? new Date() : null)}
                      disabled={isPending}
                      aria-label="종료일 설정"
                    />
                  </div>
                  {endsAt && <DateTimePicker value={endsAt} onChange={setEndsAt} disabled={isPending} />}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="flex items-center gap-1.5">
                    <div>
                      <h2 className="text-sm font-semibold text-ink-strong">활성</h2>
                      <p className="text-xs text-ink-subtle">활성인 팝업만 공개 후보가 됩니다.</p>
                    </div>
                    <HelpTip>{ADMIN_COPY.popups.dismissHelp}</HelpTip>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    disabled={isPending}
                    aria-label="팝업 활성 상태"
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "저장 중..." : isEdit ? "수정 저장" : "팝업 등록"}
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
