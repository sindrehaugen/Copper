# Batch 044 - R.Wave 4 - \location-tree\

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision -> STOP and report.

Rules 1-11: as in \orchestration/_TEMPLATE.md\, verbatim. Branch: \cu-b044-r-w4-location-tree\.

**Skills:** react-best-practices
**Depends on:** B4b, B20
**Reads (context, do not edit):** \pp/src/model/schema.ts\
**Files (exactly these):** \pp/src/ui/location-tree/LocationTree.tsx\ (new), \pp/src/ui/location-tree/LocationTree.test.tsx\ (new)
**Goal:** Create a UI component that renders a nested tree of Sites -> Locations (-> child Locations) from the DesignDocument.

**Steps:**
1. Create \LocationTree.tsx\. It should accept a \DesignDocument\ as a prop.
2. Render a hierarchical list (e.g. using ul/li). Top level is Sites. Under each Site, render Locations belonging to that site (\location.siteId === site.id\ and \!location.parentId\). Nest Locations based on \parentId\.
3. Use \data-testid\ attributes to make testing easy.
4. Write \LocationTree.test.tsx\ asserting the nested DOM structure matches a mock document (1 site, 2 root locations, 1 nested location).
5. Gate; commit.

**Acceptance:** Component correctly nests Locations under Sites and Locations under parent Locations.

**§6.4 mutation table:** (1) render all locations flat, ignoring \parentId\ and \siteId\, test fails.

## Final: as \orchestration/_TEMPLATE.md\ §Final.