# slider — locked spec (Phase 3)
Canvas detected: 1179×2556 px (@3x → 393.0×852.0 pt) — source: Philips Hue "Fade duration" sheet, `target.png`

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| **GEOMETRY** |
| 1 | Track height | 24px / 8.0pt | 8.0pt | Vertical scan at x=100 (non-thumb region): fill color from y1581–1604 = 24px band |
| 2 | Track corner radius | 12px / 4.0pt (full pill, r = h/2) | 4.0pt (pill, r = h/2) | Left-cap offset test: at dy=7px from track center, left edge retreats 2–3px, matching r=12px circular cap (12−√(144−49)=2.25px) |
| 3 | Track total length (between insets) | 1059px / 353.0pt | 353.0pt (screen width − 2×20.0pt margin) | Left content edge x=60 → right content edge x=1119 |
| 4 | Track side margins (screen-edge → track end) | 60px / 20.0pt each side | 20.0pt (between `space.base`=16 and `space.lg`=24, no exact sibling; delta +4.0/−4.0pt) | x=60 (left) and 1179−1119=60 (right), symmetric |
| 5 | Thumb diameter | 48px / 16.0pt | 16.0pt | Horizontal scan at track mid-y (y1592): white span x566–613 = 48px; vertical scan at thumb center x590: white span y1569–1616 = 48px (circle confirmed, both axes equal) |
| 6 | Thumb-to-track overhang (top + bottom, each side) | 12px / 4.0pt per side | 4.0pt per side | Thumb vertical span (1569–1616, 48px) minus track vertical span (1581–1604, 24px) → 12px clearance top and bottom |
| 7 | Fill-edge-to-thumb-center gap (structural quirk) | ~53px / 17.7pt (fill hard-stops at 45% of track length while thumb sits at 50% = current value) | Preserve: fill terminates ~1 thumb-radius short of thumb center, exposing a sliver of unfilled track before the thumb (not flush) | Fill→unfilled transition at x=535–537; thumb center at x=589.5; track 0–100% = x60–1119, value 30/60=50% → thumb correctly at 50%, but fill only reaches 45% |
| **COLOR & GRADIENT** (fill, sampled every 5% of the filled segment, x60→x536) |
| 8 | Fill stop A — 0–33% (origin / brightest) | `#0960DC` rgb(9,96,220) · relLum 0.136 · HLS(h215.3°, l44.9%, s92.1%) | `#5BE9EC` = `ACCENT_CORE` exactly (f=1.0 on SOFT→CORE ladder) | Sampled x60→x218 at y1585/1592/1600, flat plateau confirmed across all 3 rows |
| 9 | Fill stop B — 33–67% (mid) | `#1953A6` rgb(25,83,166) · relLum 0.092 · HLS(h215.3°, l37.5%, s73.8%) | `#23D2D6` (f=0.49 interpolation; ≈ `accent.default` `#33D2D6`, Δl −3.3pp/Δs +5.6pp) | Sampled x226→x378, plateau confirmed at 3 rows |
| 10 | Fill stop C — 67–100% (near thumb / dimmest) | `#294772` rgb(41,71,114) · relLum 0.062 · HLS(h215.3°, l30.4%, s47.1%) | `#1E8C8F` = `ACCENT_SOFT` exactly (f=0.0 on ladder) | Sampled x384→x534, plateau confirmed at 3 rows |
| 11 | Stop transition style | Hard steps, dithered/AA transition band only 2–6px (~0.7–2.0pt) wide — NOT a smooth per-pixel interpolation, a genuine 3-band luminance ramp at constant hue (215.3° throughout) | Reproduce as 3 discrete color bands (or a `linear-gradient` with hard color-stops at 0%/33%/33%/67%/67%/100%, no soft blend) | Pixel-by-pixel transition scan at y1585/1592/1600 (see rows 8–10) |
| 12 | Fill opacity | 100% (solid; no background bleed-through detected at any stop) | 100% | Same-hue, same-plateau readings across 3 independent scanlines rule out alpha blending |
| 13 | Unfilled track color | `#37393E` rgb(55,57,62) · HLS(h222.9°, l22.9%, s6.0%) — near-neutral | `surface.hairlineStrong` `#28363A` (HLS l19.2%, s18.4%) — nearest sibling, Δl −3.7pp; no exact match, closest structural grey | Sampled x800 (unfilled zone) and x548–630 flanking thumb, consistent |
| 14 | Unfilled track opacity | 100% (solid fill, not a translucent overlay — no variance found against the single available background) | 100% | Only one background context available in reference; flat color confirmed across full unfilled span x537–1119 |
| **MATERIAL** |
| 15 | Track/thumb material | N/A — both are flat opaque fills, no blur/glass material present on this element | N/A | No translucency detected: track and thumb sit on solid sheet background (#24262A/#36382A2A i.e. `#242628` visually, no blur halo) |
| **TYPE** — value-header row (label left, value right) |
| 16 | Label text ("FADE FOR" / "ENDS AT") — case & tracking | ALL CAPS, wide positive letter-spacing (visually tracked ~4–5px between glyphs at 3x) | `type.micro` (`fontSize:11, letterSpacing:1.4, semibold`) | Cap-height of "F" stem = 21px/7.0pt (y1407–1427); est. fontSize ≈ capHeight/0.72 ≈ 9.7pt; nearest token `micro` (11pt, Δ−1.3pt) beats `caption` (13pt, Δ−3.3pt) — tracking pattern also matches `micro`'s letterSpacing over `caption`'s 0 |
| 17 | Label text color | `#BDBEBF` rgb(189,190,191) | `text.secondary` `#A7B2B4` (Δ RGB-dist 27.4, label ref is slightly lighter) | Peak pixel sample inside "F" glyph stem, y1415 |
| 18 | Value text ("30 min" / "10:30 PM") — weight | Digit height 35px/11.67pt; solid, high-density strokes (no visible thin gaps in stem) → bold/semibold weight class | `type.bodyStrong`-class weight (medium/semibold), size between `body`/`bodyStrong` (15pt, Δ+1.2pt) and `heading` (20pt, Δ−3.8pt) — closer to `bodyStrong`; est. fontSize ≈ 16.2pt (capHeight/0.72) | Digit "3" of "30": full-ink scan y1445–1479 = 35px |
| 19 | Value text color | `#FFFFFF` pure white | `text.primary` `#EFF3F4` (Δ RGB-dist 22.8, near-identical) | Peak pixel sample inside "3" glyph, y1460 |
| 20 | Row structure (carve-out per target.md) | Reference shows TWO label/value columns ("Fade for / 30 min" left, "Ends at / 10:30 PM" right) sitting above the track | OUR build: ONE label-left / value-right row only (Dim/50%/Bright endpoint labels carve-out replaces the 0–60 ruler, per target.md — declared omission, not spec'd) | Column bounding boxes: left col x211–380 (label) / x220–369 (value); right col x812–958 (label) / x784–986 (value) |
| **SPACING** |
| 21 | Label row → value row gap | Label bottom y1428 → value top y1444 = 16px/5.3pt | 5.3pt | Row band detection (content bbox scan) |
| 22 | Value row → track top gap | Value bottom y1479 → track top y1581 = 102px/34.0pt | 34.0pt | Row band detection |
| 23 | Track side margins | (see row 4) 20.0pt each side | 20.0pt | — |
| **STATES** |
| 24 | Visible state in reference | Exactly ONE: at-rest, value set (30/60 = 50%), thumb neutral/undragged — no pressed, dragging, focus-ring, or disabled rendering present anywhere in the source PNG | Default/enabled state only; pressed/dragging/disabled = `ORCHESTRATOR-SETS` (not measurable from a static screenshot) | Full-image inspection confirms single slider instance, single value, no secondary artifacts (rings, halos, alternate thumbs) |
| **MOTION** |
| 25 | Thumb drag response spring | Not measurable from PNG | `ORCHESTRATOR-SETS` | — |
| 26 | Fill redraw/transition timing | Not measurable from PNG | `ORCHESTRATOR-SETS` | — |
| 27 | Haptic tick on drag | Not measurable from PNG | `ORCHESTRATOR-SETS` | — |
| **SHADOW (thumb)** |
| 28 | Thumb shadow color/opacity | Black, alpha ramping ~0.55 (contact, y1617) → ~0.32 (y1618–1625) → 0 (y1626); computed via `alpha = 1 − (shadowChannel/bgChannel)` against bg `#24262A` | `rgba(0,0,0,0.45)` → `rgba(0,0,0,0.20)` falloff (or platform shadow: color `#000000`, opacity 0.30, matching mid-band) | Vertical scan at thumb center x590, y1617–1626 |
| 29 | Thumb shadow blur | ~8px / 2.7pt fade distance from thumb edge to background | 2.7pt blur radius | Same scan — shadow fades over 9 rows before matching bg exactly |
| 30 | Thumb shadow offset | ~0px horizontal, ~0–1px vertical (contact shadow, begins immediately at thumb's bottom edge, no gap) | offset (0, 0.3pt) | No shadow detected above thumb (y1555–1568 = pure bg) or beside thumb at mid-height (x548–564 and x614–630 = pure unfilled-track grey, no darkening) → confirms downward-only contact shadow, zero lateral spread |

## Rows not measurable
- Rows 25–27 (motion/spring/haptics): static PNG cannot reveal timing/easing — flagged `ORCHESTRATOR-SETS` per instructions.
- Row 15 (material): genuinely N/A for this element — no blur/glass surface present, not a measurement gap.

## Proposed tokens
None required — every color row resolved to an existing token (`ACCENT_CORE`, `accent.default`, `ACCENT_SOFT`, `surface.hairlineStrong`, `text.secondary`, `text.primary`) with deltas stated where inexact.
