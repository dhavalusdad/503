import js from '@eslint/js';
import globals from 'globals';
// import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
// import storybook from 'eslint-plugin-storybook';
import importOrder from 'eslint-plugin-import';
import ReactPlugin from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      'public/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      '.env*',
      '.vscode/**',
      '.idea/**',
      '*.swp',
      '*.swo',
      '*~',
      '.DS_Store',
      'Thumbs.db',
      'logs/**',
      '*.log',
      'pids/**',
      '*.pid',
      '*.seed',
      '*.pid.lock',
      '.npm/**',
      '.eslintcache',
      // 'storybook-static/**',
      '.vite/**',
      '*.tsbuildinfo',
      'tmp/**',
      'temp/**',
    ],
  },

  // Base JavaScript configuration
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      import: importOrder,
      react: ReactPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      // General JavaScript rules
      'no-console': ['warn', { allow: ['error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      // 'no-undef': 'off',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'react/no-array-index-key': 'off',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': 'warn',
      'no-unexpected-multiline': 'error',
      'no-unreachable-loop': 'error',
      'no-useless-return': 'error',
      'prefer-template': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
        },
      ],
    },
    ignores: ['**/*.stories.*'],
  }

  // Configuration for JavaScript files (if any)
);
