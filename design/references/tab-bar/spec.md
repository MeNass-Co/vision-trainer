# tab-bar — locked spec (Phase 3)
Canvas detected: 1180×2556 px (@3x → 393.3×852 pt). Source PNG is palette-indexed (256 colors) — fine color/alpha reads carry ±5-10 level quantization noise, flagged inline where it matters.

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| **GEOMETRY** |
| 1 | Bar height | 184px / 61.3pt | 61pt fixed height | Vertical scan of top/bottom hairline peaks in tab-gap columns (x=845/860/875), edge at y≈2308 (top) and y≈2492 (bottom) |
| 2 | Bar outer width | 822px / 274.0pt | content-hugging, not fixed — derives from margins below | Horizontal scan at y=2400 (icon row), left edge x≈180, right edge x≈1002 |
| 3 | Bar left margin (screen edge → bar edge) | 180px / 60.0pt | `proposed: space.floatingBarMargin = 60` (no existing token this large; between space.xxl=48 and space.xxxl=64) | Same horizontal scan as #2 |
| 4 | Bar right margin | 178px / 59.3pt | same as #3 (symmetric) | Same horizontal scan as #2, right side |
| 5 | Bar bottom offset from image bottom edge | 64px / 21.3pt — **unmeasurable against true safe-area**: this screenshot has no visible home-indicator/safe-area marker (bottom is a hard crop, "Recommended" content bleeds off-canvas) | `safeAreaBottom + space.sm (8pt)` — engineering default, verify on device | Vertical scan below bar bottom hairline to image edge; flagged, not a reference-anchored measurement |
| 6 | Bar corner radius | ~82px / 27.3pt (rounded rect, NOT full stadium: 2r=164px < bar height 184px, confirmed by a 21px flat vertical section on the left edge between y=2390–2411) | `proposed: radius.floatingBar = 27` (no existing token near this size; radius.lg=14 too small, radius.pill=999 is full-stadium and wrong shape here) | Circle-fit of left-edge x(y) samples every 5px near the top-left corner (y=2310→2415), solved for center+radius, cross-checked against flat-edge asymptote x≈180 |
| 7 | Active pill width | 283px / 94.3pt | 94pt (content-driven per tab; "Home" is shortest label) | Horizontal scan y=2400: pill-fill (73,80,92) stable span x=192→475 |
| 8 | Active pill height | 161.5px / 53.8pt | 54pt | Vertical scan x=330 (clear of icon/label): fill stable y=2319.5→2481 |
| 9 | Active pill corner radius | ~81px / 27.0pt — equals height÷2 (161.5/2=80.75): **confirmed full stadium**, unlike the outer bar | `radius.pill` (999 token, i.e. always-stadium) — exact conceptual match | 3-point circle fit on pill's own left-edge curve (y=2340/2360/2380 → x=220/204/196), converged r≈81-82px matching height/2 |
| 10 | Active pill inset from bar edge (L/T/B, uniform) | ~11px / 3.7pt | `space.xs` (4pt) — closest existing token, near-exact | Compared bar edge vs pill edge at matching y/x: left Δ=12px, top Δ=11.5px, bottom Δ=11px |
| 11 | Icon optical box — active (Home, bullseye) | 69×69px / 23.0×23.0pt | `proposed: icon.tabSize = 23` (square) | Brightness-threshold (lum>150) bbox in region (260,2320)-(420,2420) |
| 12 | Icon optical box — inactive (Discover, magnifier) | 66×66px / 22.0×22.0pt | 23pt (same box as active — see Q13) | Brightness-threshold bbox, region (500,2320)-(700,2420) |
| 13 | Icon optical box — inactive (You, bar-chart) | 86×62px / 28.7×20.7pt (glyph is wider than tall by design, not a differently-scaled box) | 23pt square box, glyph fills it asymmetrically like reference | Brightness-threshold bbox, region (780,2320)-(970,2420) |
| 14 | Icon size delta active vs inactive | **None found** — all three optical boxes land in the same 62-69px (20.7-23.0pt) band; the active/inactive distinction is glyph *style* (filled bullseye vs outline stroke) and the pill background, not icon scale | No scale delta in our build either — vary fill/stroke style only | Cross-comparison of rows 11-13 |
| 15 | Icon-to-label gap | Home 18px/6.0pt, Discover 21px/7.0pt, You 22px/7.3pt → avg 20px/6.7pt | `proposed: space.tabIconGap = 6` (falls between space.xs=4 and space.sm=8, no exact token) | Icon-bbox bottom (row 11-13) to label-bbox top (row 32), per tab |
| 16 | Inter-tab distribution | Equal thirds. Tab centers (icon+label midpoint) at x=332.5 / 592.5 / 850.0px → Δ=260px, 257.5px (even). Bar interior 822px ÷ 3 = 274px/column | Equal-thirds flex distribution across bar width | Center-of-bbox average of icon+label bounds per tab (rows 11-13, 32-34) |
| **COLOR & GRADIENT** |
| 17 | Background sample A (unoccluded, left gap, x≈440 just above bar) | `#262934` rgb(38,41,52) | n/a (reference-only, for tint solve) | Median 11×11 patch at (440,2298) |
| 18 | Bar fill over sample A (x≈440, in-bar gap) | `#212E3C` rgb(33,46,60) | — | Median 11×11 patch at (440,2470) |
| 19 | Background sample B (unoccluded, right gap, x≈865 just above bar) | `#15242F` rgb(21,36,47) | n/a | Median 11×11 patch at (865,2298) |
| 20 | Bar fill over sample B (x≈865, in-bar gap) | `#192936` rgb(25,41,54) | — | Median 11×11 patch at (865,2470) |
| 21 | Derived bar glass tint + opacity | Two-background alpha-solve is **ill-conditioned** here (samples A/B differ by only 5-17 levels/channel — R-channel solve gives α≈53%, G/B solve is contradictory/negative due to palette quantization noise). Best-effort read: a cool dark-navy tint, roughly `#1C2733` at ~45-55% opacity over the blurred content | `surface.overlay` (#141F22) at ~45% opacity, composited over `material.blurIntensity: 40` backdrop blur — neutral, no hue rotation (see target.md harmony note) | Two-point alpha-blend solve; flagged low-confidence, `material: verify-on-glass` |
| 22 | Bar hairline (top+bottom edge highlight stroke) | Peak `#49505C` rgb(73,80,92) over local bg `#262934` → ≈16-20% white opacity (avg ~18%), present identically at top (y≈2308) and bottom (y≈2492) edges | `material.hairlineOnGlass` (rgba(255,255,255,0.12)) — existing token close-matches, +6pt delta, keep as-is | Alpha-blend solve vs adjacent bar-fill baseline at x=330/440, top and bottom columns |
| 23 | Active pill fill | `#49505C` rgb(73,80,92), flat and consistent across all sampled interior points (280,2325)/(210,2400)/(330,2455) — reads as a solid/near-opaque neutral highlight (its "background" is the glass itself, occluded, so a two-bg opacity solve isn't possible) | `proposed: pillFillOnGlass = rgba(255,255,255,0.10)` layered over the bar's existing blur — keeps material neutral per target.md ("neutral frost keeps the accent in icon/label tint") | Median patch sampling at 3 interior points, all converged on identical value |
| 24 | Active icon color (Home bullseye) | `#F6F7FB` rgb(246,247,251), peak `#FFFEFF` — effectively white | `accent.core` (#5BE9EC) — **hue rotation per carve-out** | Peak-brightness pixel in icon bbox |
| 25 | Inactive icon color (Discover, You) | `#F6F7FB` / `#FFFEFF` — **identical to active icon color**, no reference differentiation by hue | `text.secondary` (#A7B2B4) | Peak-brightness pixel in each icon bbox |
| 26 | Active label color (Home) | White, peak `#FFFEFF` | `accent.core` (#5BE9EC) | Peak-brightness pixel in label bbox |
| 27 | Inactive label color (Discover, You) | White, peak `#F6F7FB` — **identical to active label**, no reference hue split | `text.secondary` (#A7B2B4) | Peak-brightness pixel in each label bbox |
| **MATERIAL** |
| 28 | Blur intensity | Not measurable from a static PNG (per method) — visible tint/opacity captured in rows 17-22 | `material.blurIntensity: 40` (existing token) — `material: verify-on-glass` | N/A — flagged per instructions |
| 29 | Glass corner radius (material token vs measured) | Measured bar radius = 27.3pt (row 6) | `material.radius` token currently = 22 — **mismatch**, recommend bumping to 27 or adding `radius.floatingBar` (row 6) and reserving `material.radius` for other glass surfaces | Cross-ref row 6 against tokens.ts `material.radius` |
| **TYPE** |
| 30 | Label cap-height | Home 21px/7.0pt, Discover 22px/7.3pt, You 21px/7.0pt → avg 21.3px/7.1pt | — | Brightness-threshold bbox height on capital-letter-bearing labels (H/D/Y all reach full cap height) |
| 31 | Derived font size (cap-height ÷ 0.727, Inter/SF cap-height ratio) | ≈9.8pt | `proposed: type.tabLabel.fontSize = 10` (nearest existing token is `type.micro` at 11pt, delta -1.2pt) | Arithmetic from row 30 |
| 32 | Label weight | Moderately thick strokes relative to x-height (zoomed crop of "Home") — reads SemiBold, possibly Bold; cannot fully disambiguate from a single weight sample (no lighter neighbor in this element to compare stroke density against) | `fontFamily.semibold` | Visual stroke-density read on 8× upscaled crop |
| 33 | Label letter-spacing | Tight/neutral by eye; sign not reliably extractable at 21px cap-height from a compressed PNG (kerning pairs indistinguishable from anti-aliasing bleed) | `proposed: tracking = 0` (flag low confidence — nearest token `type.micro` uses +1.4, but visual does not show that much airiness) | Visual read on 8× upscaled crop; low confidence, flagged |
| **SPACING** |
| 34 | Pill-to-bar-edge inset (L/T/B) | 11-12px / 3.7-4.0pt | `space.xs` (4) | See row 10 |
| 35 | Icon-to-label gap | 20px avg / 6.7pt | `proposed: space.tabIconGap = 6` | See row 15 |
| 36 | Bar-top-hairline to icon-top padding | 25.5px / 8.5pt | `space.sm` (8) — near-exact | Bar top hairline y≈2308(#1) to icon bbox top y≈2345-2348 (rows 11-13, avg 2346.5) |
| **STATES** |
| 37 | Active (Home) | Pill background present (row 9/23), icon = filled/solid bullseye glyph, icon+label color = white (row 24/26) | Pill present (`pillFillOnGlass`), icon+label = `accent.core` | Full-tab visual comparison |
| 38 | Inactive (Discover, You) | No pill, icon = outline/line-stroke glyph, icon+label color = white — **same color as active**, differentiated only by pill presence + glyph style | No pill, icon+label = `text.secondary` | Full-tab visual comparison |
| **MOTION** |
| 39 | Active-pill transition on tab switch (slide/morph between tabs) | Not measurable from a static PNG | `ORCHESTRATOR-SETS` | N/A |
| 40 | Tap/press feedback | Not measurable from a static PNG | `ORCHESTRATOR-SETS` (reference available: `motion.pressScale` = 0.96) | N/A |
