// 어드민 공지 작성·수정 — NewsEditor 미러(카테고리·태그·커버·슬롯 제거, 첨부 추가). body 는 useState 별도 (codex P1#6)
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import {
  createNoticeAction,
  updateNoticeAction,
} from "@/features/notices/actions";
import { noticeInputSchema, type NoticeInput } from "@/features/notices/schemas";
import {
  NoticeAttachmentUploader,
  type NoticeAttachmentItem,
} from "./NoticeAttachmentUploader";
import { DateTimePicker } from "./DateTimePicker";
import { HelpTip } from "./HelpTip";
import { ADMIN_COPY } from "@/admin/copy";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import "@/styles/admin-editor-embed.scss";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type NoticeEditorInitial = {
  id: string;
  title: string;
  body: JSONContent;
  publishedAt: Date | null;
  attachments: Array<{
    id: string;
    fileName: string;
    key: string;
    mime: string;
    size: number;
  }>;
};

type Props = {
  mode: "new" | "edit";
  initial?: NoticeEditorInitial;
};

type PublishState = "draft" | "scheduled" | "published";

// 폼 schema — body·publishedAt·attachments 는 form 외부 관리 (Tiptap 무한루프 회피 + 업로드 진행 상태)
const formSchema = noticeInputSchema.omit({
  body: true,
  publishedAt: true,
  attachments: true,
});
type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function getPublishState(publishedAt: Date | null): PublishState {
  if (!publishedAt) return "draft";
  return publishedAt.getTime() > Date.now() ? "scheduled" : "published";
}

const PUBLISH_STATE_LABEL: Record<PublishState, string> = {
  draft: "임시 저장",
  scheduled: "예약",
  published: "발행",
};

const PUBLISH_STATE_CLASS: Record<PublishState, string> = {
  draft: "bg-warm/15 text-amber-700",
  scheduled: "bg-kpi-lime/30 text-ink-strong",
  published: "bg-brand-primary/10 text-brand-primary",
};

function toAttachmentItems(
  attachments: NoticeEditorInitial["attachments"],
): NoticeAttachmentItem[] {
  return attachments.map((a) => ({
    clientId: a.id,
    fileName: a.fileName,
    key: a.key,
    mime: a.mime,
    size: a.size,
    status: "done" as const,
  }));
}

