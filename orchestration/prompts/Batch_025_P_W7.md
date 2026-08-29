# Batch 025 - P.W7: cable-schedule

> **FRESH SESSION REQUIRED.**
> **Engine class:** Pro.

1. **One wave = one branch = one commit.** Branch cu-b025-p-w7-cable-schedule off current main. Squash everything into one commit.
2. **Modify only the files listed in Files:.**
3. **Acceptance gate:** pnpm test clean, pnpm typecheck clean.

**Files:**
- pp/src/views/cable-schedule/CableScheduleView.tsx (new)
- pp/src/views/cable-schedule/CableScheduleView.test.tsx (new)
- pp/src/export/csv.ts (new)
- pp/src/export/csv.test.ts (new)

**Goal:**
Create a tabular view of all cables in the DesignDocument. It should show the Source Device + Port, Target Device + Port, and Signal Type.
It should also include a button to export this table to a CSV file.

**Steps:**
1. In pp/src/export/csv.ts, write a function xportCablesToCsv(document: DesignDocument): string that returns CSV content. Use standard CSV formatting.
2. In pp/src/views/cable-schedule/CableScheduleView.tsx, write a React component that takes a DesignDocument and renders the HTML table. Add a button that downloads the CSV output from xportCablesToCsv. Use standard HTML/CSS or existing UI components.
3. Write basic tests proving the CSV generates correctly and the component renders.

**Acceptance:** pnpm test runs successfully.
