import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y'

import i18nextPlugin from 'eslint-plugin-i18next'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/.vite/**', 'docs/**', 'orchestration/**'] },
  {
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.vite/**',
      'docs/**',
      'orchestration/**'
    ]
  },
  {
    files: ['app/src/views/**/*.{ts,tsx}', 'app/src/ui/**/*.{ts,tsx}', 'app/src/shell/**/*.{ts,tsx}', 'app/src/components/**/*.{ts,tsx}'],
    plugins: {
      i18next: i18nextPlugin
    },
    rules: {
      'i18next/no-literal-string': ['error', { markupOnly: true, ignoreAttribute: ['style', 'className', 'type', 'key', 'id', 'data-testid', 'd', 'fill', 'stroke', 'name', 'value', 'aria-label', 'to', 'min', 'max', 'cx', 'cy', 'r', 'strokeWidth', 'strokeDasharray', 'placeholder', 'width', 'height', 'disabled', 'checked', 'onChange', 'onClick'] }]
    }
  }
)


