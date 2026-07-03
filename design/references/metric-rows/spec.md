# metric-rows — locked spec (Phase 3)

Canvas detected (primary target): 1170×2532 px (@3x → 390×844 pt) — `target.png`, WHOOP Sleep Statistics rows (4 rows: TIME IN BED, CONSISTENCY, RESTORATIVE SLEEP (%), SLEEP DEBT).
Canvas detected (secondary, sparkline only): 1179×2556 px (@3x → 393×852 pt) — `candidate-3.png`, Apple Stocks. Only the sparkline sub-component is measured from this source per `target.md` carve-out.
Measurement method: Python/PIL pixel sampling (exact hex + px-distance counts) on both PNGs; crops upscaled and visually verified. All px converted to pt as px÷3, one decimal.

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|

**GEOMETRY**

| 1 | Screen margin (card L/R inset from screen edge) | 48px / 16.0pt each side | `space.base` = 16 — exact match | Horizontal scan at y=1000, card-fill-vs-background transition at x=48 and x=1122 |
| 2 | Card width | 1074px / 358.0pt (= 390pt screen − 2×16pt) | Full-bleed row minus 2×`space.base`, formula match | Card fill horizontal extent, same scan |
| 3 | Row (card) height | 180px / 60.0pt — identical across all 4 rows | `proposed:metricRow.height` = 60 (no existing token) | Vertical color-transition scan through all 4 cards (953–1133, 1169–1349, 1385–1565, 1602–1781) |
| 4 | Row-to-row gap (vertical rhythm) | 36px / 12.0pt — identical between all 4 rows | `space.md` = 12 — exact match | Vertical gap between consecutive card-fill bands (3 gaps measured, all 36px) |
| 5 | Card corner radius | ~32px / 10.7pt (measured 31–33px on 2 corners) | `radius.md` = 10, Δ +0.7pt (vs `radius.lg`=14, Δ −3.3pt — md is closer) | Threshold-scan of top-left and top-right corner curvature on row 1, ASCII-map fit |
| 6 | Leading icon glyph bbox | 61×68px / 20.3×22.7pt (asymmetric: circular body + top knob + "ping" tick) | Icon frame 24×24pt (visual glyph ~20×23pt within it) | Pixel-diff bbox vs card-fill color (44,48,52), threshold Δ>35 |
| 7 | Delta-arrow glyph bbox | 22×13px / 7.3×4.3pt, solid filled triangle (no stroke) | `proposed:icon.deltaArrow` = 8×5pt | Orange-pixel threshold bbox, confirmed identical size on all 4 rows |

**COLOR & GRADIENT**

| 8 | Card fill | `#2C3034` (44,48,52), flat solid, no gradient | `surface.card` (`#12181C`) — reference card sits at ~2.03× the luminance of its own screen background; same ratio applied to our darker base lands on `surface.card` | Modal color, 12,250px sample in clean card-fill region |
| 9 | Screen / inter-row background | `#13181C` (19,24,28) | `surface.base` (`#080A0D`) — same structural role (gap reveals base bg) | Modal color, 17,500px sample between cards |
| 10 | Leading icon stroke color | `#949799` (148,151,153) | `text.secondary` (`#A7B2B4`) | Color histogram, icon bbox pixels |
| 11 | Caps label color | `#FFFFFF` pure white | `text.primary` (`#EFF3F4`) | Color histogram, "TIME IN BED" bbox (dominant color, 1231px) |
| 12 | Value color | `#FFFFFF` pure white — same as label, no differentiation | `text.primary` (`#EFF3F4`) | Color histogram, "6:33" digit bbox (dominant, 2125px) |
| 13 | Delta-arrow fill | `#F89D66` (248,157,102) — **identical hex for both up and down arrows**; WHOOP does not color-code direction here | Deviation from ref: our system codes trend semantically → `verdict.regressing` (`#E0607A`) for down-arrow, `verdict.improving` (`#5FD0B0`) for up-arrow. Flag: intentional adaptation, not a literal hue-remap (ref uses one neutral hue for both states) | Color-threshold bbox on all 4 rows; hex confirmed identical across down (rows 1–3) and up (row 4) |
| 14 | Muted baseline value color | `#949799` (148,151,153) — identical to icon color | `text.secondary` (`#A7B2B4`) | Color histogram, "7:31" baseline bbox |

