# Batch 022 - P.Wave 4 - `canvas-readonly`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision -> STOP and report.

Rules 1-11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b022-p-w4-canvas-readonly`.

**Skills:** react-pro, react-flow
**Depends on:** B21
**Reads (context, do not edit):** `app/src/projection/toFlow.ts`
**Files (exactly these):** `app/src/views/canvas/CanvasView.tsx` (new), `app/src/views/canvas/nodes/DeviceNode.tsx` (new), `app/src/views/canvas/index.ts` (new)
**Goal:** Implement a read-only React Flow canvas that renders `toFlow` output. Device nodes must render as cards with a header, and a list of ports. Each port row must have dual handles (left/source, right/target) to support bidirectional edge routing. Implement `measure-on-mount` logic for nodes to report their actual DOM height back if needed (or just rely on React Flow's internal measurement if suitable, but ensure width/height are populated).

**Steps:**
1. Create `DeviceNode.tsx` as a custom React Flow node. It must display the device label and iterate over ports, rendering a left Handle and right Handle for each port.
2. Create `CanvasView.tsx` which wraps `<ReactFlow>` and accepts `nodes` and `edges` as props.
3. Wire the custom node type.
4. Export through `index.ts`.
5. Write a simple rendering test in `CanvasView.test.tsx` (add this to Files).
6. Gate; commit.

**Acceptance:** `CanvasView` renders without crashing when provided mock nodes/edges. Ports have both source and target handles.

**§6.4 mutation table:** (1) mutate the node type mapping to omit `device`, fail the test rendering a device node.

## Final: as `orchestration/_TEMPLATE.md` §Final.