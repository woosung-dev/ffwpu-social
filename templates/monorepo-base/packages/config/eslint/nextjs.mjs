// ESLint flat config — Next.js 16 앱 전용 preset (base 확장 + Next core-web-vitals + React hooks)
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import base from './base.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactPlugin.configs.flat?.recommended?.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../apps/*', '@myorg/web/*', '@myorg/admin/*'],
              message: 'apps 간 직접 import 금지 — packages/features 또는 packages/ui-base 경유',
            },
            {
              group: ['@myorg/db', '@myorg/db/*'],
              importNames: ['db'],
              message: "'use client' 컴포넌트에서 DB client import 금지 — server component / action / route handler 에서만",
            },
          ],
        },
      ],
    },
  },
];
