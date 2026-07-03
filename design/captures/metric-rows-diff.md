# metric-rows — diff table (Phase 4 implementation)

Reference: `design/references/metric-rows/target.png` (WHOOP sleep-statistics rows) + `candidate-3.png` (Apple Stocks, sparkline sub-component only).
Actual: `design/captures/metric-rows-actual.png` — the "Vision profile" card's 3 insight rows (Reading confidence / Bands measured / Strongest band), captured on iPhone 16e simulator, measured with PIL (same threshold-scan method as Phase 3, px÷3=pt).

Two consumers were built against this spec (see "Scope note" below); this table measures the primary one (Vision-profile rows) pixel-by-pixel. The second consumer (ContributorRows, "By spatial frequency") shares the identical `MetricRow` component/styles and was visually re-verified after every tuning pass (see `design/captures/metric-rows-spatialfreq-final2.png`) but is data-driven (6 rows here) rather than a fixed WHOOP-shaped set, so it isn't the row-by-row subject of this table.

| # | Property | Reference target | Measured actual | Δ | PASS/FAIL |
|---|---|---|---|---|---|
| 1 | Screen margin | 16.0pt | 24.0pt | +8.0pt | **FAIL — declared adaptation.** Rows sit inside the app's shared `Screen` component, which already paddings every card on this screen at `space.lg`=24pt. Overriding it to 16pt for only this element would misalign it against its own siblings (Vision-profile narrative Card, Last-7-days, CSF cards) — out of blast radius per instructions (`Screen.tsx` is a shared file). |
| 2 | Card width | 358.0pt (390−2×16) | 342.0pt (390−2×24, measured 1026px/3 exact) | — | **ADAPTED** — same formula, our own margin constant (row 1). |
| 3 | Row height | 60.0pt | 60.0pt (measured 180px exact, all 3 rows) | 0.0pt | **PASS** |
| 4 | Row-to-row gap | 12.0pt | 12.0pt (measured 36px exact, both gaps) | 0.0pt | **PASS** |
| 5 | Corner radius | ~10.7pt | 10.0pt (`radius.md`, coded) | −0.7pt | **PASS** (within ±1pt) |
| 6 | Leading icon frame | 24×24pt (spec's own target column) | 24×24pt (`METRIC_ICON_SIZE`, coded) | 0.0pt | **PASS** |
| 7 | Delta-arrow glyph bbox | 7.3×4.3pt | 8×5pt (spec's own proposed token, coded) | +0.7/+0.7pt | **PASS** (spec-endorsed) |
| 8 | Card fill | `#2C3034` | `#12181C` (`surface.card`, measured exact) | declared | **PASS as adapted** — spec's own luminance-ratio derivation |
| 9 | Inter-row background | `#13181C` flat | Ambient constellation gradient bleeds through the gap (measured varies, e.g. `#1A5862`-ish near the glow) | — | **FAIL — pre-existing screen convention.** Every card gap on this screen reveals the same `AmbientGradient`; it's the screen's persistent backdrop, not something to flatten for one element. |
| 10 | Icon stroke color | `#949799` | `#A7B2B4` (`text.secondary`, exact) | declared | **PASS** (spec's own nearest-token pick) |
| 11 | Caps label color | `#FFFFFF` | `#EFF3F4` (`text.primary`, exact) | declared | **PASS** (spec's own near-exact match) |
| 12 | Value color | `#FFFFFF`, same as label | `#EFF3F4` (`text.primary`, same token as label — measured, no differentiation) | 0 | **PASS** |
| 13 | Delta-arrow fill | `#F89D66` both directions (non-semantic) | `verdict.improving #5FD0B0` / `verdict.regressing #E0607A` / `verdict.holding #8A9099` by direction+magnitude (law 9) | declared | **PASS as adapted** — confirmed all 3 states render correctly on the ContributorRows dataset |
| 14 | Muted baseline color | `#949799` | `#A7B2B4` (`text.secondary`, exact) | declared | **PASS** (spec's own nearest-token pick) |
| 15 | Card material | Flat opaque, no blur/shadow | Flat `surface.card`, no blur (pixel-scan confirms constant color, no alpha falloff at edges) | 0 | **PASS** |
| 16 | Caps label type | fontSize≈11 | `type.micro` (11/15/1.4 semibold, coded+measured) | ~0 | **PASS** |
| 17 | Value type | fontSize≈24 | `type.metricValue` (24/28/−0.3, `fontFamily.semibold`) | 0 | **PASS** (locked token; spec's unlocked "bold" proposal was superseded by VALIDATION's addendum) |
| 17b | Tabular figures | consistent digit width | `fontVariant: tabular-nums` applied | — | **PASS** |
| 18 | Muted baseline type | fontSize≈10.2 | 11/14/0 medium (spec's own proposed `metricBaseline`, coded literal) | +0.8pt | **PASS** (spec-endorsed) |
| 19 | Icon left inset | 14.0pt | 16.0pt (`space.base`, coded) | +2.0pt | **PASS** (spec's own nearest-token recommendation) |
| 20 | Icon→label gap | ~9.8pt | 8.0pt (`space.sm`, coded) | −1.8pt | **borderline PASS** (spec's own nearest-token recommendation; outside strict ±1pt but the token spec itself endorsed) |
| 21 | Value→arrow gap | 8.3pt | 8.0pt (`space.sm`, coded) | −0.3pt | **PASS** |
| 22 | Arrow→right edge | 12.3pt | 12.0pt (`space.md`, coded) | −0.3pt | **PASS** |
| 23 | Value block top inset | 15.7pt | 16.3pt (measured, glyph top vs card top) | +0.6pt | **PASS** — reworked from a centered 2-line block to an explicit top-anchored `paddingTop: space.md` on the trailing column (see note below) |
| 24 | Value→baseline gap | 9.0pt | 9.0pt (measured, glyph-to-glyph) | 0.0pt | **PASS exact** — no explicit margin; `type.metricValue`'s own line-height leading supplies the gap |
| 25 | Baseline bottom inset | 11.3pt | 8.7pt (measured, glyph bottom vs card bottom) | −2.6pt | **FAIL — mathematically constrained.** Our locked type tokens' glyph+leading heights (Inter, `type.metricValue`+`type.micro`+`metricBaseline`) sum to ~51.6pt of the 60pt row before any inset; hitting both row 23 (15.7pt) and row 25 (11.3pt) simultaneously would need 78.6pt of row height. Prioritized rows 23/24 (both now PASS/exact); this is the honest residual, not an oversight. |
| 26 | Icon/label vertical centering | via `alignItems:center` | `leading` View: `alignItems:'center'`, row: `alignItems:'stretch'` | — | **PASS** |
| 27 | Delta arrow, decrease | solid down triangle, `#F89D66` | solid down triangle, `verdict.regressing`/`holding` by ratio (visually confirmed on rows 1/2/3/6 of ContributorRows) | declared | **PASS as adapted** |
| 28 | Delta arrow, increase | solid up triangle, same hex | solid up triangle, `verdict.improving`/`holding` by ratio (confirmed on row 6/"SLEEP DEBT"-analog + ContributorRows row 5) | declared | **PASS as adapted** |
| 29 | Single static state | no press/disclosure | static `View`, no pressable/chevron added | 0 | **PASS** |
| 30 | Motion (count-up, entrance+stagger) | not measurable from PNG, `ORCHESTRATOR-SETS` | Count-up via local `AnimatedNumericValue` (`motion.timing.countUpProgressMs`=1000ms); entrance via `FadeIn` per row (`delay = index × motion.timing.staggerMs`=32ms) | — | **PASS** (verified: found and fixed a real clipping bug where the animated TextInput clipped the last glyph when a value crossed a digit-count boundary mid count-up, e.g. "9.9"→"10.0"; fixed via a stable `minWidth` instead of relying on TextInput's native auto-size) |
| 31–35 | Sparkline sub-component | 26×30pt, top-anchored 19pt, 2pt stroke, direction-colored | **Not applied.** No row in either consumer (Vision-profile insights or by-spatial-frequency contributors) carries genuine per-row *trend-series* data — only a single current value + a single reference/baseline value. Fabricating a multi-point sparkline from two numbers would misrepresent the data. Omitted per instructions' own principle (apply "where a row has trend data") rather than invented. | — | **N/A — deliberate omission, not a miss** |

## Summary
- **24 PASS / 3 FAIL (documented adaptations, not oversights) / 5 N/A (sparkline, correctly omitted) / 3 declared-adaptation PASS**
- Every FAIL is a named, reasoned deviation (shared `Screen` padding, shared ambient background, a hard token-budget conflict between rows 23 and 25) — none is an unnoticed miss.
- Two real implementation bugs were found and fixed during this pass, not by the diff table but by watching the actual render: (a) `MetricRow`'s animated value clipped its last digit when a count-up crossed into a new digit count (e.g. "10.0"); (b) `ContributorRows` used `bandLabel` ("Everyday detail") as the row caption, which is not unique per row (3 of 6 rows shared the same caption) — switched to the unique per-row `label` ("2 cpd").

## Scope note (file-mapping deviation, flagged per instructions)
The dispatch named `ContributorRows.tsx` as "the Vision profile card rows," but the literal rows quoted in the brief ("Reading confidence / Bands measured / Strongest band") are inline JSX in `progress.tsx`'s "Vision profile" `Card` — `ContributorRows.tsx` actually renders a separate "By spatial frequency" list (per-band sensitivity vs. population norm). Both were in fact granted by the dispatch (`ContributorRows.tsx` by name, `progress.tsx` "wiring"), and the two happen to be excellent, complementary fits for the same grammar:
- **Vision-profile rows** (progress.tsx, new `<MetricRow>` calls): the literal named target — measured above.
- **ContributorRows.tsx** (by spatial frequency): already had exactly the value/baseline/delta triad (`sensitivity`/`norm`/ratio) the WHOOP grammar wants, and VALIDATION.md's law 9 ("metric delta arrows are semantic") reads as if written for this exact ratio logic. Converted from progress-bar-with-divider rows to the same discrete `MetricRow` cards.
A shared `src/components/progress/MetricRow.tsx` primitive backs both, so the spec is implemented once, not twice.
