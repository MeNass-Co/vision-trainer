# modal-sheet — locked spec (Phase 3)
Canvas detected: 1180×2556 px (@3x → 393.3×852 pt)
Source: `target.png` — Apple Weather, Visibility detail sheet (candidate-1, per `target.md`)
Carve-outs applied (from target.md): sheet tint = our hue, content = ours. The ghost "Daily Summary" text visible behind the title (a mid-transition artifact of the previous sheet fading out) is NOT part of the static design and is excluded from every row below.

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|

**GEOMETRY**
| 1 | Sheet top corner radius (both corners) | 105.6px → 35.2pt | `proposed:radius.sheet = 36` (no existing token near 35pt; `radius.lg`=14, `material.radius`=22 both too small) | Algebraic circle fit (least-squares) over 29 edge points from column-scan of top-left corner (edge = first non-background pixel per x, x=2→106); fit residual small, center≈(107.6,315.1), r=105.6px |
| 2 | Sheet side edges | Full-bleed, 0px inset left/right at y=800 (post-corner) | Same — full-bleed | Row scan at y=800: x=0 and x=1179 both sheet-fill color, no margin |
| 3 | Grabber (drag handle) | Not present — no bar above the title row | Not present | Visual inspection of top strip (y 140–260 crop); title row sits directly under the rounded top edge with no handle glyph |
| 4 | Close-button chip diameter | 130–132px → 43.7pt (≈44pt) | 44pt fixed size (no radius/size token matches; treat as new constant) | Bounding-box mask (fill-color match ±12 units + bright-pixel union for the glyph) inside chip region; width and height both ≈130px |
| 5 | Chip top inset (sheet top edge → chip top edge) | 207px → 256px = 49px → 16.3pt | `space.base` (16) — Δ+0.3pt | Column scan x=1065: sheet-fill starts y=207 (flat edge), chip-fill starts y≈256 |
| 6 | Chip right inset (sheet right edge → chip right edge) | 1180px − 1131px = 49px → 16.3pt | `space.base` (16) — Δ+0.3pt | Row scan y=321: chip right edge ≈x=1131 |
| 7 | X icon bounding box | 50×49px → 16.7×16.3pt (square) | 17pt icon (SF Symbol–scale) | Bright-pixel (min channel >180) bounding box inside chip region |
| 8 | X icon stroke weight | Horizontal run 9px at 3 rows (45° diagonal) → perpendicular = 9×cos45° = 6.4px → 2.1pt | `proposed:iconStroke.medium = 2` (no stroke-weight token exists) | Contiguous bright-run length measured at y=300/305/310, converted to true stroke width via ×cos(45°) |
| 9 | Title row group (eye icon + "Visibility") horizontal center | Group bbox x 434–750, center x=592 vs canvas center 590 (Δ2px) | Centered on sheet width | Bright-mask bbox of icon+text (x-range 0–990, excludes chip) vs canvas width/2 |
| 10 | Title row / chip vertical alignment | Chip center y≈320; title glyph-group center y≈321–324 | Aligned on one row | Bbox centers compared: chip (256–385)→320.5; icon (295–348)→321.5; text (301–348)→324.5 |
| 11 | Eye icon bbox | 86×53px → 28.7×17.7pt | ≈29×18pt icon | Bright-mask bbox, x 434–520, y 295–348 |
| 12 | Icon-to-title text gap | 541−521=20px → 6.7pt | `space.sm` (8) — Δ−1.3pt | Column-brightness gap scan between icon bbox and text bbox |
| 13 | Content-card corner radius (all 4 corners) | 65.8px → 21.9pt | `material.radius` (22) — exact match | Algebraic circle fit over 29 edge points from top-left corner of first card (x=50→106) |
| 14 | Content-card left/right inset from sheet edges | 48px each side → 16.0pt | `space.base` (16) — exact | Row scan y=480: card fill spans x=48→1131 (1180−1131=49≈48) |
| 15 | Gap: title-text bottom → first card top | 364−348=16px → 5.3pt | `space.xs` (4) — Δ+1.3pt (tightest gap in the sheet) | Column scan x=200: card fill begins y=364; title text bbox bottom (incl. descender) = 348 |
| 16 | Card internal text inset — left | 99−48=51px → 17.0pt | `space.base` (16) — Δ+1.0pt | Leftmost bright pixel (row band y400–470) minus card left edge (48) |
| 17 | Card internal text inset — top | 421−364=57px → 19.0pt | `space.base` (16) — Δ+3.0pt (between base and lg/24) | Topmost bright pixel (threshold >150, y364–480) minus card top edge (364) |

