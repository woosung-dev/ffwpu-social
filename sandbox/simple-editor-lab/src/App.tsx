// Tiptap v3 simple-editor 평가용 데모 — 글자 크기(FontSize) 커스텀 컨트롤 포함
import { useEffect, useReducer, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import "./App.css";

// 글자 크기 프리셋 — TextStyleKit.fontSize 가 style="font-size:Npx" 로 적용
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const COLORS = ["#08060d", "#aa3bff", "#e5484d", "#2f9e44", "#1971c2", "#f08c00"];

const INITIAL = `
<h2>Tiptap v3 · Simple Editor 평가 데모</h2>
<p>이 에디터는 <strong>Tiptap v3</strong> 위에서 동작합니다. 아래 문장을 드래그해 툴바의 <strong>글자 크기</strong>를 바꿔 보세요.</p>
<p>글자 크기는 <code>TextStyleKit</code> 의 <code>setFontSize('24px')</code> · <code>unsetFontSize()</code> 명령으로 적용됩니다 — 별도 extension 설치가 필요 없습니다.</p>
<ul><li>굵게 · 기울임 · 밑줄 · 취소선 (StarterKit)</li><li>제목 1~3 · 목록 · 인용</li><li>글자 색 · 정렬 · 링크</li></ul>
`;

function App() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // TextStyleKit = TextStyle + Color/FontSize/FontFamily/LineHeight 번들 (v3)
      TextStyleKit.configure({ fontSize: { types: ["textStyle"] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: INITIAL,
  });

  if (!editor) return null;

  return (
    <main className="page">
      <header className="page-head">
        <h1>Simple Editor Lab</h1>
        <p>Tiptap v3 · 글자 크기 커스텀 데모 — 본 프로젝트와 격리된 sandbox</p>
      </header>
      <div className="editor-shell">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} className="editor-content" />
      </div>
      <footer className="page-foot">
        선택 영역에 <code>setFontSize</code> 적용 → 저장 HTML 의 인라인 <code>style</code> 로 반영됩니다.
      </footer>
    </main>
  );
}

// 툴바 — editor 트랜잭션마다 강제 리렌더해 active/현재값을 최신으로 유지
function Toolbar({ editor }: { editor: Editor }) {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const onTx = () => force();
    editor.on("transaction", onTx);
    return () => {
      editor.off("transaction", onTx);
    };
  }, [editor]);

  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";
  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : "0";

  const onLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="toolbar">
      <Btn label="실행 취소" onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </Btn>
      <Btn label="다시 실행" onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </Btn>
      <Sep />

      {/* 단락/제목 */}
      <select
        className="tb-select"
        aria-label="단락 스타일"
        value={headingValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "0") editor.chain().focus().setParagraph().run();
          else
            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(v) as 1 | 2 | 3 })
              .run();
        }}
      >
        <option value="0">본문</option>
        <option value="1">제목 1</option>
        <option value="2">제목 2</option>
        <option value="3">제목 3</option>
      </select>

      {/* ★ 글자 크기 — 이 데모의 핵심 */}
      <select
        className="tb-select tb-fontsize"
        aria-label="글자 크기"
        value={currentFontSize}
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setFontSize(v).run();
          else editor.chain().focus().unsetFontSize().run();
        }}
      >
        <option value="">크기</option>
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s.replace("px", "")}
          </option>
        ))}
      </select>
      <Sep />

      {/* 서식 */}
      <Btn
        label="굵게"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </Btn>
      <Btn
        label="기울임"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </Btn>
      <Btn
        label="밑줄"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </Btn>
      <Btn
        label="취소선"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <s>S</s>
      </Btn>
      <Sep />

      {/* 글자 색 */}
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className="tb-swatch"
          style={{ background: c }}
          aria-label={`글자 색 ${c}`}
          title={`글자 색 ${c}`}
          onClick={() => editor.chain().focus().setColor(c).run()}
        />
      ))}
      <Btn label="색 해제" onClick={() => editor.chain().focus().unsetColor().run()}>
        <span className="tb-text">색×</span>
      </Btn>
      <Sep />

      {/* 정렬 */}
      <Btn
        label="왼쪽 정렬"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        ⬅
      </Btn>
      <Btn
        label="가운데 정렬"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        ⬌
      </Btn>
      <Btn
        label="오른쪽 정렬"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        ➡
      </Btn>
      <Sep />

      {/* 목록·인용·링크 */}
      <Btn
        label="불릿 목록"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <span className="tb-text">• 목록</span>
      </Btn>
      <Btn
        label="번호 목록"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <span className="tb-text">1. 목록</span>
      </Btn>
      <Btn
        label="인용"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <span className="tb-text">인용</span>
      </Btn>
      <Btn label="링크" active={editor.isActive("link")} onClick={onLink}>
        <span className="tb-text">링크</span>
      </Btn>
    </div>
  );
}

function Btn({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={active ? "tb-btn is-active" : "tb-btn"}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="tb-sep" aria-hidden="true" />;
}

export default App;
