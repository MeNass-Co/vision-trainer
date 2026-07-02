# paywall — locked spec (Phase 3)
Canvas detected: 1179×2556 px (@3x → 393×852 pt)
Source: Mimo Max paywall, candidate-2 ("Your developer journey starts here"). Page background is a single flat fill `#252746` (no gradient) across the entire canvas — this is also reused as "ink" for dark-on-accent text (see COLOR).
Carve-outs applied (per target.md): ONE plan card (reference has two — Yearly/Monthly — we build one, using the SELECTED/purple visual as our only state baseline), our copy, hue (purple → cyan ladder).
Measurement note: the reference's dark text/glyphs on light-accent surfaces (badge text, radio checkmark) are rendered in the exact page-background hex (`#252746`), which defeats naive background-diff pixel scanning (the "ink" reads as "no difference from bg"). Those rows were re-verified with upscaled ruler-gridded crops per SPEC-INSTRUCTIONS.md — flagged inline as `visually verified`.

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|

## GEOMETRY

| 1 | Top badge slot (headline eyebrow) — reference uses brand wordmark "max", NOT a chip | bbox 96,453–259,496 px → 54.3×14.3pt. No fill/radius/padding exists (logo, not a pill). | Our build needs a real chip here (per anatomy). Re-use the Chip primitive measured in row 2 (same fill/radius/padding/type), sized to our short label text, same slot position. | PIL bbox scan (bg-diff threshold), region 60–400×420–560 |
| 2 | Plan-badge chip ("Most Popular" pill) — canonical Chip primitive | bbox 108,1799–409,1857 px → width 100.3pt, height 19.3pt | radius.pill (fully-rounded, r=height/2 ≈ 9.7pt); width sized to our label + padding (row 10) | Ruler-gridded crop, visually verified (bg-diff scan under-measured this at 33px due to same-color-as-bg text — corrected) |
| 3 | Checkmark glyph (feature rows) | bbox 42×29 px → 14.0×9.7pt | 14×10pt glyph box, same aspect | PIL bbox scan on row 1, x85–175 |
| 4 | Feature-row pitch (checkmark row 1→2→3→4 top-to-top) | 96, 96, 97 px → 32.0, 32.0, 32.3pt (avg 32.1pt) | space.xl-ish repeat unit ≈ 32pt (no exact token; closest is space.xl=32, Δ0) | Row-band scan (horizontal content profile), 4 bands found: y 922–955 / 1018–1051 / 1114–1147 / 1211–1242 |
| 5 | Checkmark-glyph → text horizontal gap | 32 px → 10.7pt | space.md(12) Δ+1.3, or propose `proposed:space.checkGap=11` | check right edge x148 → text left edge x180 |
| 6 | Plan card (SELECTED, "Yearly") outer bbox | 81,1842–557,2161 px (border-to-border) → width 158.7pt, height 106.3pt | Carve-out: ONE card spans content width. Recommend width = screen width − 2×26pt margin ≈ 341pt (matching CTA's margin below it), height unchanged 106pt | Vertical/horizontal border transition scan at y=1950 (x-edges) and x=300/850 (y-edges) |
| 6b | Plan card (UNSELECTED, "Monthly") outer bbox — reference only, not built (count carve-out) | 623,1842–1098,2160 px → width 158.3pt, height 106.3pt | N/A — not built; kept for border/color contrast reference only | Same method as row 6 |
| 7 | Plan card corner radius | ≈27 px → 9.0pt (measured via corner-curve departure-from-straight, both left-edge and top-edge give 23–31px) | radius.md(10) Δ−1.0pt | Per-row leftmost-border-x scan from y1840→1874 (corner curve) at card 1 top-left |
| 8 | Plan card border width | 3 px → 1.0pt (both states) | hairline.px1(1) Δ0 | Column/row transition width at clean border segments |
| 9 | Selection radio / check indicator diameter | 59 px → 19.7pt (both states, identical size) | 20pt circle | bbox scan x458–517×1893–1952 (selected) and x999–1058×1893–1952 (unselected) |
| 10 | Plan-badge chip padding | Horizontal: left ~13pt / right ~9.7pt (asymmetric in ref — likely a ref authoring quirk). Vertical: top ~5.7pt (chip-top→cap-top), bottom near-zero (descender nearly touches chip edge). | Recommend clean symmetric padding for our build: space.md(12) horizontal, space.xs+2≈6pt vertical | Ruler-gridded crop, visually verified |
| 11 | CTA button bbox | 78,2236–1100,2369 px → width 340.7pt, height 44.3pt, margins 26.0pt / 26.3pt (near-symmetric) | Cross-check vs primary-button spec — flag delta only: height 44.3pt vs typical 48–52pt primary buttons is notably shorter; corner radius below is also flatter than a typical pill CTA | Flat-fill scan (color-match to `#8D60E2`) at center row/column |
| 12 | CTA corner radius | ≈27–29 px → 9.2pt (same method as row 7; matches plan-card radius almost exactly — a real design-system finding, not coincidence) | radius.md(10) Δ+0.8pt — **use the SAME token as plan card (row 7) to preserve this reference's card/button radius unity** | Corner-curve departure-from-straight scan, CTA top-left |

## COLOR & GRADIENT
No gradients anywhere in this reference — every fill is flat. Hue column = purple source; ours = cyan ladder per tokens.ts.

| 13 | Page / card fill background | `#252746` (flat, no gradient; plan card fill is IDENTICAL to page bg — border-only card, no distinct card surface) | `surface.base` (#080A0D) — structure preserved (card fill = page canvas, zero elevation) | Corner-pixel sample + card-interior sample (300,2000 etc.), exact match to bg |
| 14 | Checkmark glyph / selected border / badge fill / selected-radio fill (ONE shared accent tint) | `#B89CED` | `accent.core` (#5BE9EC) — same role: the "light/active" tint used across small indicators | Color histogram, checkmark glyph region + badge fill + border pixels |
| 15 | CTA fill (saturated accent, distinct from #B89CED) | `#8D60E2` | `accent.default` (#33D2D6) — the more saturated tone reserved for the primary action surface | Color histogram, CTA fill flat region |
| 16 | Unselected border / unselected radio ring | `#3F4273` (low-saturation blue-grey, no accent hue) | `surface.hairlineStrong` (#28363A) — this is a structural hairline, not an accent-dimmed state | Column/row transition sampling, card2 borders + radio2 ring |
| 17 | "Ink" on light-accent fills (badge text, selected-radio checkmark) | `#252746` (= exact page-bg hex, reused as dark text) | `text.inverse` (#08161A) — token built exactly for this role | Ruler-verified; matches bg sample bit-for-bit |
| 18 | Headline / plan-title / CTA-label text | `#FFFFFF` | `text.primary` (#EFF3F4) Δ minor (ref is pure white, ours is near-white) | Color histogram, headline + "Yearly"/"Monthly" + CTA label regions |
| 19 | Feature-row text / price text / "Plus full access…" caption | `#D3D4DA` | No close token — `text.secondary` (#A7B2B4) is ~44 luminance units darker. **Propose `proposed:text.secondaryBright = #C9D6D7`** (cyan-cooled, luminance-matched to ref) | Color histogram, feature row 1 + price line + plus-caption |
| 20 | "Billed at…" caption | `#A5A5B4` | `text.secondary` (#A7B2B4) — near-exact match, Δ~2-13 units | Color histogram, billed-caption band |
| 21 | Legal caption ("Cancel anytime…") | `#B9BBD0` | `text.secondary` (#A7B2B4) Δ~+20, acceptable; or use proposed row 19 token Δ~-25 | Color histogram, legal caption band |

## MATERIAL
| 22 | Card / button / sheet material | No blur, no glass, no elevation shadow anywhere in this reference — every surface is a flat fill or a stroked outline on the same flat bg. | N/A — confirms our paywall should stay flat too; do not introduce `material.blurIntensity` glass here. | Full-canvas visual scan; no gradient/blur falloff detected at any edge |

## TYPE
(cap-height based estimates, font-size ≈ cap-height ÷ 0.72; nearest token from `src/theme/tokens.ts` `type` ramp, delta stated)

| 23 | Headline (2 lines) | cap-height 19.7pt → est. 27.4pt; line pitch 31.7pt; color #FFFFFF | `type.title` (28/34/−0.4) Δ size −0.6pt, Δ line-height −2.3pt; weight bold | "Y" isolated glyph bbox, line1 |
| 24 | Feature-row text / "Plus full access…" | cap-height 11.0pt → est. 15.3pt | `type.body`/`type.bodyStrong` (15/24/0) Δ+0.3pt; weight regular | Digit "1" (row1) and "P" (plus-line) isolated glyph bbox |
| 25 | Plan-badge chip label ("Most Popular") | cap-height ~10.0pt → est. 13.9pt | `type.caption` (13/18/0) Δ+0.9pt; weight semibold/bold by stroke density | Ruler-verified "M" cap height |
| 26 | Plan-card title ("Yearly"/"Monthly") | cap-height 11.0–11.3pt → est. 15.3–15.7pt | `type.bodyStrong` (15/24/0) Δ+0.5pt; weight bold (heavier stroke than row 24) | "Y"/"M" isolated glyph bbox, both cards |
| 27 | Plan-card price ("$24.92/mo") | cap-height ~10.0pt (digit) → est. 13.75pt | `type.caption` (13/18/0) Δ+0.75pt; weight medium | Digit "2" isolated glyph bbox |
| 28 | "Billed at…" caption | cap-height ~8.3pt → est. 11.5pt | `type.micro` (11/15/1.4) Δ+0.5pt — note ref has letter-spacing ≈0, ours is +1.4, flag as intentional deviation not a defect | "B" isolated glyph bbox |
| 29 | CTA label ("Upgrade to Max") | cap-height 16.3pt → est. 22.6pt | Between `type.heading`(20,Δ+2.6) and `type.title`(28,Δ−5.4) — **no clean token match; cross-check note: this is notably larger than our primary-button label typically runs.** Recommend heading(20) and accept the button reading slightly smaller than reference, OR propose `proposed:type.ctaLabel = {fontSize:22, lineHeight:26, letterSpacing:-0.2}` | "U" isolated glyph bbox |
| 30 | Legal caption | cap-height ~8.7pt → est. 11.9pt | `type.micro` (11) Δ+0.9pt | "C" isolated glyph bbox |

## SPACING
| 31 | Left content margin (headline/features/badge) | 96–99 px → 32.0–33.0pt | space.xl(32) Δ0 | bbox left-edge across wordmark, headline, feature text, plus-caption |
| 32 | Left/right margin (plan card, both states) | 81px / (393−366)=27pt right → 27.0pt both sides | space.lg(24) Δ+3.0pt, or propose `proposed:space.cardMargin=27` | Card outer bbox vs canvas width |
| 33 | Left/right margin (CTA button) | 78px / 79px → 26.0pt / 26.3pt (symmetric) | space.lg(24) Δ+2.2pt | CTA flat-fill x-extent vs canvas width |
| 34 | Gap: badge(wordmark)-bottom → headline-top | 68 px → 22.7pt | space.lg(24) Δ−1.3pt | wordmark bbox bottom (496) → headline bbox top (564) |
| 35 | Gap: headline-bottom → first checkmark row | 184 px → 61.3pt | space.xxl(48)+space.md(12)≈60, Δ+1.3pt | headline line2 bottom (737) → row1 top (921) |
| 36 | Gap: last checkmark row → "Plus full access…" caption | 110 px → 36.7pt | space.xl(32)+space.xs(4)=36, Δ+0.7pt | row4 bottom (1242) → plus-caption top (1352) |
| 37 | Gap: plan-card bottom → CTA top | 76 px → 25.3pt | space.lg(24) Δ+1.3pt | card border bottom (2160) → CTA flat-fill top (2236) |
| 38 | Gap: CTA bottom → legal caption top | 51 px → 17.0pt | space.lg(24) Δ−7.0pt, or `proposed:space.legalGap=17` | CTA flat-fill bottom (2369) → legal bbox top (2420) |
| 39 | Plan-card internal padding, left (border → title text) | 39 px → 13.0pt | space.md(12) Δ+1.0pt | card1 left border (81) → title bbox left (120) |
| 40 | Plan-card internal padding, top (border → title text, unselected/no-badge case) | 63 px → 21.0pt (card1, badge-cleared); card2 (no badge): border-top(1842)→title-top(1905)=63px=21.0pt too — consistent regardless of badge | space.xl(32)−space.sm(8)... nearest single token `space.lg`(24) Δ−3.0pt | card2 top border (1842) → title bbox top (1905) |
| 41 | Plan-card internal gap: title → price | 19 px → 6.3pt | space.sm(8) Δ−1.7pt | title bottom (1947) → price top (1966) |
| 42 | Plan-card internal gap: price → "Billed at…" | 79 px → 26.3pt | space.xl(32) Δ−5.7pt, or `proposed:space.cardPriceGap=26` | price bottom (2005) → billed top (2084) |
| 43 | Plan-card internal padding, bottom (billed caption → border) | 40–43 px → ~13.7pt | space.md(12) Δ+1.7pt | billed bottom (2118–2121) → card bottom border (2160) |

## STATES
| 44 | Plan card — SELECTED | border `#B89CED`→accent.core, 1.0pt; radio filled `#B89CED` with `#252746`(→text.inverse) checkmark glyph; "Most Popular" badge present | Only state our single card ships with by default | Border/fill color sampling, card1 |
| 45 | Plan card — UNSELECTED (reference-only, not built per carve-out) | border `#3F4273`→surface.hairlineStrong, 1.0pt; radio = empty ring, same stroke color, no fill; no badge | Not built — logged so a future multi-plan revision doesn't need to re-measure | Border/fill color sampling, card2 |
| 46 | Radio indicator — selected vs unselected | Selected: solid disc + dark check glyph. Unselected: 1px ring only, no fill, no glyph. Same 19.7pt diameter both states. | Match both states 1:1, only recolor per row 14/16 | bbox + color sampling, both circles |

## MOTION
| 47 | Plan-card selection transition (border/radio swap) | Not measurable from static PNG | `ORCHESTRATOR-SETS` | — |
| 48 | Checkmark-row entrance / stagger | Not measurable from static PNG | `ORCHESTRATOR-SETS` | — |
| 49 | CTA press feedback | Not measurable from static PNG | `ORCHESTRATOR-SETS` | — |
| 50 | Badge chip entrance | Not measurable from static PNG | `ORCHESTRATOR-SETS` | — |
