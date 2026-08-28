# Kaizen Ledger
This file tracks Kaizens (continuous improvement findings) discovered by Auditors during TAG Audit. They are non-blocking improvements to be tackled in future hardening waves.

- **B10**: Fix the `tsconfig.node.json` config and broken types in `main` so `typecheck` can pass properly on future waves.
- **B22**: The `'Unknown Device'` fallback string in `DeviceNode.tsx` could be moved to the i18n dictionary for full ADR-0008 compliance.
- **B30**: The unmatched override fallback loops (e.g. `!frontTemplates.find(t => t.name === override.name)`) use O(N) array lookups per iteration; using a Set for template names would optimize this, though negligible at typical port scales.
