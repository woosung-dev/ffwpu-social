"use client"

// 본문 인라인 이미지 NodeView — 우하단 코너 핸들을 잡고 대각선(폭) 리사이즈. 폭은 px 저장, 높이는 비율 자동.
// 인라인(span)이라 한 문단에 여러 장이 나란히 놓인다. 네이티브 resize 가 우리 환경에서 동작 안 해 직접 구현.
import * as React from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"

import { clampImagePx } from "@/features/news/render/editor-allowlist"

export function ImageNodeView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const wrapRef = React.useRef<HTMLSpanElement | null>(null)
  const [dragWidth, setDragWidth] = React.useState<number | null>(null)

  const src = node.attrs.src as string
  const alt = (node.attrs.alt as string) ?? ""
  const storedWidth = (node.attrs.width as number | null) ?? null
  const width = dragWidth ?? storedWidth

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const img = wrapRef.current?.querySelector("img")
    if (!img) return
    const startX = e.clientX
    const startW = img.getBoundingClientRect().width
    const compute = (clientX: number) =>
      clampImagePx(Math.round(startW + (clientX - startX)))
    const onMove = (ev: PointerEvent) => {
      const w = compute(ev.clientX)
      if (w) setDragWidth(w)
    }
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      const w = compute(ev.clientX)
      setDragWidth(null)
      if (w) updateAttributes({ width: w })
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <NodeViewWrapper
      as="span"
      ref={wrapRef}
      className={`tiptap-image${selected ? " is-selected" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{ width: width ? `${width}px` : undefined }}
      />
      <span
        className="tiptap-image-handle"
        role="presentation"
        contentEditable={false}
        onPointerDown={startResize}
      />
    </NodeViewWrapper>
  )
}

export default ImageNodeView
