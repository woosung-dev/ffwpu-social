// 공식 simple-editor 툴바에 글꼴 선택을 추가하는 드롭다운 — TextStyleKit.fontFamily 사용.
// 목록은 sanitize·공개 렌더와 공유하는 SSOT(EDITOR_FONTS). 여기에 없는 글꼴은 저장돼도 공개에서 drop 된다.
import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

// --- Lib ---
import {
  DEFAULT_FONT_VALUE,
  EDITOR_FONTS,
  normalizeFontFamily,
} from "@/features/news/render/editor-allowlist"

export interface FontFamilyDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /** 공유 컨텍스트 대신 명시적으로 editor 를 주입할 때 사용 */
  editor?: Editor | null
  /** 드롭다운을 portal 로 렌더할지 여부 */
  portal?: boolean
}

/**
 * Tiptap 에디터에서 글꼴을 선택하는 드롭다운.
 * FontSizeDropdownMenu 와 동일한 primitive 구성.
 */
export const FontFamilyDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  FontFamilyDropdownMenuProps
>(({ editor: providedEditor, portal = false, ...buttonProps }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)

  const applyFont = React.useCallback(
    (value: string) => {
      if (!editor) return
      const chain = editor.chain().focus()
      if (value === DEFAULT_FONT_VALUE) chain.unsetFontFamily().run()
      else chain.setFontFamily(value).run()
      setIsOpen(false)
    },
    [editor]
  )

  if (!editor) {
    return null
  }

  // 커서 위치의 글꼴 — 트리거 라벨에 현재 상태를 보여준다(뭘 고른 상태인지 모르는 채 쓰지 않게)
  const active = normalizeFontFamily(
    editor.getAttributes("textStyle").fontFamily
  )
  const activeLabel =
    EDITOR_FONTS.find((f) => f.value === active)?.label ?? "기본"

  return (
    <DropdownMenu modal open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="글꼴"
          tooltip="글꼴"
          {...buttonProps}
          ref={ref}
        >
          <span className="tiptap-button-text">{activeLabel}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <Card>
          <CardBody>
            <ButtonGroup>
              {EDITOR_FONTS.map((font) => (
                <DropdownMenuItem key={font.value || "default"} asChild>
                  <Button
                    type="button"
                    data-style="ghost"
                    data-active-state={
                      font.value === (active ?? DEFAULT_FONT_VALUE)
                        ? "on"
                        : "off"
                    }
                    onClick={() => applyFont(font.value)}
                  >
                    {/* 미리보기 — 항목을 그 글꼴로 그린다. 이름만 나열하면 운영자가 고를 수 없다 */}
                    <span
                      className="tiptap-button-text"
                      style={font.stack ? { fontFamily: font.stack } : undefined}
                    >
                      {font.label}
                    </span>
                  </Button>
                </DropdownMenuItem>
              ))}
            </ButtonGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

FontFamilyDropdownMenu.displayName = "FontFamilyDropdownMenu"

export default FontFamilyDropdownMenu
