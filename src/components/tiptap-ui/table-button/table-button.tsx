// 소식 에디터 툴바의 표 컨트롤(단일 진입점) — 삽입·행/열 편집 + (표 안일 때) 셀 배경색.
// 셀 색은 별도 버튼으로 분리하지 않고 이 팝오버 안에 통합(Tiptap 관례 = 컨텍스트 단일 메뉴). 글자색과 동일한 팔레트+직접+지우기.
import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { BanIcon } from "@/components/tiptap-icons/ban-icon"

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

// --- Lib ---
import { ALLOWED_COLORS } from "@/features/news/render/editor-allowlist"

export interface TableButtonProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  portal?: boolean
}

type TableAction = {
  label: string
  run: (editor: Editor) => void
  /** 표 안에서만 의미 있는 동작(삽입 외) */
  inTableOnly?: boolean
}

const TABLE_ACTIONS: TableAction[] = [
  {
    label: "표 삽입 (3×3)",
    run: (e) =>
      e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  { label: "위에 행 추가", run: (e) => e.chain().focus().addRowBefore().run(), inTableOnly: true },
  { label: "아래에 행 추가", run: (e) => e.chain().focus().addRowAfter().run(), inTableOnly: true },
  { label: "왼쪽에 열 추가", run: (e) => e.chain().focus().addColumnBefore().run(), inTableOnly: true },
  { label: "오른쪽에 열 추가", run: (e) => e.chain().focus().addColumnAfter().run(), inTableOnly: true },
  { label: "행 삭제", run: (e) => e.chain().focus().deleteRow().run(), inTableOnly: true },
  { label: "열 삭제", run: (e) => e.chain().focus().deleteColumn().run(), inTableOnly: true },
  { label: "표 삭제", run: (e) => e.chain().focus().deleteTable().run(), inTableOnly: true },
]

export const TableButton = React.forwardRef<HTMLButtonElement, TableButtonProps>(
  ({ editor: providedEditor, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = React.useState(false)

    const applyCellColor = React.useCallback(
      (color: string | null) => {
        editor?.chain().focus().setCellAttribute("backgroundColor", color).run()
      },
      [editor],
    )

    if (!editor) return null

    // 팝오버 열릴 때마다 재평가 — shouldRerenderOnTransaction:false 대응
    const inTable = editor.isActive("table")

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            role="button"
            tabIndex={-1}
            aria-label="Table"
            tooltip="표"
            {...buttonProps}
            ref={ref}
          >
            <span className="tiptap-button-text">표</span>
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </PopoverTrigger>

        <PopoverContent aria-label="표">
          <Card>
            <CardBody>
              <ButtonGroup orientation="vertical">
                {TABLE_ACTIONS.filter((a) => !a.inTableOnly || inTable).map(
                  (action) => (
                    <Button
                      key={action.label}
                      type="button"
                      data-style="ghost"
                      onClick={() => {
                        action.run(editor)
                        setIsOpen(false)
                      }}
                    >
                      <span className="tiptap-button-text">{action.label}</span>
                    </Button>
                  ),
                )}
              </ButtonGroup>

              {/* 셀 배경색 — 표 안에서만. 글자색과 동일한 팔레트 + 직접 + 지우기 */}
              {inTable && (
                <>
                  <Separator />
                  <div className="tiptap-table-color-label">셀 배경색</div>
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
                          applyCellColor(color)
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
                        defaultValue="#ffffff"
                        onChange={(e) => applyCellColor(e.target.value)}
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
                        applyCellColor(null)
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
  },
)

TableButton.displayName = "TableButton"

export default TableButton
