# verdict-band — locked spec (Phase 3)

Canvas detected: 1179×2556 px (@3x → 393×852 pt) — target.png (Oura Readiness "85 · Optimal", candidate-5)
Secondary canvas: 1179×2556 px (@3x → 393×852 pt) — candidate-2.png (Eight Sleep "Out of range"), used ONLY for the dot+word delta-chip treatment per target.md carve-out.

Anatomy mapped: Oura's stacked "85 → Optimal" lockup = our "score → verdict indicator" lockup. The verdict-indicator slot in our build is the delta chip (colored dot + word), built from Eight Sleep's inline dot+word treatment but vertically stacked like Oura's, and colored via our `verdict.*` tokens (hue remap — Oura's own word renders plain white here, color is our carve-out, not copied). The line "Up for something fun?" is the nearest analog to our supporting caption (single short line, directly beneath, before any longer body copy — the longer paragraph under it is a separate insight-card element, out of scope for verdict-band).

All type "size" values are cap-height-derived (bounding box of a pure capital letter or digit, px÷3, one decimal), per SPEC-INSTRUCTIONS.md — compared directly against `type.*` nominal fontSize as this repo's established convention (confirmed self-consistent: measured score cap-height 46.0pt vs `type.hero` fontSize 47 = 1.0pt delta).