**MATERIAL**

| 15 | Card material | Flat opaque fill. No blur/glass, no gradient, no shadow (no alpha falloff detected at card edges against background) | Flat `surface.card` fill, no blur | Visual inspection + edge-region sampling for shadow falloff (none found) |

**TYPE**

| 16 | Caps label ("TIME IN BED" etc.) | Cap-height 23px/7.7pt → est. fontSize ≈11pt | `type.micro` — fontSize 11, weight semibold, letterSpacing 1.4, `fontFamily.semibold` — Δ0, near-exact match | Bbox height of label glyphs (1033–1055, h=23px), cap-height≈0.727×fontSize estimate |
| 17 | Value ("6:33", "67%", etc.) | Digit height 52px/17.3pt → est. fontSize ≈24pt | No exact token (`type.heading`=20, Δ−4pt / `type.title`=28, Δ+4pt — equidistant). `proposed:metricValue` = { fontSize:24, lineHeight:28, letterSpacing:−0.3, fontFamily: bold } | Digit bbox height (1000–1051, h=52px), cap-height estimate. Weight read as bold/heavy vs label |
| 17b | Value — tabular figures | Consistent digit width observed across value strings | `tokens.tabularFigures` applied | Visual check of digit alignment across "6:33" |
| 18 | Muted baseline value ("7:31" etc.) | Digit height 22px/7.3pt → est. fontSize ≈10.2pt | `type.micro` fontSize reused (11, Δ−0.8pt) but de-tracked: `proposed:metricBaseline` = { fontSize:11, lineHeight:14, letterSpacing:0, fontFamily: medium } | Digit bbox height (1078–1099, h=22px) of secondary "7:31" value |

**SPACING**

| 19 | Icon left inset (card edge → icon bbox) | 42px / 14.0pt | Equidistant between `space.md`=12 (Δ+2) and `space.base`=16 (Δ−2); recommend `space.base` for consistency with row-1 screen margin | Icon bbox minx(90) − card left edge(48) |
| 20 | Icon → label gap | 29–30px / ~9.8pt | `space.sm` = 8, Δ+1.8pt (closest) | Label bbox minx(180) − icon bbox maxx(150–151) |
| 21 | Value → delta-arrow gap | 25px / 8.3pt | `space.sm` = 8, Δ+0.3pt — near-exact | Arrow bbox minx(1064) − value-digit bbox maxx(1039) |
| 22 | Delta-arrow → card right edge (right inset) | 37px / 12.3pt | `space.md` = 12, Δ+0.3pt — near-exact | Card right edge(1122) − arrow bbox maxx(1085) |
| 23 | Value block top inset (card top → value-digit top) | 47px / 15.7pt | `space.base` = 16, Δ−0.3pt — near-exact | Value-digit bbox miny(1000) − card top(953) |
| 24 | Value → baseline vertical gap | 27px / 9.0pt | `space.sm` = 8, Δ+1.0pt (closer than `space.md`=12, Δ−3) | Baseline bbox miny(1078) − value-digit bbox maxy(1051) |
| 25 | Baseline bottom inset (baseline bottom → card bottom) | 34px / 11.3pt | `space.md` = 12, Δ−0.7pt — near-exact | Card bottom(1133) − baseline bbox maxy(1099) |
| 26 | Icon + label vertical centering | Icon center y=1042.5 vs card center y=1043 (Δ0.5px) | Fully vertically centered — implement via `alignItems: center` on the leading icon+label group, not a fixed padding | Icon bbox center vs card fill vertical center |

**STATES**

