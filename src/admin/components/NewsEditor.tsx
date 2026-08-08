// 어드민 뉴스 작성·수정 — RHF + Controller. body 는 useState 별도 (codex P1#6). 좌 본문 + 우 sticky sidebar (발행 CTA·카테고리 chip·커버·태그)
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EyeOff } from "lucide-react";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import {
  createNewsAction,
  updateNewsAction,
} from "@/features/news/actions";
import { newsInputSchema, type NewsInput } from "@/features/news/schemas";
import { CoverImageUploader } from "./CoverImageUploader";
import { DateTimePicker } from "./DateTimePicker";
import { TagsInput } from "./TagsInput";
import { HelpTip } from "./HelpTip";
import { ADMIN_COPY } from "@/admin/copy";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import "@/styles/admin-editor-embed.scss";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type NewsCategoryOption = {
  id: string;
  name: string;
};

export type NewsEditorInitial = {
  id: string;
  title: string;
  body: JSONContent;
  categoryId: string;
  coverImageUrl: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  publishedAt: Date | null;
  isHidden: boolean;
  tags: string[];
};

type Props = {
  mode: "new" | "edit";
  categories: NewsCategoryOption[];
  initial?: NewsEditorInitial;
};

type PublishState = "draft" | "scheduled" | "published";

// 폼 schema — body·publishedAt 은 form 외부 관리 (P1#6 + 발행 버튼)
const formSchema = newsInputSchema.omit({ body: true, publishedAt: true });
// @hookform/resolvers v5 는 input(기본값 적용 전)·output(검증 후) 타입을 구분 — tags 등 .default() 필드 정합용
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

