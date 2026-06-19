// 표 셀 배경색 팝오버 — 글자색 팝오버와 동일 UX(팔레트 8 + 직접 네이티브 피커 + 지우기). setCellAttribute('backgroundColor') 사용.
// 표 안에서만 적용. 저장 후 공개 렌더는 sanitize 의 normalizeColor(hex 검증)가 통과.
import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"
import { BanIcon } from "@/components/tiptap-icons/ban-icon"

// --- Lib ---
import { ALLOWED_COLORS } from "@/features/news/render/editor-allowlist"

export interface TableCellColorPopoverProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
}

// 현재 셀(td/th) 의 backgroundColor — 둘 중 활성 노드에서 읽음
function currentCellColor(editor: Editor): string | null {
  const cell = editor.getAttributes("tableCell")?.backgroundColor
  if (typeof cell === "string" && cell) return cell
  const header = editor.getAttributes("tableHeader")?.backgroundColor
  if (typeof header === "string" && header) return header
  return null
}

export const TableCellColorPopover = React.forwardRef<
  HTMLButtonElement,
  TableCellColorPopoverProps
>(({ editor: providedEditor, ...buttonProps }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)

  const applyColor = React.useCallback(
    (color: string | null) => {
      // null = 지우기 → 셀 배경 제거
      editor?.chain().focus().setCellAttribute("backgroundColor", color).run()
    },
    [editor],
  )

  if (!editor) return null

  // 팝오버 열릴 때마다(isOpen 변화 = 재렌더) 최신 selection 으로 평가 — shouldRerenderOnTransaction:false 대응
  const inTable = editor.isActive("table")
  const activeColor = inTable ? currentCellColor(editor) : null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="Table cell color"
          tooltip="표 셀 색"
          data-active-state={activeColor ? "on" : "off"}
          {...buttonProps}
          ref={ref}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 16,
              height: 16,
              borderRadius: 3,
              backgroundColor: activeColor ?? "#ffffff",
              border: "1.5px solid #8a8f98",
              boxShadow: "inset 0 0 0 2px #ffffff",
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="표 셀 색">
        <Card>
          <CardBody>
            {!inTable ? (
              <div
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8125rem", color: "#6b7280" }}
              >
                표 안의 셀을 클릭한 뒤 색을 선택하세요.
              </div>
            ) : (
              <>
                <ButtonGroup orientation="horizontal">
                  {ALLOWED_COLORS.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      data-style="ghost"
                      role="menuitem"
                      aria-label={`셀 배경색 ${color}`}
                      tooltip={color}
                      onClick={() => {
                        applyColor(color)
                        setIsOpen(false)
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          backgroundColor: color,
                          border: "1px solid rgba(0,0,0,0.15)",
                        }}
                      />
                    </Button>
                  ))}
                </ButtonGroup>
                <Separator />
                <ButtonGroup orientation="horizontal">
                  {/* 자유 색 — 네이티브 컬러피커 */}
                  <label
                    className="tiptap-button"
                    data-style="ghost"
                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                    title="직접 선택"
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background:
                          "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                        border: "1px solid rgba(0,0,0,0.15)",
                      }}
                    />
                    <span className="tiptap-button-text">직접</span>
                    <input
                      type="color"
                      aria-label="직접 셀 색 선택"
                      value={activeColor ?? "#ffffff"}
                      onChange={(e) => applyColor(e.target.value)}
                      style={{
                        width: 0,
                        height: 0,
                        padding: 0,
                        border: 0,
                        opacity: 0,
                        position: "absolute",
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    data-style="ghost"
                    role="menuitem"
                    aria-label="셀 배경색 제거"
                    tooltip="색 제거"
                    onClick={() => {
                      applyColor(null)
                      setIsOpen(false)
                    }}
                  >
                    <BanIcon className="tiptap-button-icon" />
                  </Button>
                </ButtonGroup>
              </>
            )}
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  )
})

TableCellColorPopover.displayName = "TableCellColorPopover"

export default TableCellColorPopover