| 27 | Delta arrow — decrease state | Solid downward-pointing triangle, `#F89D66`. Present on TIME IN BED, CONSISTENCY, RESTORATIVE SLEEP (%) rows | Map to `verdict.regressing` (see row 13) | Shape crop of row-1 arrow (triangle apex down) |
| 28 | Delta arrow — increase state | Solid upward-pointing triangle, same `#F89D66` hex in reference. Present on SLEEP DEBT row | Map to `verdict.improving` (see row 13) | Shape crop of row-4 arrow (triangle apex up) |
| 29 | Row — single visual state | No pressed/selected/disabled variant, no chevron/disclosure affordance visible on any of the 4 rows; static display only | Build only a default/static row state | Full-image inspection, all 4 rows structurally identical |

**MOTION**

| 30 | Row entrance / value count-up / press feedback | Not measurable from a static PNG | `ORCHESTRATOR-SETS` | N/A — flagged per instructions |

**SECONDARY SOURCE — `candidate-3.png` (Apple Stocks), sparkline only**

| 31 | Sparkline drawing-area size | ~78×90px / 26.0×30.0pt. Left edge and top-inset are fixed across rows (x=639, 57px/19pt below row top); right/bottom vary with data amplitude (measured 74–79px wide, 78–89px tall across XOM/COP/CVX rows) | `proposed:sparkline.frame` = 26×30pt | Bbox of red stroke pixels, 3 non-dashed rows (XOM y543–631, COP y981–1058, CVX y1419–1507), row bounds derived from hairline dividers at y=705/924/1143/1362 (219px/73pt row height in this source) |
| 32 | Sparkline stroke weight | 6px / 2.0pt (median on flat/near-horizontal segment; steeper segments read wider from diagonal cross-section, up to 11px) | `proposed:sparkline.strokeWidth` = 2pt | Vertical run-length scan across 19 x-columns (x=660–714, step 3), median run on flat segment = 6px |
| 33 | Sparkline stroke color | `#FF3B30` (255,59,48) — Apple system red, direction-coded per stock (all 6 rows in this crop are declines; up-state not present to sample) | `verdict.regressing` (`#E0607A`) for down-trend / `verdict.improving` (`#5FD0B0`) for up-trend — consistent with our delta-arrow semantic (rows 27–28) | Color histogram of stroke-only pixels (area-fill gradient beneath excluded — out of scope per brief) |
| 34 | Sparkline vertical alignment | Top-anchored, NOT centered in row: fixed 57px/19.0pt inset from row top, identical (Δ0px) across all 3 measured rows despite row height of 219px/73pt — aligns to the primary ticker/price line, not the full 2-line row block | Apply same top-anchor logic in our 60pt row (align to leading-icon baseline, do not vertically center as standalone) | Bbox top y vs row-top (derived from divider positions), 3-row comparison |
| 35 | Sparkline horizontal position | Left edge fixed at x=639 across all measured rows (~54.6% of 1179px screen width) — sits between the ticker/label column and the price/value column | Place between caps-label and value/delta-arrow group in our row, analogous slot | Bbox left-edge, 3-row comparison (Δ0px) |

## Return summary
- Rows measured: 35 (+1 sub-row 17b)
- `proposed:` tokens: `metricRow.height` (60pt), `metricValue` (type ramp entry, 24/28/−0.3 bold), `metricBaseline` (type ramp entry, 11/14/0 medium — de-tracked micro sibling), `icon.deltaArrow` (8×5pt), `sparkline.frame` (26×30pt), `sparkline.strokeWidth` (2pt)
- Not measurable: row 30 (motion) — flagged `ORCHESTRATOR-SETS` per instructions; sparkline up-trend color state (row 33) inferred from our own verdict ladder since reference crop contains only declining stocks
- Adaptation flagged (not a plain hue-remap): delta-arrow color (row 13) and sparkline color (row 33) — reference uses one neutral/direction-agnostic hue (orange) or a literal red/green pair; our build re-purposes the existing `verdict` ladder to carry the same directional meaning
