// 본문 이미지 확장 — 인라인(한 문단에 여러 장 나란히) + 커스텀 코너 리사이즈 NodeView.
// draggable:false — 노드 드래그가 리사이즈 제스처를 가로채지 않게. width/height(px)는 base 속성 그대로.
import { Image as TiptapImage } from "@tiptap/extension-image"
import { ReactNodeViewRenderer } from "@tiptap/react"

import { ImageNodeView } from "@/components/tiptap-node/image-node/image-node-view"

// inline 은 옵션으로 설정해야 base 의 group(inline/block)이 일치한다(스키마 필드로 박으면 group=block 과 충돌).
export const Image = TiptapImage.extend({
  draggable: false,

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
}).configure({ inline: true })

export default Image
