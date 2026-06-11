// 공식 simple-editor 툴바에 글자 크기 선택을 추가하는 드롭다운 — TextStyleKit.fontSize 사용
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

export const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "30px",
  "36px",
] as const

export interface FontSizeDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /** 공유 컨텍스트 대신 명시적으로 editor 를 주입할 때 사용 */
  editor?: Editor | null
  /** 표시할 글자 크기 목록 */
  sizes?: readonly string[]
  /** 드롭다운을 portal 로 렌더할지 여부 */
  portal?: boolean
}

/**
 * Tiptap 에디터에서 글자 크기를 선택하는 드롭다운.
 * 공식 simple-editor 의 HeadingDropdownMenu 와 동일한 primitive 구성.
 */
export const FontSizeDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  FontSizeDropdownMenuProps
>(
  (
    { editor: providedEditor, sizes = FONT_SIZES, portal = false, ...buttonProps },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = React.useState(false)

    const applySize = React.useCallback(
      (size: string | null) => {
        if (!editor) return
        const chain = editor.chain().focus()
        if (size) chain.setFontSize(size).run()
        else chain.unsetFontSize().run()
        setIsOpen(false)
      },
      [editor]
    )

    if (!editor) {
      return null
    }

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            role="button"
            tabIndex={-1}
            aria-label="Font size"
            tooltip="Font size"
            {...buttonProps}
            ref={ref}
          >
            <span className="tiptap-button-text">Size</span>
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup>
                {sizes.map((size) => (
                  <DropdownMenuItem key={size} asChild>
                    <Button
                      type="button"
                      data-style="ghost"
                      onClick={() => applySize(size)}
                    >
                      <span
                        className="tiptap-button-text"
                        style={{ fontSize: size }}
                      >
                        {size.replace("px", "")}
                      </span>
                    </Button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Button
                    type="button"
                    data-style="ghost"
                    onClick={() => applySize(null)}
                  >
                    <span className="tiptap-button-text">Default</span>
                  </Button>
                </DropdownMenuItem>
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

FontSizeDropdownMenu.displayName = "FontSizeDropdownMenu"

export default FontSizeDropdownMenu
