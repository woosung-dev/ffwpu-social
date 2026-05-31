// Tailwind v4 preset — content scan 경로·shared plugin 만. 색/폰트 토큰은 각 앱 globals.css 의 @theme 에서 주입
import type { Config } from 'tailwindcss';

/**
 * 각 앱이 import 후 자기 globals.css 에서 @theme inline 으로 토큰 override.
 * ui-base 는 토큰 미주입 (디자인 분리 SSOT 보호).
 */
const preset: Partial<Config> = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui-base/components/**/*.{ts,tsx}',
    '../../packages/features/**/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default preset;
