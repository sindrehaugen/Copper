# Batch 010 - K.W4: av-seed-set

> **FRESH SESSION REQUIRED.**
> **Engine class:** Pro.

1. **One wave = one branch = one commit.** Branch cu-b010-k-w4-av-seed-set off current main. Squash everything into one commit.
2. **Modify only the files listed in Files:.**
3. **Acceptance gate:** pnpm check:catalog clean.

**Files:**
- catalog/bravo/*/*.yaml

**Goal:**
Create exactly 10 seed AV types representing core integration devices. You must author these by hand based on public datasheet knowledge, NOT from EasySchematic's catalog.

**Required Vendors/Brands (1 each):**
1. QSC (e.g. Q-SYS Core 110f)
2. Extron (e.g. IN1608 xi)
3. Crestron (e.g. CP4)
4. Biamp (e.g. TesiraFORTE DAN AI)
5. Shure (e.g. MXA910 or P300)
6. Sennheiser (e.g. TCC2)
7. Lightware (e.g. Taurus UCX-4x2-HC30)
8. Kramer (e.g. VS-411UHD)
9. Genelec (e.g. 4420A Smart IP)
10. Barco (e.g. ClickShare CX-50)

**Format:**
Must be valid DTL format with the copper_extensions root key (as defined in B9). Include signal classes for ports. Include a comment citing the public datasheet used.

**Acceptance:** pnpm run check:catalog passes.
