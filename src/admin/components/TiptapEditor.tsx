// 어드민 본문 에디터 — 네이버/티스토리급. StarterKit + 글자크기/색/형광펜/밑줄/정렬/표/유튜브/이미지(정렬·폭·캡션).
// 허용값은 editor-allowlist 단일 출처. 툴바 상태는 editor.isActive/getAttributes 렌더타임 파생(useEffect 금지, LESSON-004).
"use client";

import { useCallback, useRef, useState } from "react";
import type { Editor, JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { SafeYoutube } from "./editor/safe-youtube";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Type,
  Baseline,
  Highlighter,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { uploadImageAction } from "@/features/news/actions";
import { buildPresignedPostBody } from "@/features/storage/presigned-upload";
import {
  ALLOWED_COLORS,
  ALLOWED_FONT_SIZES,
  ALLOWED_HIGHLIGHTS,
  IMAGE_WIDTH_STEPS,
  extractYoutubeId,
} from "@/features/news/render/editor-allowlist";
import { FontSize } from "./editor/font-size";
import { FigureImage } from "./editor/figure-image";
import { readImageDimensions } from "./editor/image-dims";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TiptapScope = { newsId: string } | { tempId: string };

type Props = {
  defaultValue?: JSONContent;
  onChange: (json: JSONContent) => void;
  scope: TiptapScope;
  onError?: (msg: string) => void;
  disabled?: boolean;
};

// 본문 이미지 업로드 — uploadImageAction → presigned POST → publicUrl + 실제 치수
async function uploadBodyImage(
  file: File,
  scope: TiptapScope,
): Promise<{ publicUrl: string; dims: { width: number; height: number } | null }> {
  const dims = await readImageDimensions(file);
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
  const fd = buildPresignedPostBody(fields, file);
  const resp = await fetch(uploadUrl, { method: "POST", body: fd });
  if (!resp.ok) {
    throw new Error(`이미지 업로드 실패 (HTTP ${resp.status})`);
  }
  return { publicUrl, dims };
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
          const { publicUrl, dims } = await uploadBodyImage(file, scope);
          editor
            .chain()
            .focus()
            .setImage({
              src: publicUrl,
              // FigureImage 추가 attrs
              ...(dims
                ? { naturalWidth: dims.width, naturalHeight: dims.height }
                : {}),
            } as { src: string })
            .run();
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
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FigureImage.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        validate: (url) => /^https?:\/\//.test(url),
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      SafeYoutube.configure({ controls: true, nocookie: true, width: 640, height: 360 }),
    ],
    immediatelyRender: false,
    content: defaultValue,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => onChange(ed.getJSON()),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral max-w-none min-h-[360px] px-4 py-3 focus:outline-none",
          "prose-headings:font-semibold prose-img:rounded-md prose-img:my-2",
        ),
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved || !event.dataTransfer) return false;
        const files = Array.from(event.dataTransfer.files);
        if (files.length === 0 || !files.some((f) => f.type.startsWith("image/")))
          return false;
        event.preventDefault();
        if (editor) void handleImageFiles(editor, files);
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
        if (editor) void handleImageFiles(editor, files);
        return true;
      },
    },
  });

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0 && editor) void handleImageFiles(editor, files);
    e.target.value = "";
  };

  if (!editor) {
    return (
      <div className="rounded-md border bg-muted/30 px-4 py-12 text-center text-sm text-ink-subtle">
        에디터 로딩 중…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border focus-within:border-brand-primary/40 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-colors">
      <Toolbar
        editor={editor}
        onPickImage={() => fileInputRef.current?.click()}
        isUploading={isUploading}
        disabled={disabled}
        onError={onError}
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

const HEADINGS = [
  { label: "본문", level: 0 as const },
  { label: "제목 1", level: 1 as const },
  { label: "제목 2", level: 2 as const },
  { label: "제목 3", level: 3 as const },
];

const FONT_SIZE_LABELS: Record<string, string> = {
  "14px": "작게",
  "16px": "보통",
  "18px": "크게",
  "22px": "더 크게",
  "28px": "제목",
};

function Toolbar({
  editor,
  onPickImage,
  isUploading,
  disabled,
  onError,
}: {
  editor: Editor;
  onPickImage: () => void;
  isUploading: boolean;
  disabled?: boolean;
  onError?: (msg: string) => void;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);

  const imageActive = editor.isActive("image");
  const currentHeading = editor.isActive("heading", { level: 1 })
    ? "제목 1"
    : editor.isActive("heading", { level: 2 })
      ? "제목 2"
      : editor.isActive("heading", { level: 3 })
        ? "제목 3"
        : "본문";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-cool px-2 py-1.5">
      {/* 이력 */}
      <IconBtn
        icon={Undo2}
        label="실행 취소"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled}
      />
      <IconBtn
        icon={Redo2}
        label="다시 실행"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled}
      />
      <Divider />

      {/* 단락 스타일 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex items-center gap-1 rounded px-2 py-1.5 text-xs font-medium text-ink-subtle hover:bg-muted disabled:opacity-50"
          >
            {currentHeading}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {HEADINGS.map((h) => (
            <DropdownMenuItem
              key={h.level}
              onClick={() =>
                h.level === 0
                  ? editor.chain().focus().setParagraph().run()
                  : editor.chain().focus().toggleHeading({ level: h.level }).run()
              }
              className={cn(
                h.level === 1 && "text-lg font-bold",
                h.level === 2 && "text-base font-semibold",
                h.level === 3 && "text-sm font-semibold",
              )}
            >
              {h.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 글자 크기 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="글자 크기"
            className="flex items-center gap-1 rounded p-1.5 text-ink-subtle hover:bg-muted disabled:opacity-50"
          >
            <Type className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {ALLOWED_FONT_SIZES.map((size) => (
            <DropdownMenuItem
              key={size}
              onClick={() => editor.chain().focus().setFontSize(size).run()}
              style={{ fontSize: size }}
            >
              {FONT_SIZE_LABELS[size] ?? size}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetFontSize().run()}
          >
            기본 크기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Divider />

      {/* 서식 */}
      <IconBtn
        icon={Bold}
        label="굵게"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled}
      />
      <IconBtn
        icon={Italic}
        label="기울임"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled}
      />
      <IconBtn
        icon={UnderlineIcon}
        label="밑줄"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={disabled}
      />
      <IconBtn
        icon={Strikethrough}
        label="취소선"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={disabled}
      />

      {/* 글자 색 */}
      <SwatchMenu
        icon={Baseline}
        label="글자 색"
        colors={ALLOWED_COLORS}
        disabled={disabled}
        onPick={(c) => editor.chain().focus().setColor(c).run()}
        onClear={() => editor.chain().focus().unsetColor().run()}
      />
      {/* 형광펜 */}
      <SwatchMenu
        icon={Highlighter}
        label="형광펜"
        colors={ALLOWED_HIGHLIGHTS}
        disabled={disabled}
        onPick={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
        onClear={() => editor.chain().focus().unsetHighlight().run()}
      />
      <Divider />

      {/* 정렬 */}
      <IconBtn
        icon={AlignLeft}
        label="왼쪽 정렬"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        disabled={disabled}
      />
      <IconBtn
        icon={AlignCenter}
        label="가운데 정렬"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        disabled={disabled}
      />
      <IconBtn
        icon={AlignRight}
        label="오른쪽 정렬"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        disabled={disabled}
      />
      <Divider />

      {/* 리스트·인용 */}
      <IconBtn
        icon={List}
        label="불릿 목록"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled}
      />
      <IconBtn
        icon={ListOrdered}
        label="번호 목록"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
      />
      <IconBtn
        icon={Quote}
        label="인용구"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={disabled}
      />
      <Divider />

      {/* 삽입 */}
      <IconBtn
        icon={LinkIcon}
        label="링크"
        active={editor.isActive("link")}
        onClick={() => setLinkOpen(true)}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onPickImage}
        disabled={disabled || isUploading}
        className="h-8 gap-1.5 px-2 text-xs"
      >
        {isUploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ImageIcon className="h-3.5 w-3.5" />
        )}
        {isUploading ? "업로드 중..." : "이미지"}
      </Button>
      <IconBtn
        icon={TableIcon}
        label="표"
        onClick={() => setTableOpen(true)}
        disabled={disabled}
      />
      <IconBtn
        icon={YoutubeIcon}
        label="유튜브"
        onClick={() => setYoutubeOpen(true)}
        disabled={disabled}
      />
      <IconBtn
        icon={Minus}
        label="구분선"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={disabled}
      />

      {/* 이미지 선택 시 — 정렬·폭·캡션 */}
      {imageActive && (
        <>
          <Divider />
          <span className="px-1 text-[11px] font-medium text-brand-primary">
            이미지
          </span>
          {(["left", "center", "right"] as const).map((al) => {
            const Icon =
              al === "left" ? AlignLeft : al === "center" ? AlignCenter : AlignRight;
            return (
              <IconBtn
                key={al}
                icon={Icon}
                label={`이미지 ${al}`}
                active={editor.getAttributes("image").align === al}
                onClick={() =>
                  editor.chain().focus().updateAttributes("image", { align: al }).run()
                }
                disabled={disabled}
              />
            );
          })}
          {IMAGE_WIDTH_STEPS.map((w) => (
            <button
              key={w}
              type="button"
              disabled={disabled}
              onClick={() =>
                editor.chain().focus().updateAttributes("image", { width: w }).run()
              }
              className={cn(
                "rounded px-1.5 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-50",
                editor.getAttributes("image").width === w
                  ? "bg-brand-primary/15 text-brand-primary"
                  : "text-ink-subtle",
              )}
            >
              {w}%
            </button>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const cur = (editor.getAttributes("image").caption as string) ?? "";
              const next = window.prompt("이미지 캡션", cur);
              if (next !== null)
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { caption: next.slice(0, 300) })
                  .run();
            }}
            className="rounded px-1.5 py-1 text-[11px] font-medium text-ink-subtle hover:bg-muted disabled:opacity-50"
          >
            캡션
          </button>
        </>
      )}

      <span className="ml-auto hidden text-xs text-ink-subtle sm:inline">
        드래그앤드롭/붙여넣기 지원
      </span>

      <LinkDialog editor={editor} open={linkOpen} onOpenChange={setLinkOpen} onError={onError} />
      <TableDialog editor={editor} open={tableOpen} onOpenChange={setTableOpen} />
      <YoutubeDialog
        editor={editor}
        open={youtubeOpen}
        onOpenChange={setYoutubeOpen}
        onError={onError}
      />
    </div>
  );
}

