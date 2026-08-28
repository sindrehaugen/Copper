# ADR-0006: The NetBox methodology is binding — object model, lifecycle statuses, and doctrine, not just field names

> **Status:** accepted · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

ADR-0001 made NetBox a *schema convention*. Sindre has directed that Copper must follow the **NetBox methodology** as a whole — the way NetBox models infrastructure and the doctrine behind it — not merely stay field-name compatible. NetBox is the reference model because it is the proven, community-maintained way to model exactly this domain, and because `devicetype-library` (CC0) and every NetBox-trained engineer's intuition come free with it.

## Decision

Copper's domain model (and the node/edge schemas the NS lane lands in NCE) follows NetBox's model wherever NetBox has an answer. Concretely, all binding:

1. **DeviceType is a template; Device is an instance.** A DeviceType (imported from devicetype-library or Bravo-authored) declares component *templates* — interfaces, console ports, power ports/outlets, **front ports, rear ports**, module bays, device bays, `u_height`, `is_full_depth`. Creating a Device instantiates those components onto the instance, which then owns and may edit them. (This is also exactly Romtegning's measured `portsOf` override reality: 21 of 38 models had per-instance port differences — NetBox's instantiate-then-own model is the correct formalization.)
2. **Component classes are distinct, as in NetBox.** Interfaces ≠ front ports ≠ rear ports ≠ console ports ≠ power ports/outlets. AV signal ports that are not network interfaces are modeled as front/rear ports (pass-through capable) or as typed ports in the extension layer — never by overloading Interface.
3. **Front↔rear port mapping is the patch-path mechanism.** Patch panels, wall plates, floor boxes and adapters map front ports to rear ports with positions; **cable path tracing follows NetBox's traversal semantics** (cable → far termination → front/rear mapping → next cable …) so a Copper trace and a NetBox trace of the same plant agree. *(Deferral note, 2026-08-28: the trace implementation is named future NCE Module 6 work — explicitly out of scope for the m6 completion guide and unscheduled in the ledger. The mapping rule is binding NOW because the data must be traceable later; the equivalence claim is untested until that work exists.)*
4. **Containment hierarchy:** Site → Location (recursive, doubles as building/floor/room) → Rack → Device (face + U position); devices may also sit in Locations directly. The D365 Functional Location hierarchy imports onto Site/Location.
5. **Lifecycle is a `status` field on the object, NetBox vocabulary:** Device `planned / staged / active / offline / decommissioning / inventory / failed`; Cable `planned / connected / decommissioning`; Rack `reserved / available / planned / active / deprecated`. (Verify against the pinned NetBox version's choice sets when the schema wave dispatches — vocabulary drift is exactly what the TAG audit checks.) **Design-time objects are `planned` — this is the NetBox-native draft mechanism** and the default answer for ADR-0003. What `status=planned` cannot express (three competing options for the same rack) is handled by a Copper/NCE *design revision* concept layered on top — designed in ADR-0003, and explicitly **not** by porting `netbox-branching` (PolyForm Shield; forbidden dependency).
6. **Extensions extend, never fork.** AV signal semantics (signal classes, per-port signal assignment, compatibility) live in an extension layer beside the NetBox-shaped core — the way NetBox custom fields and plugins extend without renaming core concepts. A NetBox export simply drops the extension layer; nothing in the core depends on it.
7. **IPAM is in scope, NetBox-shaped:** VLAN, Prefix, IPAddress, `primary_ip` on Device — required the moment Dante/AES67/ST 2110 designs are real. Not circuits, not wireless links. *(Unscheduled — no ledger wave funds this yet; B4a's brief names it as deliberately unmodeled. It becomes waves when the first networked-audio design does.)*
8. **Doctrine: documented intent is the source of truth; the network is validated against it.** Copper designs are *desired state* (`planned`), commissioning promotes to `active` (as-built), and Engine 18 capture is *operational state* diffed against it — the NetBox source-of-truth doctrine, realized on NCE's divergence machinery.
9. **API-first:** every canvas action corresponds to an NCE tool call an agent could make without the canvas. The UI is one client of the API, never a privileged path — NetBox's own UI/API relationship.

Where NetBox has **no** answer (AV signal types, adapter insertion, design revisions, BOM emission), Copper owns the design — documented as an extension, with an explicit note of why NetBox has no equivalent.

## Consequences

- Schema waves must cite the NetBox object/field they mirror (or state "extension — no NetBox equivalent") in the wave brief; the TAG audit checks this.
- The one-shot NetBox import/export door becomes near-mechanical, and `devicetype-library` consumption stays trivial forever.
- Some AV modeling gets slightly heavier than a naive design (front/rear port discipline for wall plates), in exchange for path tracing that provably matches industry practice.

## What would reopen this

A modeled AV reality that demonstrably cannot fit the front/rear-port + extension-layer approach after a real attempt (recorded with the failing case), or NetBox changing its model in a way that breaks devicetype-library compatibility.
