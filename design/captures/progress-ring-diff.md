# progress-ring — diff table (law 7 adaptation)

Element: the halo ring orbiting the orb on Today. **Correction to dispatch prompt:** `src/components/home/ContrastArc.tsx` is dead code (not imported/rendered anywhere in the app — verified via repo-wide grep). The live ring is the "steady progress halo" layer inside `src/components/home/CelestialGabor.tsx` (lines ~204–236: track circle + progress `AnimatedCircle`... actually plain `Circle` with `strokeDasharray`). All edits below were made there instead, scoped strictly to the halo-ring circles (did not touch the orb body, grating, graticule ring, or cardinal ticks). `ContrastArc.tsx` was left untouched.

Capture: `design/captures/progress-ring-actual.png` (crop 1170×900+0+230, iPhone 16e sim, native build, relaunched after edit). Measurements via PIL/numpy, Kasa least-squares circle fit + FWHM radial profiling + local-background least-squares alpha solve (33 angle samples), same methodology class as Phase 3 spec.md.

Scale derived for pt conversion: fitted arc centerline radius 375.70 px = `HALO_R` (116pt) × `orbScale` transform (1.08) = 125.28 pt effective → **2.999 px/pt** (≈ device 3x, consistent with sim capture).

| # | Property | Spec / law 7 target | Measured (actual) | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 1 | Track hue relationship (never grey) | `accent.trackTint` = `rgba(51,210,214,0.15)`, same hue as fill at low opacity | Least-squares alpha solve over 33 angles, near-field background (r+7px): **α = (0.156, 0.151, 0.154)** per R/G/B — hue matches ACCENT (51,210,214) exactly (that's the solved FG) | ~0.003–0.006 from 0.15 | PASS |
| 1b | Track alpha invariance over two backgrounds | Same composite-minus-bg relationship regardless of local bg (never opaque) | Bright-bg sample (angle 215°, local bg (32,115,124)): α≈(0.21,0.17,0.17); dark-bg sample (angle 130°, local bg (17,45,51)): α≈(0.15,0.16,0.15) — both cluster near 0.15, tracks the bg (alpha-blend behavior), unlike the old opaque `surface.hairline` defect which stayed pixel-identical regardless of bg | within ±0.06 (small-patch sampling noise on a continuous gradient bg, not dithered like the reference PNG) | PASS |
| 2 | Stroke width | 3.0 pt | FWHM radial profile at 0°: 8.9 px → **2.97 pt** | 0.03 pt | PASS |
| 3 | Cap style | Round (verify already correct) | Zoomed crop of arc's trailing terminus (non-marker end): clean round terminus, unchanged code path (`strokeLinecap="round"` untouched) | — | PASS |
| 4 | Head marker shape | Circle | Circle (new `<Circle>` element added) | — | PASS |
| 5 | Head marker diameter | 2× stroke = 6.0 pt | Color-mask bbox 19×18 px → **6.34 pt × 6.00 pt** | 0.34 pt / 0.0 pt | PASS |
| 6 | Head marker position | Centered on stroke centerline, at the arc's leading (progress) edge | Marker-center-to-ring-center distance 375.9 px vs fitted arc centerline radius 375.7 px (Δ0.2px ≈ 0.07pt); angle matches `-90° + progress×360°` exactly (progress=0.5 → 90°, i.e. straight down) | 0.07 pt | PASS |
| 7 | Head marker fill color | `accent.core` (`#5BE9EC` / rgb 91,233,236) | Sampled marker-center pixel: **(91, 233, 236)** — exact | 0 | PASS |
| 8 | Fill (progress arc) color | `accent.default` (`#33D2D6`) — unchanged | Unchanged, not touched | 0 | PASS |
| **REGRESSION** | | | | | |
| 9 | Ring diameter (centerline), unchanged | Baseline (`design/captures/current/today.png`, opaque-grey track era): fitted radius 376.0 px | New capture: fitted radius 375.7 px | 0.3 px ≈ 0.1 pt | PASS |
| 10 | Ring horizontal center, unchanged | Baseline cx 584.3 (same crop frame) | New cx 584.8 | 0.5 px | PASS |
| 11 | Ring vertical position | Baseline cy 501.3 vs new cy 353.6 (same crop frame) — large apparent delta | Not a regression from this change: baseline reference predates the "14 day streak" header text (verified visually — baseline crop has no streak pill, shorter header block), which shifts the whole orb container vertically within the screen. No layout/position code was touched in this change (`CelestialGabor.tsx` ring-color/stroke/marker edits only); composition (diameter + position *relative to the orb*) is unchanged by construction — the ring circle's `cx`/`cy`/`r` still reference the same `C`/`HALO_R` constants as before | N/A (unrelated layout state, not this diff) | PASS (caveat noted) |

**Result: 11/11 PASS, 0 FAIL.**

## Changed files
- `src/components/home/CelestialGabor.tsx` — halo-ring track color (`surface.hairline` → `accent.trackTint`), `HALO_STROKE` 2 → 3, added head-marker `<Circle>` (fill `ACCENT_CORE`, r = `HALO_STROKE`) computed from `clamped` progress angle. Added `accent` to the tokens import.
- `src/components/home/ContrastArc.tsx` — **not touched** (confirmed dead code, out of scope for a live-render fix).

## Not carried (per spec/law 7, correctly excluded)
- The reference's 0.198 stroke:diameter donut ratio — REJECTED per law 7, composition unchanged.
- Head-marker inner glyph (Apple's arrow icon) — spec.md row 9 explicitly excludes it.
- New ticks/endpoint decorations — none added; existing graticule ring + 4 cardinal ticks preserved verbatim.
