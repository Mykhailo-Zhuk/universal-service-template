// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Базові правила
  js.configs.recommended,

  // TypeScript правила
  ...tseslint.configs.recommended,

  // React Hooks (manually structured for flat config — guarantees correct plugin shape across plugin versions)
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Загальні правила для Next.js
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Next.js
        React: 'readonly',
        JSX: 'readonly',
        console: 'readonly',
        process: 'readonly',
        // Browser
        window: 'readonly',
        document: 'readonly',
        // Node
        Buffer: 'readonly',
        global: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-undef': 'off', // TypeScript handles this
      'no-empty': ['warn', { allowEmptyCatch: true }]
    }
  },

  // Ігнорувати
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '.vercel/**',
      'next-env.d.ts',
      '*.config.js',
      '*.config.mjs'
    ]
  }
];