## TYPE

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| 1 | Score "85" digit height | 138px → 46.0pt, weight ≈ Regular (thin uniform stroke) | `type.hero` (47/bold/-1.9 tracking) — **cross-ref only**, already locked app-wide for our "1.63"; delta 1.0pt, weight mismatch (ref Regular vs our Bold) noted but not actioned | PIL bbox of "8"+"5" glyphs, x400–800 y815–965, mask maxc>200 & sat<30, digit-box height = 822–959px |
| 2 | Score digit color | #F2F3F5 (242,243,245) | `text.primary` (#EFF3F4) — near-exact match, no remap needed | Sampled inside "8" stroke mask pixels |
| 3 | Verdict word "Optimal" cap-height | 34px → 11.3pt, weight ≈ Bold (thick uniform stroke, stroke/cap-height ratio 0.18 vs digit's 0.13) | `type.caption` (13/medium/0 tracking) **with weight override → bold**; delta −1.7pt. Rejected `type.micro` (11/semibold/tracking 1.4) despite closer size (+0.3pt) because reference tracking is tight/normal (~0), not micro's wide +1.4 — tracking match outweighs the smaller size delta | PIL bbox of capital "O" only (x502–531), mask maxc>200 & sat<30, y1017–1050 |
| 4 | Verdict word letter-spacing | ≈0 (measured inter-letter gaps 4–8px at ~11pt cap-height = normal kerning, no added tracking) | 0 / normal — matches `type.caption` tracking exactly (not `type.micro`'s +1.4) | Column-gap segmentation of "O-p-t-i-m-a-l" |
| 5 | Verdict word color (reference) | #F2F3F5 (242,243,245) — plain white in this reference, NOT color-coded here | Hue remap per carve-out → `verdict.improving` #5FD0B0 / `verdict.holding` #8A9099 / `verdict.regressing` #E0607A (see STATES) | Sampled inside "O" stroke mask; reference does not encode verdict via hue, we deliberately add it per target.md |
| 6 | Supporting caption ("Up for something fun?" analog) cap-height | 48px → 16.0pt, weight ≈ Bold (thick uniform stroke, ratio 0.17) | `type.bodyStrong` (15/medium/0 tracking) **with weight override → bold**; delta −1.0pt (closest fit of the ramp) | PIL bbox of capital "U" only (x253–289), mask maxc>190 & sat<30, y1127–1174 |
| 7 | Supporting caption letter-spacing | ≈0 (normal kerning) | 0 / normal — matches `type.bodyStrong` tracking exactly | Column-gap segmentation of "U-p" |
| 8 | Supporting caption color | #F2F3F5 (242,243,245) | `text.primary` (#EFF3F4) — near-exact match, no remap needed | Sampled inside "U" stroke mask |
| 9 | Delta-chip word "Out of range" cap-height (secondary source, candidate-2) | 30px → 10.0pt, weight = Regular (thin uniform stroke, visually confirmed via 8x zoom crop) | `type.caption` (13/medium/0 tracking); delta −3.0pt. Weight override → regular (matches reference, no bold) | PIL bbox of capital "O" (x473–501), mask brightness>40, y1081–1110, candidate-2.png |
| 10 | Delta-chip word letter-spacing | ≈0 (normal kerning) | 0 / normal — matches `type.caption` tracking | Column-gap segmentation of "Out" |
| 11 | Delta-chip word color | #5A5B5D (90,91,93) — neutral grey, no hue tint | No existing sibling matches (text.secondary #A7B2B4 too light, text.muted #6E827F has a green tint absent from reference) → **proposed: text.tertiary: #6B7477** (neutral grey, luminance-matched) | Sampled inside "O" stroke mask, candidate-2.png |

## GEOMETRY

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| 12 | Delta-chip dot diameter (secondary source, candidate-2) | 12px → 4.0pt, circular | 4pt diameter — no existing size token for a dot this small; use raw pt value | PIL bbox of dot blob, x695–706 y1091–1102, candidate-2.png, mask brightness>40 |
| 13 | Separator glyph between score and verdict indicator | **Not present** in target.png — Oura stacks score/word vertically, no "·" or dot inline between them | N/A — our lockup is likewise vertically stacked (score → verdict indicator → caption); no separator glyph needed at this junction | Visual + mask inspection of y959–1017 gap band: zero foreground pixels |

## COLOR & GRADIENT

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| 14 | Delta-chip dot color (secondary source, candidate-2) | #FB5AAE (251,90,174) — pink, encodes "out of range" (negative) state | Hue remap per state, sharing the verdict word's color (dot and word always match): `verdict.improving` #5FD0B0 / `verdict.holding` #8A9099 / `verdict.regressing` #E0607A | Sampled dot centroid pixel, candidate-2.png |

## SPACING

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| 15 | Gap: score bottom → verdict-indicator top | 58px → 19.3pt (digit-box bottom y959 → "O" cap-top y1017) | 19pt (no exact `space` token; nearest is `space.lg` 24 or raw 19pt — use raw 19pt, closer to source than rounding to lg) | Edge-to-edge PIL bbox measurement, target.png |
| 16 | Gap: verdict-indicator bottom → caption top | 68px → 22.7pt (full "Optimal" bbox incl. descender, bottom y1059 → "U" cap-top y1127) | 23pt (nearest existing token `space.lg` 24, delta −1pt; close enough to use `space.lg` directly) | Edge-to-edge PIL bbox measurement, target.png |
| 17 | Gap: delta-chip word → dot (secondary source, candidate-2) | 14px → 4.7pt ("e" of "range" ends x681, dot starts x695) | `space.xs` (4) — delta −0.7pt, closest existing token | Column-gap measurement, candidate-2.png |
| 18 | Overall lockup alignment | Centered — score center x589.5, verdict-word center x589.5, caption center x590.5, vs. canvas center x589.5 (all within 1px) | Centered (textAlign: center, all three tiers) | x-center of each element's PIL bbox vs. canvas width/2 |

## STATES

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| 19 | Verdict indicator — improving state | Not shown in reference (reference shows one static "Optimal"/white state) | Word + dot color: `verdict.improving` #5FD0B0 | Inferred — reference has no state variation; color per our token set |
| 20 | Verdict indicator — holding state | Not shown in reference | Word + dot color: `verdict.holding` #8A9099 | Inferred |
| 21 | Verdict indicator — regressing state | Reference dot (candidate-2, "Out of range") is the closest visual analog to a negative/regressing state | Word + dot color: `verdict.regressing` #E0607A | Inferred, informed by candidate-2's pink "out of range" dot role |

## MATERIAL

None — verdict-band is a text-only lockup (no glass/blur surface of its own in either reference; both sit on a photo background / plain dark background respectively, not a material this element owns). No rows.

## MOTION

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| 22 | Verdict-indicator color/word transition (on state change) | Not measurable from a static PNG | ORCHESTRATOR-SETS | N/A |
| 23 | Delta-chip dot entrance | Not measurable from a static PNG | ORCHESTRATOR-SETS | N/A |

## Not measured / N/A summary
- Row 13 (separator glyph): confirmed absent in the primary reference — not a measurement gap, a real "no" answer.
- Rows 19–21 (STATES): reference shows only one static state; colors are carried in directly from `verdict.*` tokens, not measured from pixels.
- Rows 22–23 (MOTION): unmeasurable from static PNGs per SPEC-INSTRUCTIONS.md, correctly emitted as `ORCHESTRATOR-SETS`.
- No corner-radius/shadow/blur rows: verdict-band has no card geometry of its own in either reference.
