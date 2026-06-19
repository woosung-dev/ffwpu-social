// 소식 에디터 툴바의 표 삽입·편집 드롭다운 — docx 붙여넣은 표 편집 + 새 표 삽입(TableKit)
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
      e
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
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
  ({ editor: providedEditor, portal = false, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = React.useState(false)

    if (!editor) return null

    const inTable = editor.isActive("table")

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
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
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup>
                {TABLE_ACTIONS.filter(
                  (a) => !a.inTableOnly || inTable,
                ).map((action) => (
                  <DropdownMenuItem key={action.label} asChild>
                    <Button
                      type="button"
                      data-style="ghost"
                      onClick={() => {
                        action.run(editor)
                        setIsOpen(false)
                      }}
                    >
                      <span className="tiptap-button-text">{action.label}</span>
                    </Button>
                  </DropdownMenuItem>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)

TableButton.displayName = "TableButton"

export default TableButton
