# Batch 069 - U.W2: A11y Ratchets
## Context
We need to enforce accessibility (a11y) baselines across the app shell and future components. We will add eslint-plugin-jsx-a11y rules, axe smoke tests against the shell, and a keyboard-operability harness. We will also update the acceptance gate in the prompt template to explicitly require EN 301 549/WCAG 2.1 AA compliance.

## Files:
eslint.config.js
app/src/shell/index.test.tsx
package.json
orchestration/_TEMPLATE.md

## Rules
1. **Scope:** ONLY the listed files.
2. **IP Firewall:** Absolutely NO EasySchematic paths or Norwegian words.

## Steps
1. In `package.json`, add `eslint-plugin-jsx-a11y` and `@axe-core/react` to `devDependencies` if not present.
2. In `eslint.config.js`, configure `jsx-a11y` recommended rules.
3. In `app/src/shell/index.test.tsx`, add an axe test to ensure the Shell component has no a11y violations. Also add a basic keyboard operability test (e.g. tabbing through interactive elements).
4. In `orchestration/_TEMPLATE.md`, update rule 5 (Acceptance gate) to state: "Code must comply with EN 301 549 / WCAG 2.1 AA standards for accessibility."

## Acceptance
`pnpm install && pnpm lint && pnpm typecheck && pnpm vitest run app/src/shell/index.test.tsx`

## Final
Return a summary of what you did. Include your §6.4 mutation test results (e.g., mutate a `tabIndex` or aria label to break the test).
