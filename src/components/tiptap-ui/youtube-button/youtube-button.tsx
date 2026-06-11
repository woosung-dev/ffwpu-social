// 공식 simple-editor 툴바에 YouTube 삽입 버튼 추가 — v3 @tiptap/extension-youtube
import * as React from "react"
import { isValidYoutubeUrl } from "@tiptap/extension-youtube"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export const YoutubeButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "type">
>(({ ...buttonProps }, ref) => {
  const { editor } = useTiptapEditor()

  const insert = React.useCallback(() => {
    if (!editor) return
    const url = window.prompt("YouTube 링크를 붙여넣으세요")
    if (!url) return
    if (!isValidYoutubeUrl(url)) {
      window.alert("유효한 YouTube 링크가 아닙니다.")
      return
    }
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Add YouTube video"
      tooltip="YouTube"
      onClick={insert}
      {...buttonProps}
      ref={ref}
    >
      <span className="tiptap-button-text">YouTube</span>
    </Button>
  )
})

YoutubeButton.displayName = "YoutubeButton"

export default YoutubeButton
