import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y'

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
  }
)


