# primary-button — diff table (all-PASS)

Capture: `design/captures/primary-button-actual.png` — Today tab, no deeplink (relaunch lands here), crop `(0,1752)-(1170,2172)` on the booted iPhone 16e sim (1170×2532px @3x), containing the "Start session" CTA. Measured with PIL against `design/references/primary-button/target.png` (1180×2556px) + `spec.md` numbers as overridden by `VALIDATION.md` laws 1–3.

Paywall inheritance check (visual only, no separate diff table): `design/captures/primary-button-paywall-check.png` — `visiontrainer://paywall` "Start training" CTA renders the identical geometry/gradient/label as Today's CTA. Confirmed by eye.

| # | Property | Target | Actual | Delta | Result |
|---|---|---|---|---|---|
| 1 | Button height | 144px / 48.0pt | 144px measured (top y=1890 → bottom y=2033, half-max edge scan) = 48.0pt | 0 | PASS |
| 2 | Corner radius (pill) | True stadium, r = height/2 = 72px (24pt), `radius.pill` (999) | Circle-fit against left-cap silhouette at dy=2/5/10/20/40/72 from cap top: measured edge x within 0–2px of predicted (e.g. dy=20 → 118 measured vs 118.2 predicted; dy=72 → 96 vs 96.0) | ≤2px | PASS |
| 3 | Side margins (L/R) | 32pt total edge-to-button each side (orchestrator ruling — margins are part of the CTA element per law 1) | Measured **32.0pt left / 32.0pt right** (button edges x=96→1073 on the 1170px @3x canvas, half-max edge scan at pill mid-height). Fixed at the usage site: `styles.startCta = { marginHorizontal: space.xl − space.lg }` in `src/app/(tabs)/index.tsx` — parent `Screen` pads `space.lg` (24pt), CTA adds the remaining 8pt, token-composed. `Screen.tsx` untouched. | 0.0pt | PASS |
| 4 | Bottom offset | `safeAreaBottom + space.base` = 50pt | Screen-owned (`insets.bottom` padding in `Screen.tsx`), not set by `PrimaryButton.tsx` | — | N/A — out of blast radius |
| 5 | Button width | Informational — flex to container minus 2×margin | Confirmed: component sets no explicit width, fills container | — | PASS (as designed) |
| 6 | Gradient axis/angle | Horizontal, 90° / `to right`, 0 vertical variance | Same-x top-row (y=1895) vs bottom-row (y=2025) samples at x=200/400/600/800/1000: diff ≤1 per channel (rounding only) | ≤1/255 | PASS |
| 7 | Gradient stops (isoluminant ramp, law 3) | `#A2FFD1·#BAFFE9·#BCFEF3·#B0FDF9·#A3F9FD` @ 0/25/50/75/100% | Sampled at y=1962 (mid-height, full-width row, button x=96→1073): `#A3FFD2, #BAFFE9, #BCFEF3, #B0FDF9, #A3F9FD` | 0% stop off by 1 in R channel (AA edge pixel), rest exact | PASS |
| 8 | Luminance-delta fidelity (law 3 ruling) | Near-isoluminant ramp (not the old HOT→CORE→ACCENT ladder) | Implemented via `accent.ctaRamp` exactly per law 3; stop lums 232.2→239.2→231.0, i.e. flat/near-isoluminant as ruled | matches law 3 by construction | PASS |
| 9 | Label color (enabled) | `text.inverse` `#08161A` | Darkest label pixel in text bbox: `#08161A` exact | 0 | PASS |
| 10 | Ambient glow | Unmeasurable from reference (flagged); recommended low ambient echo, opacity ~0.15–0.20, blur ≈24–32pt, offset 0,0 | `shadowColor: ACCENT_CORE`, `shadowOpacity: 0.18`, `shadowRadius: 28`, `shadowOffset: {0,0}` (iOS only) | within recommended range | PASS |
| 11 | Label font size | Nearest token `type.heading` (20/26), spec-accepted delta −2.2pt vs raw measurement | `type.heading` via `AppText variant="heading"` (unchanged) | 0 vs accepted token | PASS |
| 12 | Label weight | `fontFamily.medium` | `type.heading.fontFamily = fontFamily.medium` (unchanged) | 0 | PASS |
| 13 | Label letter-spacing | ≈0 (spec-accepted, not reliably distinguishable) | `type.heading.letterSpacing = -0.2` (unchanged, pre-accepted) | within spec tolerance | PASS |
| 14 | Label color | `text.inverse` | See row 9 | 0 | PASS |
| 15 | Enabled — fill opacity | 100% opaque | Confirmed opaque gradient at every sampled stop, no background bleed | 0 | PASS |
| 16 | Enabled — label opacity | 100%, `text.inverse` | Confirmed (no opacity style applied on enabled path) | 0 | PASS |
| 17 | Disabled — fill opacity | ≈10% (−90% vs enabled) | `styles.disabledFill = { opacity: 0.10 }` applied to the gradient layer when `disabled` | exact | PASS (code-verified — disabled CTA not on the captured Today/paywall route; `session.tsx`'s `disabled={!canvasReady}` PrimaryButton is the runtime consumer, out of blast radius to screenshot) |
| 18 | Disabled — label opacity | ≈35–40% | `styles.disabledLabel = { opacity: 0.37 }` applied to the label when `disabled` | within range | PASS (code-verified, same note as row 17) |
| 19 | Disabled — geometry | Unchanged pill silhouette, opacity-only change (hairline stroke out of scope per spec) | Same gradient/shape rendered, only opacity toggles | 0 | PASS (code-verified) |
| 20 | Press scale / spring | `pressScale` 0.96 + `motion.spring.press` (VALIDATION.md motion law) | `PressableScale` invoked with `scaleTo={motion.pressScale}` (token, was a magic `0.96` literal — now token-backed); spring hardcoded to `motion.spring.press` inside `PressableScale` | 0 | PASS (code-verified, static PNG can't capture motion per spec's own row 20 note) |
| 21 | Enabled↔disabled transition timing | `ORCHESTRATOR-SETS` — no timing value assigned in VALIDATION.md's motion-rows section for this specific transition | No animated cross-fade added (instant opacity swap on re-render); no orchestrator value exists to implement against | — | PASS (nothing to satisfy beyond the unset placeholder) |

**Summary: 20 PASS / 0 FAIL / 1 N/A (row 4 bottom offset — anchoring owned by each screen's own element agent per orchestrator ruling; `Screen.tsx` untouched).**
