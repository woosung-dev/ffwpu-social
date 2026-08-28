// 글꼴 화이트리스트 — 툴바 ↔ sanitize ↔ 공개 렌더 ↔ 웹폰트 로딩이 공유하는 SSOT 검증
import { describe, expect, it } from "vitest";

import {
  EDITOR_FONTS,
  googleFontsHref,
  normalizeFontFamily,
  resolveFontStack,
} from "./editor-allowlist";
import { collectUsedFonts, sanitizeTiptapJson } from "./sanitize";

const run = (input: unknown) =>
  sanitizeTiptapJson(input, { isAllowedImageSrc: () => true });

const textWithFont = (fontFamily: string) => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "밥이 사랑입니다", marks: [{ type: "textStyle", attrs: { fontFamily } }] },
      ],
    },
  ],
});

describe("normalizeFontFamily", () => {
  it("대표 패밀리명 그대로 통과", () => {
    expect(normalizeFontFamily("Nanum Myeongjo")).toBe("Nanum Myeongjo");
  });

  it("브라우저가 붙인 따옴표·폴백 스택에서 첫 패밀리만 추출", () => {
    // element.style.fontFamily 직렬화 형태 (Tiptap FontFamily 의 parseHTML 주석 참조)
    expect(normalizeFontFamily('"Gothic A1", sans-serif')).toBe("Gothic A1");
    expect(normalizeFontFamily("'Gowun Batang', serif")).toBe("Gowun Batang");
  });

  it("목록에서 제거된 글꼴(본명조)은 null — 사이트 기본 글꼴로 떨어진다", () => {
    // ADR-061 에서 Noto Serif KR 을 뺐다(청크당 49KB). 그 값을 들고 있는 글은 마크가 drop 돼
    // **사이트 기본 글꼴(SUIT, 고딕)** 로 렌더된다 — serif 로 떨어지지 않는다.
    // 되살릴 필요가 생기면 EDITOR_FONTS 에 다시 넣기만 하면 옛 글도 함께 복구된다.
    expect(normalizeFontFamily("Noto Serif KR")).toBeNull();
    expect(resolveFontStack("Noto Serif KR")).toBeNull();
  });

  it("대소문자 차이를 흡수한다", () => {
    expect(normalizeFontFamily("nanum gothic")).toBe("Nanum Gothic");
  });

  it("화이트리스트 밖 글꼴은 null (docx 붙여넣기 방어)", () => {
    expect(normalizeFontFamily("맑은 고딕")).toBeNull();
    expect(normalizeFontFamily("Malgun Gothic, sans-serif")).toBeNull();
    expect(normalizeFontFamily("")).toBeNull();
    expect(normalizeFontFamily(undefined)).toBeNull();
  });
});

describe("resolveFontStack", () => {
  it("대표 패밀리명 → 폴백 포함 스택", () => {
    expect(resolveFontStack("Nanum Myeongjo")).toBe("'Nanum Myeongjo', serif");
    expect(resolveFontStack("Gaegu")).toBe("'Gaegu', cursive");
  });

  it("미등록 값은 null (인라인 style 미출력)", () => {
    expect(resolveFontStack("Comic Sans MS")).toBeNull();
  });
});

describe("googleFontsHref", () => {
  it("여러 글꼴을 한 요청으로 묶는다", () => {
    const href = googleFontsHref(["Nanum Myeongjo", "Gaegu"]);
    expect(href).toContain("family=Gaegu:wght@400;700");
    expect(href).toContain("family=Nanum+Myeongjo:wght@400;700");
    expect(href).toContain("display=swap");
  });

  it("중복·미등록 값을 제거한다", () => {
    const href = googleFontsHref([
      "Nanum Myeongjo",
      "Nanum Myeongjo",
      "맑은 고딕",
    ]);
    expect(href?.match(/family=/g)).toHaveLength(1);
  });

  it("쓸 글꼴이 없으면 null — 링크 자체를 안 그린다", () => {
    expect(googleFontsHref([])).toBeNull();
    expect(googleFontsHref(["맑은 고딕"])).toBeNull();
  });
});

describe("sanitize + collectUsedFonts 연결", () => {
  it("허용 글꼴은 마크에 보존되고 수집된다", () => {
    const safe = run(textWithFont("Nanum Myeongjo"));
    const mark = safe!.content![0].content![0].marks![0];
    expect(mark.attrs!.fontFamily).toBe("Nanum Myeongjo");
    expect(collectUsedFonts(safe)).toEqual(["Nanum Myeongjo"]);
  });

  it("따옴표 스택으로 저장된 옛 값도 대표명으로 정규화된다", () => {
    const safe = run(textWithFont('"Gowun Batang", serif'));
    expect(collectUsedFonts(safe)).toEqual(["Gowun Batang"]);
  });

  it("화이트리스트 밖 글꼴은 drop — textStyle 마크 자체가 사라진다", () => {
    const safe = run(textWithFont("맑은 고딕"));
    expect(safe!.content![0].content![0].marks).toBeUndefined();
    expect(collectUsedFonts(safe)).toEqual([]);
  });

  it("글꼴을 안 쓴 글은 수집 결과가 비어 폰트 요청이 0 건", () => {
    const safe = run({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "본문" }] }],
    });
    expect(collectUsedFonts(safe)).toEqual([]);
    expect(googleFontsHref(collectUsedFonts(safe))).toBeNull();
  });
});

describe("EDITOR_FONTS 목록 불변 조건", () => {
  it("첫 항목은 마크를 지우는 '기본' 이다", () => {
    expect(EDITOR_FONTS[0]).toMatchObject({ value: "", googleFamily: null });
  });

  it("기본 외 모든 항목은 스택과 구글 family 를 갖는다", () => {
    for (const f of EDITOR_FONTS.slice(1)) {
      expect(f.stack).not.toBe("");
      expect(f.googleFamily).toBeTruthy();
      // 저장값이 스택의 첫 패밀리와 일치해야 왕복(저장→파싱)이 성립
      expect(normalizeFontFamily(f.stack)).toBe(f.value);
    }
  });
});
