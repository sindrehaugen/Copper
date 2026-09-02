import re

with open('orchestration/CL2.md', 'r', encoding='utf-8') as f:
    c = f.read()

replacement = '''* [DONE] B119 - K.W4 hygiene-and-suppression-zero: remove all 8 `// @ts-nocheck` and fix what they hid... (Tip: `grep -rn "@ts-nocheck" app bff` returns 0 when you're done); delete all root scratch scripts (`node`, `fix`, `mark`, etc.) as they evade `npm run` and typescript entirely; fold `LocaleProvider` into `i18n.ts` and delete `app/src/locale/` entirely (resolves duplicate logic); delete `app/src/views/problems/ProblemsPanel.tsx` (it is duplicated in `ui/`); fix `scripts/seed-integration.ts:12` - tier: T1 - dep: B118 [PASSED TAG: pnpm lint && pnpm typecheck exit 0]
    - Files: repo root scratch files, the 8 `@ts-nocheck` files, `app/package.json`, `app/src/views/problems/`, `app/src/locale/`, `app/src/locales/i18n.ts`, `scripts/{forbidden-sources,seed-integration}.*` - Goal: `pnpm lint` exits 0 honestly, with nothing suppressed and no second implementation of anything - Accept: `pnpm lint` 0 problems; `grep -rn "@ts-nocheck" app bff` returns 0; `pnpm forbidden` RED on a planted concatenation (demonstrated, reverted); `git status` clean'''

start = c.find('* [IN PROGRESS] B119')
if start == -1:
    start = c.find('* [LOCKED] B119')

end = c.find('* [LOCKED] B120', start)
if start != -1 and end != -1:
    c = c[:start] + replacement + '\n> ' + c[end:]
    with open('orchestration/CL2.md', 'w', encoding='utf-8') as f:
        f.write(c)
    print('Replaced B119')
else:
    print('Could not find')
