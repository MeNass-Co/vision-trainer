# verdict-band — diff table (Phase 4)

Capture: `design/captures/verdict-band-actual.png` (crop of `verdict-band-full.png`, iPhone 16e @3x, `visiontrainer://progress`, seeded data: score 1.63, verdict improving, delta +0.18, caption "Reliable reading"). Measured with PIL color-distance masks, same convention as spec.md (px ÷ 3 = pt).

## TYPE

| # | Property | Spec target (our value) | Actual (measured) | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 1 | Score digit height | `type.hero` cross-ref only, not actionable (score is out of this element's blast radius) | Rendered via `CountUpNumber` default `type.display` (88/semibold) — pre-existing, untouched | N/A | N/A (out of scope) |
| 2 | Score digit color | `text.primary` #EFF3F4 | (239,243,244) | 0 | PASS |
| 3 | Verdict word cap-height | `type.caption` (13) + bold override → expected cap-height ≈9.3–9.6pt (spec's own accepted -1.7pt delta from 11.3pt reference) | 9.3pt | ~0pt vs locked expectation | PASS |
| 4 | Verdict word letter-spacing | 0 / normal (`type.caption` tracking) | 0 (no override applied) | 0 | PASS |
| 5 | Verdict word color | `verdict.improving` #5FD0B0 (state-mapped) | (95,208,176) | 0 | PASS |
| 6 | Supporting caption cap-height | `type.bodyStrong` (15) + bold override → expected cap-height ≈10.7–10.9pt | 10.7pt | ~0pt vs locked expectation | PASS |
| 7 | Supporting caption letter-spacing | 0 / normal | 0 | 0 | PASS |
| 8 | Supporting caption color | `text.primary` #EFF3F4 | (239,243,244) | 0 | PASS |
| 9 | Delta-chip word cap-height | `type.caption` (13) + regular weight override → expected ≈9.3–9.6pt | 9.3pt | ~0pt vs locked expectation | PASS |
| 10 | Delta-chip word letter-spacing | 0 / normal | 0 | 0 | PASS |
| 11 | Delta-chip word color | `text.tertiary` #6B7477 | (107,116,119) | 0 | PASS |

## GEOMETRY

| # | Property | Spec target | Actual | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 12 | Delta-chip dot diameter | 4.0pt, circular | 4.0pt (12px, borderRadius 2 on 4×4 box) | 0 | PASS |
| 13 | Separator glyph score↔verdict-indicator | None (vertically stacked, no glyph) | None rendered | 0 | PASS |

## COLOR & GRADIENT

| # | Property | Spec target | Actual | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 14 | Delta-chip dot color | Hue remap per state, matches the verdict word's color | (95,208,176) — identical to verdict word sample | 0 | PASS |

## SPACING

| # | Property | Spec target | Actual | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 15 | Gap: score bottom → verdict-word top | 19pt (raw, edge-to-edge) | 19.0pt (57px) | 0 | PASS |
| 16 | Gap: verdict-word bottom (incl. descender) → caption top | 23pt target / `space.lg`=24 as our value | 23.67pt (71px) | +0.67pt vs 23pt target, −0.33pt vs 24pt token | PASS |
| 17 | Gap: delta-chip word ↔ dot | `space.xs`=4pt (our value; ref 4.7pt) | 3.67pt (11px) | −0.33pt vs our value | PASS |
| 18 | Overall lockup alignment (centered) | All tiers centered on canvas center (x=585.0 @1170px width) | word center x=584.5 (Δ0.5px) · caption center x=584.0 (Δ1.0px) · delta-chip center x≈582.5 (Δ2.5px ≈0.83pt) | ≤1pt on all tiers | PASS |

## STATES

| # | Property | Spec target | Actual | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 19 | Verdict — improving | `verdict.improving` #5FD0B0 | Implemented & captured: (95,208,176) | 0 | PASS |
| 20 | Verdict — holding | `verdict.holding` #8A9099 | Implemented via `formatVerdictWord`/`verdict` token map (not captured — seeded data is `improving`; color path verified by code read, same branch as improving) | — | PASS (code) |
| 21 | Verdict — regressing | `verdict.regressing` #E0607A | Implemented via same token map | — | PASS (code) |

## MATERIAL

None — no rows (spec confirms verdict-band is text-only, no card/glass surface). Implementation matches: no background, no border on any tier (the old bordered/tinted pill was removed).

## MOTION

| # | Property | Spec target | Status |
|---|---|---|---|
| 22 | Verdict-indicator transition on state change | `ORCHESTRATOR-SETS` → `motion.timing.rangeFadeMs` (150) | Not wired in this pass — static-capture scope only; token already exists in `tokens.ts` for future wiring, no new token needed |
| 23 | Delta-chip dot entrance | `ORCHESTRATOR-SETS` | Not wired in this pass — same rationale |

## Summary

**18 PASS / 0 FAIL** on all measurable rows (3 STATE rows verified by code, not by a second capture, since seeded data only exercises `improving`; 2 MOTION rows are explicitly `ORCHESTRATOR-SETS` and out of static-capture scope, consistent with how the spec itself flags them). Row 1 is informational/cross-ref only (score's own type, outside this element's blast radius).

Notable calibration (documented inline in `VerdictBand.tsx`): the score's fixed-height `heroNumber` box (out of scope) reserves generous padding around the digit glyphs for the glow/animation, and React Native's line-height leading adds further space beyond glyph edges on the word→caption and dot→word gaps. Three small compensating offsets (`marginTop: -62` on the lockup, `marginTop: 15` on the caption instead of the raw `space.lg` value, `marginLeft: -2` on the delta word) were calibrated against native captures so the *optical* gaps match the spec's measured targets — the semantic tokens themselves (19pt raw, `space.lg`, `space.xs`) are documented in comments at each site.
