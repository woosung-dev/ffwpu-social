"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor, type JSONContent } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@/components/tiptap-node/image-node/image-node-extension"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { TextStyleKit } from "@tiptap/extension-text-style"
import { TableKit } from "@tiptap/extension-table"
import {
  TableCellWithBackground,
  TableHeaderWithBackground,
} from "@/components/tiptap-node/table-node/table-cell-extension"
import { Youtube } from "@tiptap/extension-youtube"
import { Fragment, Slice, type Node as ProseMirrorNode } from "@tiptap/pm/model"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { FontFamilyDropdownMenu } from "@/components/tiptap-ui/font-family-dropdown-menu"
import { FontSizeDropdownMenu } from "@/components/tiptap-ui/font-size-dropdown-menu"
import { YoutubeButton } from "@/components/tiptap-ui/youtube-button"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ImageRowButton } from "@/components/tiptap-ui/image-row-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import { TextColorPopover } from "@/components/tiptap-ui/text-color-popover"
import { TableButton } from "@/components/tiptap-ui/table-button"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Lib ---
import { toast } from "sonner"
import {
  MAX_IMAGES_PER_UPLOAD,
  MAX_SOURCE_IMAGE_BYTES,
  toKoreanUploadError,
} from "@/features/storage/image-policy"
import {
  makeBodyImageUploader,
  type EditorScope,
} from "@/admin/components/editor-image-upload"
import {
  WEBFONT_EDITOR_FONTS,
  googleFontsHref,
  normalizeColor,
  normalizeFontFamily,
  normalizeFontSize,
} from "@/features/news/render/editor-allowlist"

// --- Styles ---
import "@/styles/tiptap-editor-globals.scss"
import "@/components/tiptap-templates/simple/simple-editor.scss"

// 어드민 에디터가 항상 불러두는 글꼴 URL — 목록이 상수라 렌더마다 다시 만들 이유가 없다.
const ALL_EDITOR_FONTS_HREF = googleFontsHref(
  WEBFONT_EDITOR_FONTS.map((f) => f.value),
)!

// Word/구글독스 붙여넣기 정규화 — textStyle 의 fontSize(pt→px·clamp)·color(rgb→hex)·fontFamily(화이트리스트 밖은 제거)를
// 저장 직전(에디터 단계)에 sanitize 와 동일 규칙으로 변환해, 에디터 표시와 공개 렌더가 일치하도록 한다. 변환 불가 값은 해당 attr 제거.
function normalizePastedFragment(fragment: Fragment): Fragment {
  const nodes: ProseMirrorNode[] = []
  fragment.forEach((child) => {
    let next = child
    if (child.marks.length) {
      const marks = child.marks.map((mark) => {
        if (mark.type.name !== "textStyle") return mark
        const attrs: Record<string, unknown> = { ...mark.attrs }
        if (typeof attrs.fontSize === "string") {
          attrs.fontSize = normalizeFontSize(attrs.fontSize)
        }
        if (typeof attrs.color === "string") {
          attrs.color = normalizeColor(attrs.color)
        }
        if (typeof attrs.fontFamily === "string") {
          attrs.fontFamily = normalizeFontFamily(attrs.fontFamily)
        }
        return mark.type.create(attrs)
      })
      next = child.mark(marks)
    }
    if (next.content.size) {
      next = next.copy(normalizePastedFragment(next.content))
    }
    nodes.push(next)
  })
  return Fragment.fromArray(nodes)
}

function normalizePastedSlice(slice: Slice): Slice {
  return new Slice(
    normalizePastedFragment(slice.content),
    slice.openStart,
    slice.openEnd,
  )
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  scope,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  scope?: EditorScope
}) => {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <FontFamilyDropdownMenu portal={isMobile} />
        <FontSizeDropdownMenu portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        <TextColorPopover />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        <ImageRowButton scope={scope} />
        <YoutubeButton />
        <TableButton />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export type SimpleEditorProps = {
  defaultValue?: JSONContent
  onChange?: (json: JSONContent) => void
  scope?: EditorScope
  editable?: boolean
}

export function SimpleEditor({
  defaultValue,
  onChange,
  scope,
  editable = true,
}: SimpleEditorProps = {}) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable,
    onUpdate: ({ editor: ed }) => onChange?.(ed.getJSON()),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      // 붙여넣기(Word/구글독스) 시 글자크기 pt→px·색 rgb→hex 를 sanitize 규칙으로 정규화
      transformPasted: (slice) => normalizePastedSlice(slice),
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyleKit.configure({ fontSize: { types: ["textStyle"] } }),
      // 표(table) — docx 붙여넣기 보존 + 편집. 셀 배경색 지원 위해 기본 cell/header 를 끄고 커스텀으로 대체
      TableKit.configure({
        table: { resizable: true },
        tableCell: false,
        tableHeader: false,
      }),
      TableCellWithBackground,
      TableHeaderWithBackground,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      // 인라인 이미지(한 문단에 여러 장 나란히) + 커스텀 코너 리사이즈(image-node-extension)
      Image,
      Youtube.configure({ nocookie: true, controls: true, width: 640, height: 360 }),
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        // 원본 상한 — 저장 상한(5MB)이 아니다. 이 게이트는 업로더의 리사이즈보다 먼저 돌기 때문에
        // 5MB 로 두면 12MB 현장 사진이 리사이즈 시도조차 못 하고 잘린다 (ADR-046).
        maxSize: MAX_SOURCE_IMAGE_BYTES,
        limit: MAX_IMAGES_PER_UPLOAD,
        upload: makeBodyImageUploader(scope),
        // 실패를 콘솔에만 남기면 운영자에겐 "아무 일도 안 일어남" 으로 보인다 — 토스트로 노출
        onError: (error) => toast.error(toKoreanUploadError(error)),
      }),
    ],
    content: defaultValue,
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      {/* 어드민 에디터에서는 선택 가능한 글꼴을 전부 불러둔다 — 드롭다운 미리보기와 WYSIWYG 이 맞아야
          운영자가 고른 결과를 보고 판단할 수 있다. 공개 페이지는 글이 실제로 쓴 글꼴만 부른다. */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href={ALL_EDITOR_FONTS_HREF}
        precedence="default"
      />
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              scope={scope}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}
