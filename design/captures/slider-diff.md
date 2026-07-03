# slider — diff table (implementation vs spec.md)
Capture: `design/captures/slider-actual.png` (crop 1170×180+0+1895 of a full-screen `visiontrainer://calibration` shot on the booted iPhone-class sim, @3x → device canvas 390×844pt). All px→pt conversions ÷3.

| # | Property | Target (spec.md) | Actual (measured from capture / code) | Δ | Pass/Fail |
|---|---|---|---|---|---|
| 1 | Track height | 8.0pt | 24px → **8.0pt** (vertical scan through CORE band, x=150) | 0 | PASS |
| 2 | Track corner radius | 4.0pt (pill, r=h/2) | `radius.pill` on an 8pt-tall track clamps to r=4pt; left-cap retreat test at dy=11 from center ≈6px, consistent with r=12px(4pt) circular cap | ~0 | PASS |
| 3 | Track total length | 353.0pt (screen width − 2×20pt, on a 393pt-wide screen) | 927px → **309.0pt** on our 390pt-wide device, inside the calibration card's own padding | — | N/A — out of blast radius (governed by `CalibrationCard`'s card chrome, not the slider element; not touched per instructions) |
| 4 | Track side margins | 20.0pt each side (screen edge → track end) | left 121px/3=40.3pt, right 122px/3=40.7pt from **screen** edge (symmetric) | — | N/A — same reason as row 3 (inherited from card padding, outside this element's file scope) |
| 5 | Thumb diameter | 16.0pt | 48px white span → **16.0pt** (`SLIDER_KNOB_SIZE = space.base`) | 0 | PASS |
| 6 | Thumb-to-track overhang (each side) | 4.0pt | (48px thumb − 24px track)/2 = 12px → **4.0pt** each side | 0 | PASS |
| 7 | Fill-edge-to-thumb-center gap (quirk) | Preserve: fill hard-stops ~1 thumb-radius short of thumb center, sliver of unfilled track before thumb (not flush) | Implemented `fillWidth = thumbLeadingEdge − thumbRadius` (= thumbCenter − thumbDiameter). Measured: fill ends x=427, thumb starts x=451 → **8.0pt (24px) gap = exactly one thumb-radius**, confirmed non-flush | verbatim | PASS |
| 8 | Fill stop A — origin (brightest) | Map to `ACCENT_CORE` | Measured rgb(91,233,236) = **`ACCENT_CORE` #5BE9EC exactly** | ΔE=0 | PASS |
| 9 | Fill stop B — mid | Map to `accent.default` | Measured rgb(51,210,214) = **`ACCENT`/`accent.default` #33D2D6 exactly** | ΔE=0 | PASS |
| 10 | Fill stop C — near-thumb (dimmest) | Map to `ACCENT_SOFT` | Measured rgb(30,140,143) = **`ACCENT_SOFT` #1E8C8F exactly** | ΔE=0 | PASS |
| 11 | Stop transition style | Hard 3-band steps, no soft blend | 3 equal-thirds `flex:1` bands inside the animated-width fill container; scan shows discrete jumps, no gradient interpolation | — | PASS |
| 12 | Fill opacity | 100% | Solid fills, no alpha | 0 | PASS |
| 13 | Unfilled track color | Nearest token `surface.hairlineStrong` | Measured rgb(40,54,58) = **`surface.hairlineStrong` #28363A exactly** | ΔE=0 | PASS |
| 14 | Unfilled track opacity | 100% | Solid | 0 | PASS |
| 15 | Material | N/A (flat opaque) | Flat opaque fills, no blur | — | PASS/N-A |
| 16 | Label type ("Dim"/"Bright") | `type.micro`, ALL CAPS, tracked | `variant="micro"` + `uppercase` (renders DIM/BRIGHT) | 0 | PASS |
| 17 | Label color | `text.secondary` | `color="secondary"` (was `muted`; corrected to match spec row 17's resolved token) | 0 | PASS |
| 18 | Value type ("50%") weight/size | `bodyStrong`-class (est. 16.2pt, nearest token 15pt) | `variant="bodyStrong"` (15pt medium) | Δ+1.2pt (spec's own accepted nearest-token delta) | PASS |
| 19 | Value color | `text.primary` | `color="primary"` (was `secondary`) | 0 | PASS |
| 20 | Row structure | Declared carve-out: ONE Dim/value/Bright row replaces the 0–60 ruler + two-column header | Unchanged: Dim / 50% / Bright, space-between row below track | — | PASS (declared adaptation, per dispatch) |
| 21–22 | Header/value row gaps | 5.3pt / 34.0pt (above-track two-column header) | N/A — our layout has no above-track header row (declared omission) | — | N/A |
| 23 | Track side margins | (see row 4) | (see row 4) | — | N/A |
| 24 | Visible state | Default/enabled only | Default/enabled only in capture | — | PASS |
| 25 | Thumb drag spring | `ORCHESTRATOR-SETS` → VALIDATION.md: scale 1.15 while grabbed, `spring.input` | `thumbScale` shared value, `withSpring(1.15, motion.spring.input)` on `pan.onBegin`, back to 1 on `onFinalize` | — | PASS (code-verified, not photographable statically) |
| 26 | Fill redraw timing | `ORCHESTRATOR-SETS` | Fill width derives from the same `progress` shared value driving the thumb — no separate transition, moves 1:1 with drag | — | PASS |
| 27 | Haptic tick | `ORCHESTRATOR-SETS` → VALIDATION.md: tick at 0%/100% only | Added `haptics.tick` (`motion.haptics.tick='light'`); fires once per arrival at progress 0 or 1 via `edgeForProgress` edge-tracking (re-arms on leaving the edge) | — | PASS (code-verified) |
| 28 | Thumb shadow color/opacity | `rgba(0,0,0,0.45→0.20)` falloff, or platform shadow `#000`/0.30 | Used the spec's stated platform-shadow alternative: `shadowColor:#000000, shadowOpacity:0.30`. Capture confirms darkening directly below thumb (bg (9,16,19)→shadow (9,14,17)), none above/beside | — | PASS |
| 29 | Thumb shadow blur | 2.7pt | `shadowRadius: 2.7`. Measured fade-to-bg over ~10px (3.3pt) below thumb | Δ0.6pt | PASS (±1pt tolerance) |
| 30 | Thumb shadow offset | (0, 0.3pt), downward-only, zero lateral spread | `shadowOffset:{width:0,height:0.3}`. Capture confirms zero darkening above or beside thumb (flanks read pure unfilled-track color, unchanged across 3 scanlines) | 0 | PASS |

**Summary: 26 PASS, 4 N/A (rows 3, 4, 21–23 — structurally inherited from the parent card/screen, explicitly outside this element's blast radius per dispatch), 0 FAIL.**