export function NewsEditor({ mode, categories, initial }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // 새 글 세션 nonce — 발행/저장 성공 후 다음 "새 글" 을 위한 깨끗한 식별자 재생성용.
  // cacheComponents(PPR)가 /admin/news/new 세그먼트의 클라 상태를 보존·복원하므로, nonce 를 올려
  // generatedId·에디터 key·폼 상태를 함께 비워야 이전 글이 남지 않는다 (prod 재현·검증).
  const [newPostNonce, setNewPostNonce] = useState(0);
  // 새 글도 client 에서 UUID 생성 → 업로드 prefix(news/{id}/) 와 news.id 를 동일하게 (codex v2 P2#2, temp prefix 제거)
  const generatedId = useMemo(() => crypto.randomUUID(), [newPostNonce]);
  const newsId = isEdit ? initial!.id : generatedId;
  const scope = { newsId };

  // body 는 RHF 외부 useState — Tiptap 무한 루프 방지 (codex P1#6)
  const [body, setBody] = useState<JSONContent>(
    initial?.body ?? { type: "doc", content: [] },
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // 발행 일시 — 수정 가능(미래 불가). 발행 시 적용. 기존 발행글은 그 일시, 신규·임시는 현재 기본
  const [publishAt, setPublishAt] = useState<Date>(
    initial?.publishedAt ?? new Date(),
  );

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initial?.title ?? "",
      categoryId: initial?.categoryId ?? "",
      tags: initial?.tags ?? [],
      coverImageUrl: initial?.coverImageUrl ?? null,
      coverImageWidth: initial?.coverImageWidth ?? null,
      coverImageHeight: initial?.coverImageHeight ?? null,
    },
  });

  // submit handler — publish=true → 선택 일시 저장. 미래면 예약 발행, false → null
  const submit = (publish: boolean) =>
    form.handleSubmit((values) => {
      setError(null);
      const publishedAt = publish ? publishAt : null;
      const payload: NewsInput = {
        ...values,
        // 문자열로 전송 — 객체로 보내면 Server Action 직렬화에서 중첩 attrs 가 소실됨($T). 서버에서 parse
        body: JSON.stringify(body),
        publishedAt,
      };
      startTransition(async () => {
        const result = isEdit
          ? await updateNewsAction(initial!.id, payload)
          : await createNewsAction(newsId, payload);
        if (!result.success) {
          const msg =
            typeof result.error === "string"
              ? result.error
              : "입력값을 확인해주세요.";
          setError(msg);
          return;
        }
        // 새 글 성공 시 보존된 인스턴스를 직접 비운다 — PPR Router Cache 가 /admin/news/new 세그먼트를
        // 복원해 다음 "새 글" 진입 시 이전 입력(제목·본문 등)이 남는 버그 차단. nonce 를 올려 에디터도 리마운트.
        if (!isEdit) {
          form.reset({
            title: "",
            categoryId: "",
            tags: [],
            coverImageUrl: null,
            coverImageWidth: null,
            coverImageHeight: null,
          });
          setBody({ type: "doc", content: [] });
          setPublishAt(new Date());
          setNewPostNonce((n) => n + 1);
        }
        // 성공 토스트 후 목록으로 이동 — 신규·수정 공통(사용자 요청). 토스트는 sonner 가 네비게이션 넘어 유지
        const state = getPublishState(publishedAt);
        toast.success(
          state === "scheduled"
            ? "예약 발행으로 저장되었습니다."
            : state === "published"
              ? "발행되었습니다."
              : "임시 저장되었습니다.",
        );
        router.push("/admin/news");
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

      {/* 비공개 안내 — 저장해도 사용자에게 안 보이는 상태임을 알림. 해제는 목록의 노출 토글 (ADR-053) */}
      {initial?.isHidden && currentState === "published" && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm text-ink-subtle">
          <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            이 글은 <strong className="text-ink-strong">비공개</strong> 상태예요.
            수정 내용은 저장되지만 사용자 사이트에는 아직 보이지 않습니다. 다시
            공개하려면 글 목록에서 노출 아이콘을 눌러주세요.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 좌 — 본문 (lg 8/12) */}
        <Card className="lg:col-span-8">
          <CardContent className="space-y-8 pt-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label
                htmlFor="news-title"
                className="text-sm font-semibold text-ink-strong"
              >
                제목 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Input
                id="news-title"
                placeholder="제목을 입력하세요"
                required
                aria-required
                aria-invalid={!!form.formState.errors.title}
                aria-describedby={
                  form.formState.errors.title ? "news-title-error" : undefined
                }
                disabled={isPending}
                className="h-11 text-base"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p id="news-title-error" className="text-xs text-destructive">
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
                  key={newsId}
                  defaultValue={initial?.body}
                  onChange={setBody}
                  scope={scope}
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

            {/* 발행 일시 — 과거·현재는 발행, 미래는 예약 발행. 모바일·데스크탑 공통 노출 */}
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

            {/* 카테고리 — chip group (ceo P0: 선택값 항상 보임) */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-semibold text-ink-strong">
                  카테고리 <span className="text-destructive" aria-hidden>*</span>
                </h3>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <div
                      role="group"
                      aria-label="카테고리 선택"
                      aria-invalid={!!form.formState.errors.categoryId}
                      aria-describedby={
                        form.formState.errors.categoryId
                          ? "news-category-error"
                          : undefined
                      }
                      className="flex flex-wrap gap-1.5"
                    >
                      {categories.map((c) => {
                        const active = field.value === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => field.onChange(c.id)}
                            disabled={isPending}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:ring-offset-2",
                              "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                              active
                                ? "border-brand-primary/60 bg-brand-primary/10 text-brand-primary"
                                : "border-border bg-white text-ink-subtle hover:border-brand-primary/30 hover:bg-surface-soft hover:text-ink-strong",
                            )}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p id="news-category-error" className="text-xs text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 커버 이미지 */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-semibold text-ink-strong">
                  커버 이미지
                </h3>
                <Controller
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <CoverImageUploader
                      value={field.value ?? null}
                      onChange={(url, dims) => {
                        field.onChange(url);
                        form.setValue("coverImageWidth", dims?.width ?? null);
                        form.setValue("coverImageHeight", dims?.height ?? null);
                      }}
                      scope={scope}
                      onError={setError}
                      disabled={isPending}
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* 태그 */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-ink-strong">태그</h3>
                  <HelpTip>{ADMIN_COPY.news.tagsHelp}</HelpTip>
                </div>
                <Controller
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <TagsInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  )}
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