export function NoticeEditor({ mode, initial }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // 새 공지 세션 nonce — 저장 성공 후 다음 "새 공지" 를 위한 깨끗한 식별자 재생성 (NewsEditor 동일, PPR 상태 보존 대응)
  const [newPostNonce, setNewPostNonce] = useState(0);
  // 새 공지도 client 에서 UUID 생성 → 업로드 prefix(notices/{id}/) 와 notices.id 를 동일하게
  const generatedId = useMemo(() => crypto.randomUUID(), [newPostNonce]);
  const noticeId = isEdit ? initial!.id : generatedId;

  // body 는 RHF 외부 useState — Tiptap 무한 루프 방지 (codex P1#6)
  const [body, setBody] = useState<JSONContent>(
    initial?.body ?? { type: "doc", content: [] },
  );
  const [attachments, setAttachments] = useState<NoticeAttachmentItem[]>(
    initial ? toAttachmentItems(initial.attachments) : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // 발행 일시 — 발행 시 적용. 기존 발행글은 그 일시, 신규·임시는 현재 기본
  const [publishAt, setPublishAt] = useState<Date>(
    initial?.publishedAt ?? new Date(),
  );

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: initial?.title ?? "" },
  });

  // submit handler — publish=true → 선택 일시 저장(미래면 예약 발행), false → null
  const submit = (publish: boolean) =>
    form.handleSubmit((values) => {
      setError(null);
      if (attachments.some((a) => a.status === "uploading")) {
        setError("첨부파일 업로드가 끝난 뒤 저장해주세요.");
        return;
      }
      const publishedAt = publish ? publishAt : null;
      const payload: NoticeInput = {
        ...values,
        // 문자열로 전송 — 객체로 보내면 Server Action 직렬화에서 중첩 attrs 소실($T). 서버에서 parse (news 동일)
        body: JSON.stringify(body),
        publishedAt,
        attachments: attachments
          .filter(
            (a): a is NoticeAttachmentItem & { key: string } =>
              a.status === "done" && a.key !== null,
          )
          .map((a) => ({
            fileName: a.fileName,
            key: a.key,
            mime: a.mime,
            size: a.size,
          })),
      };
      startTransition(async () => {
        const result = isEdit
          ? await updateNoticeAction(initial!.id, payload)
          : await createNoticeAction(noticeId, payload);
        if (!result.success) {
          const msg =
            typeof result.error === "string"
              ? result.error
              : "입력값을 확인해주세요.";
          setError(msg);
          return;
        }
        // 새 공지 성공 시 보존된 인스턴스를 직접 비운다 — PPR Router Cache 의 이전 입력 잔존 차단 (NewsEditor 동일)
        if (!isEdit) {
          form.reset({ title: "" });
          setBody({ type: "doc", content: [] });
          setAttachments([]);
          setPublishAt(new Date());
          setNewPostNonce((n) => n + 1);
        }
        const state = getPublishState(publishedAt);
        toast.success(
          state === "scheduled"
            ? "예약 발행으로 저장되었습니다."
            : state === "published"
              ? "발행되었습니다."
              : "임시 저장되었습니다.",
        );
        router.push("/admin/notices");
      });
    })();

  const currentState = getPublishState(isEdit ? initial?.publishedAt ?? null : null);
  const nextPublishState = getPublishState(publishAt);
  const submitLabel = nextPublishState === "scheduled" ? "예약" : "발행";

  return (
    <form className="space-y-6 pb-24 lg:pb-0" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-2 rounded"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 좌 — 본문 (lg 8/12) */}
        <Card className="lg:col-span-8">
          <CardContent className="space-y-8 pt-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label
                htmlFor="notice-title"
                className="text-sm font-semibold text-ink-strong"
              >
                제목 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Input
                id="notice-title"
                placeholder="제목을 입력하세요"
                required
                aria-required
                aria-invalid={!!form.formState.errors.title}
                aria-describedby={
                  form.formState.errors.title ? "notice-title-error" : undefined
                }
                disabled={isPending}
                className="h-11 text-base"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p id="notice-title-error" className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* 본문 — useState 별도 (codex P1#6) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-ink-strong">
                본문
              </Label>
              <div className="admin-editor-embed">
                <SimpleEditor
                  key={noticeId}
                  defaultValue={initial?.body}
                  onChange={setBody}
                  scope={{ noticeId }}
                  editable={!isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 우 — 메타 sidebar (lg 4/12) */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            {/* 발행 CTA — desktop sidebar 안 (모바일은 하단 fixed bar 별도) */}
            <Card className="hidden lg:block">
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-date">
                    상태
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      PUBLISH_STATE_CLASS[currentState],
                    )}
                  >
                    {PUBLISH_STATE_LABEL[currentState]}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => submit(false)}
                    disabled={isPending}
                    className="flex-1 active:scale-[0.98]"
                  >
                    {isPending ? "저장 중..." : "임시 저장"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => submit(true)}
                    disabled={isPending}
                    className="flex-1 active:scale-[0.98]"
                  >
                    {isPending ? "처리 중..." : submitLabel}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 발행 일시 — 과거·현재는 발행, 미래는 예약 발행 */}
            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-sm font-semibold text-ink-strong">
                  발행 일시
                </h3>
                <DateTimePicker
                  value={publishAt}
                  onChange={setPublishAt}
                  disabled={isPending}
                />
                <p className="text-xs text-ink-subtle">
                  미래 일시를 선택한 뒤 발행하면 예약 발행으로 저장됩니다.
                </p>
              </CardContent>
            </Card>

            {/* 첨부파일 */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-ink-strong">
                    첨부파일
                  </h3>
                  <HelpTip>{ADMIN_COPY.notices.attachmentsHelp}</HelpTip>
                </div>
                <NoticeAttachmentUploader
                  noticeId={noticeId}
                  items={attachments}
                  onChange={setAttachments}
                  disabled={isPending}
                />
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* 모바일 fixed bottom bar — 발행 가시성 1탭 확보 (lg 이상은 sidebar 발행 카드 사용) */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              PUBLISH_STATE_CLASS[currentState],
            )}
          >
            {PUBLISH_STATE_LABEL[currentState]}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => submit(false)}
            disabled={isPending}
            className="ml-auto active:scale-[0.98]"
          >
            {isPending ? "저장 중..." : "임시 저장"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => submit(true)}
            disabled={isPending}
            className="active:scale-[0.98]"
          >
            {isPending ? "처리 중..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
