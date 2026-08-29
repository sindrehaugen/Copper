# Batch 007 - K.W1: dtl-vendor

> **FRESH SESSION REQUIRED.**
> **Engine class:** Pro.

1. **One wave = one branch = one commit.** Branch cu-b007-k-w1-dtl-vendor off current main. Squash everything into one commit.
2. **Modify only the files listed in Files:.**
3. **Acceptance gate:** pnpm test clean.

**Files:**
- catalog/devicetype-library/** (downloaded yaml files)
- catalog/scripts/sync-dtl.mjs (script to sync)
- catalog/README.md (provenance note)

**Goal:**
Vendor a subset of the NetBox devicetype-library into catalog/devicetype-library/.
We only need a small set of vendors: Cisco, Netgear, Ubiquiti, APC, Eaton, Middle Atlantic, Yamaha, Blackmagic.

**Steps:**
1. Write a script catalog/scripts/sync-dtl.mjs that clones/downloads the netbox-community/devicetype-library repo at a specific pinned SHA, extracts the YAML files for only those listed vendors, and copies them to catalog/devicetype-library/<vendor>/*.yaml.
2. Ensure the script is idempotent and handles cleaning up old files.
3. Run the script to generate the files.
4. Add catalog/README.md containing a CC0 declaration and the upstream SHA used.

**Acceptance:** 
ode catalog/scripts/sync-dtl.mjs runs idempotently and populates the library.
