# progress-chart — locked spec (Phase 3)
Canvas detected: 1170×2532 px (@3x → 390×844 pt, iPhone 6.1" standard grid)
Source card measured: card 1 of 2 ("RESTING HEART RATE"), y≈491–1440px. Card 2 ("RESPIRATORY RATE") shares identical anatomy — not re-measured.

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|

**GEOMETRY**
| 1 | Card width | 1073px = 357.7pt (screen 390pt − 16pt margin ×2) | 358pt, margin = `space.base` (16) each side | Horizontal scan y=700/800 for left/right fill-vs-bg transition (x=48→1121) |
| 2 | Card height | 949px = 316.3pt | 316pt (content-driven, not fixed) | Vertical scan x=200 diffed against background column, top=491 bottom=1440 |
| 3 | Card corner radius | ~29–34px ≈ 10–11.3pt (circle-fit on TL corner arc) | **10pt** → `radius.md` (delta ≈ +0.3 to +1.3pt, within AA noise) | Row-scan of top-left corner edge x-position per y (y491→x77 … y518→x48), least-squares circle fit |
| 4 | Card top padding (top edge → icon top) | 61px = 20.3pt | proposed: `space.cardTop = 20` (no exact sibling; between `base`16/`lg`24) | Vertical scan x=115 for first icon-glyph pixel above bg threshold |
| 5 | Card side padding (edge → title icon / plot gridline) | 48px = 16pt both sides | `space.base` (16) | Icon left edge x=96, card left x=48; plot gridline left x=96 same value |
| 6 | Card bottom padding (day-row text bottom → card bottom, via highlight-pill bottom) | pill fades ~y1393, card bottom 1440 → 47px = 15.7pt | `space.base` (16) | Vertical scan x=1000 for pill-tint falloff vs card-bottom edge |
| 7 | Title row: icon glyph bbox | 70×44px = 23.3×14.7pt (nonstandard combo "heart+arrow" glyph, not square) | Use a single square icon, **18pt** (nearest standard icon-scale) | Bounding-box scan of icon glyph pixels, x96–165 / y552–595 |
| 8 | Title row: icon→text gap | 53px = 17.7pt | `space.base` (16) ≈ closest token (delta −1.7pt) | Icon right edge x=165 → title text left edge x=218 |
| 9 | Title row: chevron glyph bbox | 26×48px = 8.7×16pt | 16×16pt glyph in a 24pt tap target | Bounding-box scan x1033–1058 / y551–598 |
| 10 | Title row: chevron inset from card right edge | 63px = 21pt | Align tap-target box to `space.base`(16) inset; glyph naturally insets further | Card right x=1121 − chevron right x=1058 |
| 11 | Chart plot rect (gridline span) insets from card edges | L 48px/16pt · R 48px/16pt · T 198px/66pt · B 168px/56pt | L/R = `space.base`(16); T/B are title-row-height + bottom-row-height driven, not flat padding — see rows 4,6,7,9 | Gridline extent x96–1073 vs card x48–1121; gridline y689–1272 vs card y491–1440 |
| 12 | Plot rect size | 977×583px = 325.7×194.3pt | derived from card size − insets | Gridline bbox |
| 13 | Data-point inset from plot-rect edge (extra inset before first/last point) | 48px = 16pt each side | `space.base` (16) | First point center x=144 vs plot-left x=96 |
| 14 | Day-column pitch (x-spacing between adjacent day slots) | 146.5px = 48.8pt (7 columns across 881px data span) | derived: `(cardWidth - 2×32pt) / 6` | Blue-pixel clustering of the 6 markers found, x-centers 144/290/437/(583 skipped)/730/876/1023 |
| 15 | Point marker outer diameter | ~31px = 10.3pt (range 29–32px across AA thresholds) | **10pt** outer ring — *our TrajectoryPointLight glow sits outside/around this, per target.md; this row specs the plain reference point only* | Blue-mask bbox per marker (e.g. "62" point: y819–851) |
| 16 | Point marker ring stroke width | 6px = 2.0pt | 2pt | Horizontal run-length through ring equator (x279–284 at y835) |
| 17 | Point marker inner hole | ~18–20px = 6–6.7pt diameter, filled solid (not transparent) | fill with `data.canvas` (see COLOR row) | Dark-pixel bbox inside ring, x284–299/y826–841 |
| 18 | Line stroke width | ~7px vertical cut on shallow segment (13.75° from horizontal) ≈ 2.3pt true perpendicular width | 2.3pt (≈2–2.5pt) | Vertical pixel-run at x=950 on clean 55→54 segment (y1104–1110) |
| 19 | Value label vertical offset above marker | 12px = 4.0pt (label text bottom → ring top), constant across all 6 points checked | `space.xs` (4) | Run-gap analysis per point column (all 6 points: consistent 12px gap) |
| 20 | Day-of-week label row: line-1 (abbrev) height | 22–29px ≈ 7.3–9.7pt (ascender-to-baseline, "Tue" T-height) | pairs with type row below | Bbox scan y1305–1333, x60–1122 |
| 21 | Day-of-week label row: line-2 (date number) height | ~29px = 9.7pt | pairs with type row below | Bbox scan y1344–1372 |
| 22 | Day-of-week: line1→line2 gap | ~11px = 3.7pt | `space.xs` (4) | line1 bottom 1333 → line2 top 1344 |
| 23 | Plot floor (bottom gridline) → day-row top gap | 33px = 11pt | proposed: 11pt (between `space.sm`8/`space.md`12, closer to md) | gridline5 y=1272 → line1 top y=1305 |
| 24 | Current-day highlight column (extra, NOT in must-cover list) | Full-height vertical band, 88px/29.3pt wide, spans from ~y674 (above 1st gridline) to ~y1393, same tint as gridline overlay | **Omit from our build** — target.md doesn't carve this in; our signature is the endpoint glow, not a day-selection column. Flagged for orchestrator if day-emphasis is wanted later. | Column scan x=1000 vs x=850/900 control columns |

**COLOR & GRADIENT**
| 25 | Card fill | `#252D32` (37,45,50) | `surface.card` `#12181C` (structure identical: raised opaque card over darker canvas; we run darker per Ultrahuman near-black doctrine) | Point-sample ×4 clean card-fill pixels |
| 26 | Screen background (outside cards, context only) | Vertical gradient, ~`#1B2429`→`#0E1216`→`#12161A` drifting by y (not flat) | `surface.base` `#080A0D` (flat) — our build doesn't replicate the drift | Column scan x=5/10/20 full height, non-flat readings noted |
| 27 | Gridline | `#393F44` over `#252D32` card fill ≈ white @ 9% opacity overlay (R:9.2% G:8.6% B:8.8%, avg 8.8%) | white-on-`surface.card` @ **8–9% opacity** (structure/opacity copied, no hue to rotate — it's neutral) | Solved overlay-alpha per channel from card-fill vs gridline sampled hex |
| 28 | Point marker ring stroke | `#64A9E0` (100,169,224) — WHOOP blue | `accent.core` `#5BE9EC` (hero/live data-point role) | Point-sample ring stroke, 2 locations, consistent |
| 29 | Point marker inner-hole fill | `#151C21` (21,28,33) | `data.canvas` `#080C0E` (nearest sibling; reference is a touch lighter) | Point-sample dark hole interior |
| 30 | Value label text | `#64A9E0` (100,169,224) — same as ring | `accent.core` `#5BE9EC` | Histogram of "62" label glyph pixels — dominant color matches ring exactly |
| 31 | Line stroke (clean mid-segment, away from any marker) | `#456D8C` (69,109,140) — visibly more muted/desaturated than ring+label | `accent.soft` `#1E8C8F` (structural/decorative role per token doctrine) | Vertical pixel-run sample x=950 y1104-1109, far from any point (>70px); cross-checked against a near-point sample that read brighter due to ring AA bleed — rejected that reading |
| 32 | Area-fill under curve (extra, not in must-cover list) | Present: gradient from `#2A3842`-ish near the line down to fully transparent at plot floor (~580pt of fade) | Optional — include only if orchestrator wants it; not required by target.md | Vertical column x=200 sampled y850→1270, monotonic fade confirmed |
| 33 | Title text | `#FFFFFF` | `text.primary` `#EFF3F4` | Point-sample "R" stem, solid full-white run |
| 34 | Title icon (heart+arrow glyph) | `#95999B` (149,153,155) | `text.secondary` `#A7B2B4` | Histogram of icon-region pixels, dominant non-bg color |
| 35 | Chevron | `#FFFFFF` | `text.primary` `#EFF3F4` | Point-sample chevron stroke core |
| 36 | Day label, inactive (e.g. "Tue", "19") | `#8C8D8C` (140,141,140) | `text.secondary` `#A7B2B4` | Histogram of "Tue"/"19" glyph regions — identical color both lines |
| 37 | Day label, current/selected ("Mon", "25") | `#FFFFFF` | `text.primary` `#EFF3F4` | Histogram of "Mon"/"25" glyph regions |

**MATERIAL**
| 38 | Card surface material | Flat opaque fill, no blur, no translucency detected | Flat `surface.card`, no blur (`material.blurIntensity` NOT used here) | Card fill constant regardless of what's behind it (chart line crossing under does not show through) |

**TYPE**
| 39 | Card title ("RESTING HEART RATE") | Cap-height 26px=8.7pt → est. font-size ≈11.9pt; all-caps; tracked out; weight looks semibold/bold by stroke density | `type.micro` (11pt / lineHeight 15 / tracking 1.4 / semibold) — **target.md explicitly names this as our type.micro grammar**, delta ≈ +0.7pt cap-height read vs token, attributable to reference's own (non-Inter) typeface | Full-glyph bbox scan of title string, y563–588; stroke-width sample on "R" stem |
| 40 | Value label ("62" etc.) | Cap/digit-height 28px=9.3pt → est. font-size ≈12.8pt; heavy/bold weight; tabular-looking digits | Nearest token by size = `type.caption` (13pt) but weight reads bold not medium — recommend **`type.caption` + bold weight override + `tabularFigures`** | Run-analysis bbox per point label (6 points, consistent 27–28px height) |
| 41 | Day abbreviation ("Tue") | Ascender-height 22–29px ≈ 7.3–9.7pt (T-cap to baseline) → est. ≈12.8pt font-size, medium weight | `type.caption` (13pt, medium) | Bbox scan y1305–1333 |
| 42 | Date number ("19") | Height ≈29px = 9.7pt, same scale as day abbrev, marginally heavier stroke | `type.caption` (13pt) — same size as row 41, weight may read medium too (visually similar to "Tue", not clearly bolder on closer inspection) | Bbox scan y1344–1372 |

**SPACING (rollup — see GEOMETRY rows for source measurements)**
| 43 | Card L/R margin from screen edge | 16pt | `space.base` | row 5 |
| 44 | Card top padding | 20pt | proposed `space.cardTop` | row 4 |
| 45 | Card bottom padding | 16pt | `space.base` | row 6 |
| 46 | Icon↔title text gap | 16–18pt (measured 17.7) | `space.base` | row 8 |
| 47 | Value-label↔marker gap | 4pt | `space.xs` | row 19 |
| 48 | Plot-floor↔day-row gap | 11pt | ~`space.md`(12), delta −1pt | row 23 |

**STATES**
| 49 | Card — default/only state | Static card, no pressed/hover treatment visible in reference; chevron implies whole card is tappable | ORCHESTRATOR-SETS (press scale via `motion.pressScale` 0.96 if we make the card tappable) | Single static screenshot, no state variants available |
| 50 | Day-of-week label — inactive (past days) | Grey `#8C8D8C`, regular weight, no background | `text.secondary`, no pill | rows 20-22, 36 |
| 51 | Day-of-week label — active/current day | White `#FFFFFF`, bolder weight, sits on a highlighted full-height column (row 24, omitted from our build) | `text.primary`; **if we omit the highlight column (row 24), still keep the white/bold text state to mark "today"** | rows 20-22, 37 |

**MOTION**
| 52 | Line draw-on | Not measurable from static PNG | ORCHESTRATOR-SETS | — |
| 53 | Point marker entrance | Not measurable from static PNG | ORCHESTRATOR-SETS | — |
| 54 | Value label count-up/fade-in | Not measurable from static PNG | ORCHESTRATOR-SETS | — |
| 55 | TrajectoryPointLight endpoint glow (OURS, not in reference) | N/A — reference points are plain rings, no glow | ORCHESTRATOR-SETS — glow is our signature layered on top of rows 15-17's plain-point anatomy, per target.md | — |

## Carve-outs applied (per target.md)
- Data values/day labels: our content, not the reference's numbers/dates (text carve-out).
- Line + point marker hue: WHOOP blue `#64A9E0`/`#456D8C` remapped to our cyan ladder (`accent.core`/`accent.soft`) — see rows 28-31.
- Endpoint glow: ours, layered on the plain-point anatomy specified in rows 15-17 (not present in reference).
- Current-day highlight column (row 24): observed in reference but not carved in by target.md — recommend omitting; flagged, not deleted, in case orchestrator wants it.

## Rows not measurable
- Rows 52-55 (MOTION): static PNG cannot yield timing/easing — emitted as ORCHESTRATOR-SETS per instructions.
- Row 38 (MATERIAL): confirmed absent (flat card) rather than "not measurable" — no blur to report.