**COLOR & GRADIENT**
| 18 | Sheet background fill | `#1E1B20` (30,27,32) — flat, zero variance across 12+ interior samples (x=80/300/590/900/1100 at multiple y) | `proposed:surface.sheet = #1B2225` — hue-rotated to our cool cyan-neutral family at matched luminance (avg 29.7); nearest existing token `surface.card` (#12181C, avg 18.3) is one step darker | Direct RGB pixel sampling, multiple points, all identical |
| 19 | Page background visible behind/above sheet (top strip) | ~`#8F9CA8` (143–150,151–162,162–177), non-flat photographic blur, varies ±7 per channel across the strip | `surface.base` (#080A0D) per target.md carve-out ("our content" — no photo background in our app) | Sampled 20 points across y=40–200, x=80–1100; reported representative average, flagged non-flat |
| 20 | Close-button chip fill | `#29272C` (41,39,44) ≈ white overlay at ~5% over sheet base (per-channel back-solve: R 4.9%, G 5.3%, B 5.4%, avg 5.2%) | `proposed:material.fillChip = rgba(255,255,255,0.05)` (opacity-based, follows existing `material.hairlineOnGlass` pattern) | Sampled 5 clean interior points inside chip (avoiding X-glyph and rim); alpha back-solved against measured sheet-base hex |
| 21 | Content-card fill | `#2C2C31` (44,44,49) ≈ white overlay at ~7% over sheet base (per-channel: R 6.2%, G 7.5%, B 7.6%, avg 7.1%) | `proposed:material.fillCard = rgba(255,255,255,0.07)` | Sampled 6 clean interior points across 2 cards; consistent value |
| 22 | X icon glyph color | `#FFFFFF`≈(255,253,255) | `text.primary` (#EFF3F4) — Δ negligible | Peak-brightness pixel sample at stroke center |
| 23 | Title "Visibility" text color | `#F8F5F9` (248,245,249) | `text.primary` (#EFF3F4) — Δ negligible | Peak-brightness pixel sample, "V" stroke |
| 24 | Card body text color | `#E9E7EC` (233,231,236) — slightly lower peak than title due to thinner regular-weight strokes | `text.primary` (#EFF3F4) — Δ negligible | Peak-brightness pixel sample, "T" of "Today" |

**MATERIAL**
| 25 | Sheet material (blur vs opaque) | Sheet-fill hex identical (zero variance) across all interior samples despite the photographic page background behind/above it varying in hue — consistent with either a fully opaque fill or a heavy dark tint over blur | `material: verify-on-glass` — cannot measure blur intensity from a static PNG per spec instructions; visible tint = `#1E1B20`/`proposed:surface.sheet`, opacity effectively ~100% (no bg bleed-through detected) | Cross-referenced sheet-interior samples against varying background-strip samples; no correlation found |

**TYPE**
| 26 | Title "Visibility" | Cap-height 38px → 12.7pt; bold weight (thick strokes vs body); ~0 letter-spacing | Nearest `type.heading` (fontSize 20, medium) — Δ size ~−2.4pt (implies ~18pt actual), Δ weight (bold vs medium, mismatch — reference is heavier) | Bbox of "V" only (x542–686, excludes descender-bearing "y") → cap-height = 339−301=38px; font-size ≈ cap-height/0.72 |
| 27 | Card body text | Cap-height 37px → 12.3pt; regular weight; ~0 letter-spacing | Nearest `type.body` (fontSize 15, regular) — Δ size ~+2.1pt (implies ~17pt actual) | Bbox of "Tod" (x99–180, excludes descender "y") → cap-height = 458−421=37px |
| 28 | Eye icon glyph size | 86×53px (see row 11) | — | (duplicate of GEOMETRY row 11 for TYPE-adjacent glyph context) |

**STATES**
| 29 | Close-button chip | Only default/resting state visible in reference; no pressed/disabled variant present in a static screenshot | `ORCHESTRATOR-SETS` for press feedback (scale/opacity) — not measurable from PNG | Single-frame PNG, only one state observable |

**MOTION**
| 30 | Sheet presentation/dismiss transition | Not measurable — static PNG | `ORCHESTRATOR-SETS` | N/A per spec instructions §Micro-motion rows |
| 31 | Close-button tap feedback | Not measurable — static PNG | `ORCHESTRATOR-SETS` | N/A per spec instructions §Micro-motion rows |
