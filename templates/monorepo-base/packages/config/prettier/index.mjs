// Prettier 공유 설정 — 모든 패키지가 import (한국 주석 + Tailwind v4 friendly)
/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: 'lf',
};
