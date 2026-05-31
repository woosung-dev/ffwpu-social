// 어드민 본문 에디터 — Tiptap StarterKit + Image + Link. 드래그앤드롭/paste 이미지 업로드. useEditor 1회 + onUpdate 만 onChange (codex P1#6)
"use client";

import { useCallback, useRef, useState } from "react";
import type { Editor, JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { uploadImageAction } from "@/features/news/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TiptapScope = { newsId: string } | { tempId: string };

type Props = {
  defaultValue?: JSONContent;
  onChange: (json: JSONContent) => void;
  scope: TiptapScope;
  onError?: (msg: string) => void;
  disabled?: boolean;
};

// 본문 이미지 업로드 — uploadImageAction → S3 presigned POST → editor.setImage. 실패 시 onError 콜백
async function uploadBodyImage(
  file: File,
  scope: TiptapScope,
): Promise<{ publicUrl: string }> {
  const presign = await uploadImageAction({
    filename: file.name,
    mime: file.type,
    size: file.size,
    target: "body",
    ...scope,
  });
  if (!presign.success) {
    const msg =
      typeof presign.error === "string"
        ? presign.error
        : "이미지 업로드 URL 발급 실패";
    throw new Error(msg);
  }
  const { uploadUrl, fields, publicUrl } = presign.data;
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  fd.append("Content-Type", file.type);
  fd.append("file", file);
  const resp = await fetch(uploadUrl, { method: "POST", body: fd });
  if (!resp.ok) {
    throw new Error(`이미지 업로드 실패 (HTTP ${resp.status})`);
  }
  return { publicUrl };
}

export function TiptapEditor({
  defaultValue,
  onChange,
  scope,
  onError,
  disabled,
}: Props) {
  const [uploadCount, setUploadCount] = useState(0);
  const isUploading = uploadCount > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = useCallback(
    async (editor: Editor, files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;
      setUploadCount((c) => c + imageFiles.length);
      for (const file of imageFiles) {
        try {
          const { publicUrl } = await uploadBodyImage(file, scope);
          editor.chain().focus().setImage({ src: publicUrl }).run();
        } catch (err) {
          onError?.(err instanceof Error ? err.message : "이미지 업로드 실패");
        } finally {
          setUploadCount((c) => Math.max(0, c - 1));
        }
      }
    },
    [scope, onError],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
        validate: (url) => /^https?:\/\//.test(url),
      }),
    ],
    immediatelyRender: false, // Next.js SSR hydration mismatch 회피
    content: defaultValue,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => onChange(ed.getJSON()),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral max-w-none min-h-[320px] px-4 py-3",
          "focus:outline-none",
          "prose-headings:font-semibold prose-img:rounded-md",
        ),
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved || !event.dataTransfer) return false;
        const files = Array.from(event.dataTransfer.files);
        if (files.length === 0 || !files.some((f) => f.type.startsWith("image/"))) {
          return false;
        }
        event.preventDefault();
        if (editor) {
          void handleImageFiles(editor, files);
        }
        return true;
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const files = items
          .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
          .map((it) => it.getAsFile())
          .filter((f): f is File => f !== null);
        if (files.length === 0) return false;
        event.preventDefault();
        if (editor) {
          void handleImageFiles(editor, files);
        }
        return true;
      },
    },
  });

  if (!editor) {
    return (
      <div className="rounded-md border bg-muted/30 px-4 py-12 text-center text-sm text-ink-subtle">
        에디터 로딩 중…
      </div>
    );
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL (http/https)", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^https?:\/\//.test(url)) {
      onError?.("http(s):// 로 시작하는 URL 만 허용됩니다.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) void handleImageFiles(editor, files);
    e.target.value = ""; // 같은 파일 재선택 허용
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <Toolbar
        editor={editor}
        onSetLink={setLink}
        onPickImage={() => fileInputRef.current?.click()}
        isUploading={isUploading}
        disabled={disabled}
      />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={onPickFiles}
      />
    </div>
  );
}

// ─── Toolbar ────────────────────────────────────────────────────────────────

function Toolbar({
  editor,
  onSetLink,
  onPickImage,
  isUploading,
  disabled,
}: {
  editor: Editor;
  onSetLink: () => void;
  onPickImage: () => void;
  isUploading: boolean;
  disabled?: boolean;
}) {
  const buttons = [
    {
      icon: Bold,
      label: "굵게",
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "기울임",
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Heading2,
      label: "H2",
      active: editor.isActive("heading", { level: 2 }),
      onClick: () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3,
      label: "H3",
      active: editor.isActive("heading", { level: 3 }),
      onClick: () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: List,
      label: "불릿",
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "번호",
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
      {buttons.map(({ icon: Icon, label, active, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "rounded p-1.5 transition-colors",
            active
              ? "bg-brand-primary/15 text-brand-primary"
              : "text-ink-subtle hover:bg-muted",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        onClick={onSetLink}
        disabled={disabled}
        aria-label="링크"
        aria-pressed={editor.isActive("link")}
        className={cn(
          "rounded p-1.5 transition-colors",
          editor.isActive("link")
            ? "bg-brand-primary/15 text-brand-primary"
            : "text-ink-subtle hover:bg-muted",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onPickImage}
        disabled={disabled || isUploading}
        className="ml-1 gap-1.5 text-xs"
      >
        {isUploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ImageIcon className="h-3.5 w-3.5" />
        )}
        {isUploading ? "업로드 중..." : "이미지"}
      </Button>
      <span className="ml-auto text-xs text-ink-subtle">
        드래그앤드롭/붙여넣기 지원
      </span>
    </div>
  );
}
