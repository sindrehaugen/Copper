# Batch 050 - Q.W6: rig-ratchet

> **FRESH SESSION REQUIRED.**
> **Engine class:** Pro.

1. **One wave = one branch = one commit.** Branch cu-b050-q-w6-rig-ratchet off current main. Squash everything into one commit.
2. **Modify only the files listed in Files:.**
3. **Acceptance gate:** pnpm test clean.

**Files:**
- .github/workflows/ci.yml (add the rig-ratchet step)
- scripts/rig-ratchet.mjs (the script that evaluates the floor)
- package.json (add script)

**Goal:**
B6 created ig/run.mjs which reads the 15 real v-fasit sheets.
We need a script scripts/rig-ratchet.mjs that evaluates the routing quality of the 15 real sheets, and asserts the total ugliness score is below a FLOOR_SCORE. If the score regresses, it exits with 1.

**Steps:**
1. In scripts/rig-ratchet.mjs, import the 15 sheets from pp/tests/fixtures/av-fasit/*.json. Parse them via eadEasySchematic. Then run them through the projection pipeline (like in 2e.test.ts): 	oFlow, pplyElkLayout, nhanceEdges.
2. Extract the projected paths (from edges) and 
odeBounds (from nodes).
3. Evaluate them using valuateQuality(paths, nodeBounds) from pp/src/router/quality.ts.
4. Sum the scores. Assert total < FLOOR_SCORE.
5. Add check:rig script to package.json.
6. Add step to .github/workflows/ci.yml.

**Acceptance:** pnpm run check:rig passes and pnpm test passes.
