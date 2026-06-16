"use client"

// 이미지 2장을 골라 업로드 후 한 줄(imageRow)로 삽입하는 툴바 버튼.
import * as React from "react"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import {
  makeBodyImageUploader,
  readImageDimensions,
  type EditorScope,
} from "@/admin/components/editor-image-upload"

const RowImageIcon: React.FC = () => (
  <svg
    className="tiptap-button-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="6" width="8" height="12" rx="1" />
    <rect x="13" y="6" width="8" height="12" rx="1" />
  </svg>
)

export function ImageRowButton({ scope }: { scope?: EditorScope }) {
  const { editor } = useTiptapEditor()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const handleClick = () => {
    if (!isUploading) inputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 2)
    e.target.value = ""
    if (!editor || files.length === 0) return
    if (files.length < 2) {
      window.alert("한 줄에 나란히 넣을 이미지 2장을 함께 선택해주세요.")
      return
    }

    setIsUploading(true)
    try {
      const upload = makeBodyImageUploader(scope)
      // 한 문단 안에 인라인 이미지 2장 → 나란히. 코너 드래그로 각자 리사이즈.
      // 초기 폭은 에디터 너비의 절반(여백 제외)으로 잡아 항상 한 줄에 들어가게 한다("2줄로 넘어감" 방지).
      const dom = editor.view.dom as HTMLElement
      const cs = getComputedStyle(dom)
      const usable =
        dom.clientWidth -
        parseFloat(cs.paddingLeft || "0") -
        parseFloat(cs.paddingRight || "0")
      const INITIAL_W = Math.max(120, Math.floor((usable - 24) / 2))
      const images = await Promise.all(
        files.map(async (file) => {
          const dims = await readImageDimensions(file)
          const src = await upload(file)
          const height =
            dims?.width && dims?.height
              ? Math.round((INITIAL_W * dims.height) / dims.width)
              : undefined
          return {
            type: "image",
            attrs: {
              src,
              alt: file.name.replace(/\.[^/.]+$/, ""),
              width: INITIAL_W,
              ...(height ? { height } : {}),
            },
          }
        }),
      )
      editor
        .chain()
        .focus()
        .insertContent({ type: "paragraph", content: images })
        .run()
    } catch (error) {
      // 실패를 침묵시키지 않고 사용자에게 노출(업로드 권한·네트워크 등 원인 파악)
      console.error("이미지 2장 삽입 실패:", error)
      window.alert(
        `이미지 삽입에 실패했습니다.\n${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        data-style="ghost"
        aria-label="이미지 2장 나란히"
        title="이미지 2장 나란히 (2장 함께 선택)"
        disabled={isUploading}
        onClick={handleClick}
      >
        <RowImageIcon />
      </Button>
      {/* display:none(`hidden`) 파일 input 은 일부 브라우저(Safari)에서 .click() 이 막힘 → 화면밖 배치 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />
    </>
  )
}

export default ImageRowButton