// ─── 작은 구성요소 ────────────────────────────────────────────────────────────

function IconBtn({
  icon: Icon,
  label,
  active,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "rounded p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active ? "bg-brand-primary/15 text-brand-primary" : "text-ink-subtle hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

function SwatchMenu({
  icon: Icon,
  label,
  colors,
  onPick,
  onClear,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  colors: readonly string[];
  onPick: (c: string) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={label}
          title={label}
          className="rounded p-1.5 text-ink-subtle hover:bg-muted disabled:opacity-50"
        >
          <Icon className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto">
        <div className="grid grid-cols-4 gap-1 p-1">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => {
                onPick(c);
                setOpen(false);
              }}
              className="h-6 w-6 rounded border border-border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <DropdownMenuItem onClick={onClear} className="justify-center text-xs">
          지우기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── 모달 ────────────────────────────────────────────────────────────────────

function LinkDialog({
  editor,
  open,
  onOpenChange,
  onError,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onError?: (msg: string) => void;
}) {
  const [url, setUrl] = useState("");
  const submit = () => {
    const v = url.trim();
    if (v === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else if (!/^https?:\/\//.test(v)) {
      onError?.("http(s):// 로 시작하는 URL 만 허용됩니다.");
      return;
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: v }).run();
    }
    onOpenChange(false);
    setUrl("");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>링크 삽입</DialogTitle>
          <DialogDescription>
            선택한 텍스트에 연결할 링크 주소를 입력합니다.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" onClick={submit}>
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TableDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const submit = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: clampNum(rows, 1, 20), cols: clampNum(cols, 1, 10), withHeaderRow: true })
      .run();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>표 삽입</DialogTitle>
          <DialogDescription>
            삽입할 표의 행·열 수를 지정합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm">
            행
            <Input
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-20"
            />
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            열
            <Input
              type="number"
              min={1}
              max={10}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-20"
            />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" onClick={submit}>
            삽입
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function YoutubeDialog({
  editor,
  open,
  onOpenChange,
  onError,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onError?: (msg: string) => void;
}) {
  const [url, setUrl] = useState("");
  const submit = () => {
    const id = extractYoutubeId(url);
    if (!id) {
      onError?.("유효한 YouTube 링크가 아닙니다.");
      return;
    }
    editor
      .chain()
      .focus()
      .setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${id}` })
      .run();
    onOpenChange(false);
    setUrl("");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>YouTube 삽입</DialogTitle>
          <DialogDescription>
            본문에 넣을 YouTube 영상 주소를 입력합니다.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="https://youtu.be/... 또는 영상 링크"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" onClick={submit}>
            삽입
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function clampNum(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}
