# Batch 054 - X.Wave 1 - \dxf\

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision -> STOP and report.

Rules 1-11: as in \orchestration/_TEMPLATE.md\, verbatim. Branch: \cu-b054-x-w1-dxf\.

**Skills:** nodejs-best-practices
**Depends on:** B23
**Reads (context, do not edit):** \pp/src/projection/toFlow.ts\, \pp/src/model/schema.ts\
**Files (exactly these):** \pp/src/export/dxf.ts\ (new), \pp/src/export/dxf.test.ts\ (new), \pp/package.json\, \pnpm-lock.yaml\
**Goal:** Create a DXF exporter that takes projected React Flow nodes/edges and generates a DXF file.

**Steps:**
1. Install \dxf-writer\ (MIT licensed) in \pp/\.
2. Implement \xportToDxf(nodes, edges)\ in \pp/src/export/dxf.ts\ that creates a new DXF document.
3. Draw a rectangle for each node at its \x,y\ position with its \initialWidth\ and \initialHeight\. Draw a text label inside with the device ID.
4. Draw lines for each edge from its \source\ node to its \	arget\ node.
5. Write \pp/src/export/dxf.test.ts\ that asserts the string output contains DXF markers like \ENTITIES\ and \TEXT\.
6. Gate; commit.

**Acceptance:** Returns a valid DXF string representation of the design.

**§6.4 mutation table:** (1) omit writing TEXT labels, test fails.

## Final: as \orchestration/_TEMPLATE.md\ §Final.