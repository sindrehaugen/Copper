# `@copper/av-physics`

Pure mathematics and physics core for Audio-Visual systems design.

This package contains pure math functions (no external side-effects) to calculate common values used in AV design, based on industry standards (AVIXA) and fundamental physics.

## Modules

### `display.ts`
- **BDM Max Distance**: AVIXA DISCAS Basic Decision Making viewing distance (6x image height rule).
- **ADM Max Distance**: AVIXA DISCAS Analytical Decision Making viewing distance.
- **ISCR**: Image System Contrast Ratio, including ambient light reflection conversion.
- **Viewing Angle Limits**: Standard checks for horizontal/vertical limits.
- **Pixel Pitch Distance**: Visual acuity standard (1 arcminute) for minimum LED viewing distance.

### `projector.ts`
- **Throw Distance**: Based on min/max throw ratios and screen width.
- **Luminance**: ANSI lumens to screen nits (cd/m²), accounting for area and screen gain.
- **Projected Width**: Distance / Throw Ratio.
- **Lens Shift Envelope**: Validates requested shifts against standard elliptical lens boundaries.
- **Offset Angle**: Trigonometric beam-cone offset geometry.

### `camera.ts`
- **FOV**: Horizontal/Vertical Field of View from sensor dimension and focal length.
- **Coverage Dimension**: Physical width/height of the coverage cone at a specific distance.
- **Pixel Density**: Pixels per meter calculation at a specific distance.

### `microphone.ts`
- **Critical Distance (Dc)**: Distance where direct and reverberant sound energy are equal.
- **PAG/NAG Margin**: Potential/Needed Acoustic Gain stability margin estimation (-6dB FSM included).
- **Polar Attenuation**: Relative sensitivity multiplier for off-axis sound (omni, cardioid, supercardioid, hypercardioid, figure-8).

### `lighting.ts`
- **Point-Source Illuminance**: Inverse square law ($E = I / d^2$).
- **Beam/Field Footprints**: Diameter of projection given distance and angle.
- **Illuminance Components**: Horizontal and vertical lux from incident angle.
- **CCT**: Approximate Correlated Color Temperature (Kelvin) from CIE 1931 x,y using McCamy's formula.

## Testing
Rigorous tests are located in `src/__tests__/` with assertions pinned to real, published reference values. Run tests with:
```sh
pnpm test
```

## LED Power & Signal Distribution
Calculates infrastructure requirements tailored for professional LED panels (e.g. Samsung, Absen, Unilumin) driven by processors like NovaStar H-Series.
- **Port Bandwidth Constraint**: Standard gigabit outputs (e.g. NovaStar H_16xRJ45) have a theoretical pixel capacity, modeled here via NOVASTAR_H_SERIES_PORT_LIMIT (typical safe load: 650,000 pixels).
- **Power Calculation**: Evaluates cabinet max and typical wattage across the array. Outputs required 16A/230V circuits based on an 80% safety margin rule (EU/Norway standard).
- **Thermal Heat Load (BTU/h)**: Converts wattage (W) to British Thermal Units per hour (BTU/h) for ventilation dimensioning (Watts * 3.412142).
