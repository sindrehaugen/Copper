# Batch 068c - U.W1c: Locale Context & Settings
## Context
We need a comprehensive locale system. While B68b added a basic i18n scaffold, Copper requires robust support for language (autoselect based on OS language with optional manual override), accounting/currency formatting, timezone/date formatting, and laws/compliance region context. We also need a user settings area where these preferences can be overridden. 

## Files:
app/src/locale/context.ts
app/src/locale/formatters.ts
app/src/ui/settings/SettingsPanel.tsx
app/src/ui/settings/SettingsPanel.test.tsx

## Rules
1. **Scope:** ONLY the listed files.
2. **IP Firewall:** Absolutely NO EasySchematic paths or Norwegian words (unless acting as translation values).
3. **Purity:** Locale logic must not mix with domain objects.
4. **Platform (T2):** No direct React state outside of providers or local UI components.

## Steps
1. In `app/src/locale/context.ts`, define a React Context + Provider that detects the OS locale (`navigator.language`) and applies formatting standards for: language, accounting, laws (region), and date/time. Allow overriding these via Zustand store or LocalStorage.
2. In `app/src/locale/formatters.ts`, implement `formatCurrency(amount: number, locale: string)`, `formatDate(date: Date, locale: string)`, and `getComplianceRegion(locale: string)`.
3. In `app/src/ui/settings/SettingsPanel.tsx`, build a UI panel to manually override the Language, Timezone, and Region.
4. In `app/src/ui/settings/SettingsPanel.test.tsx`, add tests to ensure the manual override triggers an update.

## Acceptance
`pnpm lint && pnpm typecheck && pnpm vitest run app/src/ui/settings/SettingsPanel.test.tsx`

## Final
Return a summary of what you did. Include your §6.4 mutation test results (mutate the OS detection fallback).
