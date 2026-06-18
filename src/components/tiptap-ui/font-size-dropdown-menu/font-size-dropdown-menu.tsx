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

// --- Lib ---
import {
  ALLOWED_FONT_SIZES,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  normalizeFontSize,
} from "@/features/news/render/editor-allowlist"

// 프리셋은 sanitize 와 공유하는 SSOT(ALLOWED_FONT_SIZES). 직접 입력은 normalizeFontSize 로 clamp.
export const FONT_SIZES = ALLOWED_FONT_SIZES

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
    const [customValue, setCustomValue] = React.useState("")

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

    // 직접 입력 — 숫자(px)를 normalizeFontSize 로 clamp 후 적용
    const applyCustom = React.useCallback(() => {
      const normalized = normalizeFontSize(`${customValue.trim()}px`)
      if (normalized) {
        applySize(normalized)
        setCustomValue("")
      }
    }, [customValue, applySize])

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
                {/* 직접 입력 — 12~64px clamp */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" }}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <input
                    type="number"
                    min={FONT_SIZE_MIN}
                    max={FONT_SIZE_MAX}
                    inputMode="numeric"
                    aria-label={`직접 입력 (${FONT_SIZE_MIN}~${FONT_SIZE_MAX}px)`}
                    placeholder="px"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        applyCustom()
                      }
                    }}
                    style={{ width: 56, padding: "2px 6px", border: "1px solid var(--tt-gray-light-a-400, #ccc)", borderRadius: 4 }}
                  />
                  <Button type="button" data-style="ghost" onClick={applyCustom}>
                    <span className="tiptap-button-text">적용</span>
                  </Button>
                </div>
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
