// 영역 경계 강제 — client↔admin 격리 + features DAL(db.ts) 비공개 (ADR-024/033)
// 최소 flat config: TS 파서 + no-restricted-imports 만. 전체 eslint-config-next 보강은 D-1 별도.
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";

// client/admin/app TS 파싱 + 소스의 기존 @next/next disable 주석이 유효하도록 플러그인만 등록(룰 off)
const base = {
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: { "@next/next": nextPlugin },
  linterOptions: { reportUnusedDisableDirectives: "off" },
};

// features 의 db.ts(DAL)는 index.ts 배럴 경유로만 접근 — 외부 직접 import 금지
const dbBarrelOnly = {
  group: ["@/features/*/db", "@/features/*/db.*"],
  message:
    "features 의 db.ts(DAL)는 직접 import 금지 — index.ts 배럴 경유 (ADR-024/033).",
};

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "drizzle/**",
      "out/**",
      "dist/**",
      ".cache/**",
    ],
  },
  // 공개 영역(client): admin import 금지 + DAL 직접 import 금지
  {
    files: ["src/client/**/*.ts", "src/client/**/*.tsx"],
    ...base,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/admin", "@/admin/*"],
              message:
                "client(공개)는 admin 을 import 할 수 없습니다 — 영역 경계 (ADR-024/033).",
            },
            dbBarrelOnly,
          ],
        },
      ],
    },
  },
  // 어드민 영역(admin): client import 금지 + DAL 직접 import 금지
  {
    files: ["src/admin/**/*.ts", "src/admin/**/*.tsx"],
    ...base,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/client", "@/client/*"],
              message:
                "admin 은 client(공개)를 import 할 수 없습니다 — 영역 경계 (ADR-024/033).",
            },
            dbBarrelOnly,
          ],
        },
      ],
    },
  },
  // 라우트(app): DAL 직접 import 금지 (client/admin 조합은 허용)
  {
    files: ["src/app/**/*.ts", "src/app/**/*.tsx"],
    ...base,
    rules: {
      "no-restricted-imports": ["error", { patterns: [dbBarrelOnly] }],
    },
  },
];
