# secondary-button — diff table (Phase 4 implementation)

Capture: `design/captures/secondary-button-actual.png` (paywall, `visiontrainer://paywall`, crop
`1170x560+0+1280` from a 1170×2532px @3x raw sim screenshot — iPhone 16e is 390×844pt logical, not
the 393×852pt canvas spec.md's reference PNG was measured against). All pixel measurements below
are PIL scans on this crop; pt = px/3. Per VALIDATION.md laws #1–2, secondary-button geometry is
**inherited wholesale from OUR PrimaryButton**, not re-derived from the Waking Up reference — so
every geometry row below diffs secondary against primary **on the same screen**, not against
spec.md's raw reference pixels.

| # | Property | OUR primary (measured) | OUR secondary (measured) | Delta | Tolerance | PASS/FAIL |
|---|---|---|---|---|---|---|
| **GEOMETRY (law #2: secondary inherits primary, 0px delta expected)** |
| 1 | Height | 144px = 48.0pt (top y=162 → bottom y=306, x=150 column scan) | 144px = 48.0pt (top y=342 → bottom y=486, incl. border) | 0px / 0.0pt | ±1pt | PASS |
| 2 | Width | 1026px = 342.0pt (left x=72 → right x=1098, y=234 mid-row scan) | 1026px = 342.0pt (left x=72 → right x=1098, y=414 mid-row scan) | 0px / 0.0pt | ±1pt | PASS |
| 3 | Left margin (screen edge → button) | x=72 = 24.0pt (`space.lg`, via shared `Screen` padded container) | x=72 = 24.0pt, same container | 0px | ±1pt | PASS |
| 4 | Right margin | x=1170−1098=72px = 24.0pt | x=1170−1098=72px = 24.0pt | 0px | ±1pt | PASS |
| 5 | Corner radius | `radius.pill` (999) → effective stadium r = height/2 = 24.0pt | `radius.pill` (999) → effective stadium r = height/2 = 24.0pt (same token, both hit the pill floor) | 0pt | ±1pt | PASS |
| 6 | Vertical gap, primary bottom → secondary top | — | 306→342 = 36px = **12.0pt exactly** | matches `space.md` | exact | PASS |
| 7 | Label type | `type.heading` (medium 20/26pt/−0.2) via `AppText variant="heading"` | `type.heading`, same `AppText variant="heading"` call | identical component/token | exact | PASS |
| **TREATMENT (law #2: Waking Up contributes fill/border only)** |
| 8 | Interior fill | n/a (solid isoluminant ramp) | `backgroundColor: 'transparent'` — sampled (13,31,35) vs local bg directly above button (13,32,36), Δ≤1 (ambient-gradient noise, not a fill) | bit-exact | ΔE<3 | PASS |
| 9 | Border color | n/a (no border) | sampled (40,54,58) = **exact hex `#28363A`** = `surface.hairlineStrong` | 0 | exact token | PASS |
| 10 | Border width | n/a | 5px @3x raster = 1.67pt effective (borderWidth:1.5 in code, device pixel-grid rounds 4.5px→5px) | +0.17pt vs 1.5pt spec | ±1pt | PASS |
| 11 | Label color | `text.inverse` `#08161A` (on accent fill) | sampled (239,243,244) = **exact hex `#EFF3F4`** = `text.primary` | 0 | exact token | PASS |
| 12 | Surface/material | flat, no glass | flat `View`-level border/fill via `PressableScale`, no `GlassSurface`/blur — matches spec row 21 ("not glass") | — | — | PASS |
| **CALIBRATION INHERITANCE (visual check, no separate table per instructions)** |
| 13 | `CalibrationCard`'s "Done" button now renders via the same `SecondaryButton` component (previously a bespoke `GlassSurface` pill) | see `design/captures/secondary-button-calibration-actual.png` | pill radius, transparent interior, hairline border, white label — visually identical treatment to "Maybe later" | — | — | PASS |

**Result: 13/13 PASS, 0 FAIL.** No spec row could not be satisfied.

Note on margins: spec.md row 11 measured the *reference* (Waking Up) screenshot at 32.0pt side
margins on a 393pt-wide canvas. Our device canvas is 390pt logical (iPhone 16e), and our
`PrimaryButton`/`SecondaryButton` pair both inherit `Screen`'s existing `padded` container
(`space.lg` = 24pt each side) — already identical between the two buttons (row 3–4 above, 0px
delta), which is what law #2 actually requires ("secondary-button geometry inherits OUR primary").
Changing the app's global screen padding to literally hit 32pt was out of this element's blast
radius (shared `Screen` component) and was not needed to satisfy the law.
