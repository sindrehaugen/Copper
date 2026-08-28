# ADR-0008: EU/Nordic market, law and standards baseline

> **Status:** accepted (baseline; individual items carry their own verification waves) · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

Copper serves an EU/Nordic (primarily Norwegian) AV/IT/network-operations business. That market brings binding law (GDPR, the European Accessibility Act's EN 301 549, NIS2 for network-service operations, the EU AI Act for AI-assisted features), Nordic engineering standards that differ from the US defaults AV tooling assumes (CENELEC EN 50173 cabling rather than TIA-568 as primary; NEK 700-series in Norway; TFM/NS 3451 designation practice), and Nordic business plumbing (EHF/PEPPOL e-invoicing, MVA/VAT, bokføringsloven retention) that NCE's economy/sales engines and their surfaces must respect.

## Decision

The baseline, binding on all lanes:

1. **Privacy (GDPR):** NCE already carries the data-layer machinery (RLS tenancy, `me_app` DSAR/GDPR surface, C9b no-person-grain guard). Copper's obligations: no personal data in URLs or client logs (a TAG-audit lens + B68b acceptance), DSAR surface wired into the shell (C lane), EU-resident hosting owned by ADR-0012, and no third-party scripts/CDNs in the product app (CI-checked by B2). *(The docs site is exempt as accepted risk: it is published to GitHub Pages and hotlinks Google Fonts — internal documentation, not the product.)*
2. **Accessibility (EN 301 549 / WCAG 2.1 AA):** required for market access under the European Accessibility Act. Enforced as ratchets from the shell wave onward (lint a11y rules + automated axe smoke in CI + keyboard-operability acceptance criteria in canvas waves). The canvas gets an accessible *equivalent path* (schedules, tables, structured navigation) — a drawing surface can't be fully AA by itself and the equivalent-path is the recognized approach; recorded honestly as such.
3. **Language & locale:** UI copy externalized from wave one; `nb-NO` and `en` shipped; dates/numbers/currency via `Intl` with NOK primary, EUR/SEK/DKK expected. Domain vocabulary follows NetBox English in code (ADR-0006) with Norwegian UI labels.
4. **Cabling/infrastructure standards:** validators compute against **EN 50173 / NEK 700-series limits as primary**, with TIA-568 as the compatibility secondary (they mostly agree numerically; where they diverge, EN/NEK wins and the divergence is documented in the validator). AVIXA standards remain the AV performance layer. Reference designation (ADR-0004) stays IEC 81346/TFM-flavored — the Nordic construction reality.
5. **NIS2 posture:** Copper/BFF follow the security-hygiene expectations of an operator in scope via its customers: authenticated everything (ADR-0011), audit trails on world-writes (NCE event log), no default credentials, dependency scanning in CI (carried by B2's `pnpm audit` step). A formal NIS2 mapping is a documentation wave when the netops surfaces arrive.
6. **EU AI Act alignment:** NCE's Contract B (human-confirm-first on world-writes, no autonomy) already matches the human-oversight posture. Copper's obligation is *transparency in the UI*: AI-derived values are labeled with provenance (C9a citations), confidence is never presented as calibrated, and confirm dialogs state what an AI proposed vs what a human decided.
7. **Nordic business plumbing:** economy/sales surfaces present MVA correctly and keep EHF/PEPPOL as the invoicing exit door (NCE-side concern; Copper surfaces must not assume US-style tax/invoice shapes).

## Consequences

- A11y and i18n cost ~nothing at wave one and are ruinous to retrofit — hence they land in the shell wave (U.W1/U.W2) before any module surface.
- The V-lane channel-length wave (B37) is re-scoped to EN 50173/NEK 700 primary.
- Legal texts change; each compliance item carries "verify current edition" in its wave brief rather than trusting this ADR's date.

## What would reopen this

Expansion beyond EU/EEA markets, or the AI-feature set growing into EU AI Act high-risk categories (would trigger a real conformity assessment, not just transparency).
