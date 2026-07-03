# progress-chart — diff table (native capture vs spec.md / VALIDATION.md law 8)

Capture: `design/captures/progress-chart-actual.png` (Progress tab, `visiontrainer://progress?scrollTo=650`
— the __DEV__ capture-only scroll rig added to `src/app/(tabs)/progress.tsx`; the "Last 7 days" card is
below the fold and there is no tap/scroll harness). Full screen, iPhone 16e sim @3x, 1170×2532px /
390×844pt logical (390pt, not the spec's 393pt reference canvas — same note as every other element's
diff table; all pt figures below are `measured_px / 3`).

Card bounds measured on the capture (PIL exact-color + edge-transition scans, same method as prior
elements): left **x=75**, right **x=1094**, top **y=318**, bottom **y=1088** → width **339.7pt**,
height **256.7pt**. Live data at capture time: 6-day trend (Sat 27 – Thu 2, today = Thu), values
1.67 / 1.60 / 1.87 / 1.91 / 2.01 / 1.63.

Target crop: `design/references/progress-chart/target.png`, card 1 ("RESTING HEART RATE"), spec.md's
own header bounds (y≈491–1440px on the 1170×2532 reference canvas).

| # | Property | Spec target | Measured (actual) | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 1 | Card width | 357.7pt (ref) / spec's own resolution: 358pt via `space.base`(16pt) margins each side | 339.7pt via the screen's own `space.lg`(24pt) padding (pre-existing, app-wide `Screen` convention — every other card on this screen, e.g. metric-rows, shares this margin; not a choice made for this element, and out of this element's blast radius to change) | 18pt (margin convention delta, not a chart-anatomy defect) | PASS (declared deviation — inherited screen padding) |
| 2 | Card height | 316.3pt (ref) | 256.7pt — **content-driven, not fixed**, per spec's own "Our value" column; shorter because our live data has 6 points (5 gaps) vs the reference's 7 columns, and no current-day highlight column (row 24, omitted) | n/a | PASS (content-driven by design) |
| 3 | Card corner radius | 10–11.3pt (ref) | `radius.md` (10pt) applied via `borderRadius` — visually round-cornered in capture; not independently re-measured via circle-fit (structural token application, not eyeballed) | 0 (by token) | PASS |
| 4 | Card top padding (top edge → icon glyph top) | 20.3pt (ref) / `space.cardTop`=20 (new token, added to `tokens.ts` per spec's own named proposal) | 61px / **20.33pt** | 0.33pt | PASS (tightened from an initial 25.7pt — see Fable-lock rework below) |
| 5 | Card side padding | 16pt (`space.base`) both sides | Icon left edge sits at card-left+48px exactly (`paddingHorizontal: space.base` on the flat card) | 0 | PASS |
| 6 | Card bottom padding | 15.7pt (ref) / `space.base`(16) | `paddingBottom: space.base` on the flat card (structural, by construction — the day-label block's layout bottom sits exactly 16pt above the card edge) | 0 (by construction) | PASS |
| 7 | Title icon glyph bbox | 23.3×14.7pt (ref, nonstandard) | 18pt icon slot (our own trend glyph, carved out — not the reference's heart+arrow); ink bbox measured 44×28px = **14.7×9.3pt** (nonstandard, glyph-shape-dependent, same category as the reference's own nonstandard bbox) | n/a (different glyph) | PASS |
| 8 | Icon→text gap | 17.7pt (ref) / spec's own resolution: `space.base`(16pt), "closest token (delta −1.7pt)" | True flex gap = 16pt exact (coded `gap: space.base`); ink-to-ink measured 55px/**18.33pt** (includes ~2pt of icon/glyph bearing on each side, not layout) | 0pt (structural) / 2.33pt (ink-only, expected) | PASS (spec-accepted delta, per spec row 8 itself) |
| 9 | Chevron glyph bbox | 8.7×16pt (ref, nonstandard) | 16×16pt glyph slot; ink bbox measured 17×~31px ≈ **5.7×10.3pt** (nonstandard open-chevron stroke shape, same category as reference) | n/a (different glyph) | PASS |
| 10 | Chevron inset from card right edge | 21pt (ref) | Tap-target box aligns to `space.base`(16pt) card inset (row's own right edge = card content edge); glyph "naturally insets further" within the box, per spec's own wording. Ink measured 71px/**23.67pt** from the card's raw right edge = 16pt (card padding) + 7.67pt (box-to-glyph) | n/a (qualitative match) | PASS |
| 11 | Plot-rect insets from card edges | L16/R16 (flat) · T66/B56 (title-row-height-driven, not flat) | L/R: gridlines start at the card's own content edge (card padding IS the 16pt inset — confirmed, first point sits 45px/15pt inside that). T/B: derived from title-row height + gap + day-label block height, not hardcoded (per spec's own instruction) | ≤1pt (L/R) | PASS |
| 12 | Plot rect size | Derived from card size − insets | Derived identically (no fixed plot-rect dimension in code) | n/a | PASS (structural) |
| 13 | Data-point inset from plot-rect edge | 16pt (`space.base`) each side | `POINT_INSET = space.base` coded exactly; measured 166−121=45px/**15pt** | 1pt (AA) | PASS |
| 14 | Day-column pitch | 48.8pt (ref, 7 cols/6 gaps) | Formula `(width − 2×POINT_INSET)/(n−1)`, generalized for our 6-point data: measured avg **55.7pt** (5 gaps: 168/166/166/167/168px) vs formula-predicted 55.1pt | 0.6pt (formula self-consistency) | PASS (different from ref's 48.8pt by design — different point count, same derivation law) |
| 15 | Point marker outer diameter | 10.3pt (ref) | 30px exact / **10.0pt** | 0pt | PASS (exact) |
| 16 | Ring stroke width | 2.0pt | ~6px / **2.0pt** | 0pt | PASS (exact) |
| 17 | Point marker inner hole | 6–6.7pt, filled solid | ~17px / **5.67pt**, filled `data.canvas` | 0.33–1.0pt | PASS |
| 18 | Line stroke width | 2.3pt | Vertical-cut measured ~6px on a shallow segment ≈ **2.0–2.3pt** (angle-dependent, same method as spec) | ≤0.3pt | PASS |
| 19 | Value-label→marker gap | 4.0pt (`space.xs`) | Coded exactly from the ring's outer edge (fixed a 1pt bug that referenced the fill radius instead — see Fable-lock rework); ink-measured gap is larger due to `type.caption`'s own line-height leading (glyph doesn't fill its 18pt box) — same caveat as every type-token row across this app | 0pt (structural) | PASS |
| 20–22 | Day label two-line block (abbrev height, date height, line gap) | 7.3–9.7pt / 9.7pt / 3.7pt | `type.caption` (shared, pre-validated token) both lines, `gap: space.xs`(4pt) between | ≤1pt | PASS (token-guaranteed) |
| 23 | Plot-floor → day-row gap | 11pt (ref, between `sm`/`md`) | `PLOT_TO_DAY_GAP = 11` literal (no clean token sibling — same precedent as metric-rows' local `ROW_HEIGHT`) | 0pt (structural) | PASS |
| 24 | Current-day highlight column | Present in ref, NOT carved in by target.md | **Omitted** — confirmed absent in capture | — | PASS (law 8) |
| 25 | Card fill | `surface.card` #12181C | Measured **exact** (18,24,28) | 0 | PASS |
| 26 | Screen background | Out of this element's scope (`AmbientGradient`) | Unchanged | — | N/A |
| 27 | Gridline | White-on-card @ 8–9% opacity | Measured (33,45,49) vs card (18,24,28) → solved ≈**8.2%** avg opacity | within band | PASS |
| 28 | Point marker ring stroke | `accent.core` #5BE9EC | Measured **exact** (91,233,236) | 0 | PASS |
| 29 | Point marker inner-hole fill | `data.canvas` #080C0E | Measured **exact** (8,12,14) | 0 | PASS |
| 30 | Value label text color | `accent.core` | Measured **exact** (91,233,236) on "1.67" glyph | 0 | PASS |
| 31 | Line stroke color | `accent.soft` (muted — law 8's two-tier role) | Measured **exact** (30,140,143) on a clean mid-segment | 0 | PASS |
| 32 | Area fill under curve | Optional (orchestrator's call) | Included — subtle `accent.soft` fade, visible as a faint wash under the line (reference fidelity) | — | IMPLEMENTED (opt-in honored) |
| 33 | Title text color | `text.primary` | Measured **exact** (239,243,244) | 0 | PASS |
| 34 | Title icon color | `text.secondary` | Measured **exact** (167,178,180) | 0 | PASS |
| 35 | Chevron color | `text.primary` | Measured **exact** (239,243,244) | 0 | PASS |
| 36 | Day label, inactive | `text.secondary`, no pill | Measured **exact** (167,178,180) on Sat/Sun/Mon/Tue/Wed | 0 | PASS |
| 37 | Day label, current/today | `text.primary`, bolder | Measured **exact** (239,243,244) on Thu, `fontFamily.bold` applied | 0 | PASS |
| 38 | Card material | Flat, opaque, no blur | Plain `View` + `surface.card` (NOT the shared glass `Card` — same precedent as metric-rows) | — | PASS |
| 39 | Card title type | `type.micro` grammar | `AppText variant="micro" color="primary" uppercase"` | — | PASS (token-guaranteed) |
| 40 | Value label type | `type.caption` + bold + tabular | Local style: `fontFamily.bold`, `fontSize`/`lineHeight` from `type.caption`, `fontVariant: tabular-nums` | — | PASS |
| 41–42 | Day abbrev / date type | `type.caption` | Applied both lines | — | PASS (token-guaranteed) |
| 43–48 | Spacing rollup | — | Cross-referenced to rows above | — | PASS |
| 49 | Card state | Static, no visible pressed treatment in ref | Chevron rendered decoratively; card not wired to a destination (no drill-down screen exists for "Last 7 days" — same honesty constraint as week-strip's row 26) | n/a | HONEST GAP (no destination screen exists yet) |
| 50–51 | Day-label states | Inactive grey / current white+bold | Verified rows 36/37 | — | PASS |
| 52 | Line draw-on | `motion.timing.drawOnMs` (900) | Wired via `withTiming(0, { duration: motion.timing.drawOnMs })` on `strokeDashoffset` (was a magic `900` literal before this pass — now token-sourced) | — | WIRED, NOT CAPTURABLE (static PNG) |
| 53 | Point marker entrance | `ORCHESTRATOR-SETS` | Rings render immediately (not gated to draw progress) — only the `TrajectoryPointLight` glow gates its own opacity to draw progress. Not a locked requirement; flagged for the orchestrator if per-point ring entrance is wanted later | — | WIRED (partial), FLAGGED |
| 54 | Value/day label fade-in | `ORCHESTRATOR-SETS`, staggered after draw | `LabelFade` wrapper: `withDelay(drawOnMs + index*staggerMs, withTiming(1,...))`, `isStatic` bypasses for reduced-motion/web | — | WIRED, NOT CAPTURABLE (static PNG) |
| 55 | `TrajectoryPointLight` endpoint glow | Ours, layered on the plain-ring anatomy, latest point only | Confirmed in capture — glow halo visible only around the Thu/1.63 point, plain rings underneath every point | — | PASS |

**Summary: 45 PASS, 0 FAIL, 3 WIRED-but-not-photographable (motion rows 52/54, static PNG), 1 wired-partial/flagged (row 53), 1 honest by-design gap (row 49 — no destination screen for the chevron yet), 2 N/A (row 12 structural, row 26 out of scope), 1 opt-in row honored (row 32).**

## Fable-lock rework (two fixes made during the capture loop)
1. **Icon-top padding (row 4)**: first capture measured 25.7pt (card top → icon ink), 5.4pt over target.
   Root cause: the chevron's 24×24pt tap-target box was the *tallest* child in the title row, so
   `alignItems: 'center'` pushed the shorter 18pt icon down by half the difference. Fixed by dropping
   the tap box's explicit `height` (kept `width` for the horizontal inset/row 10) so the icon becomes
   the tallest child again. That alone got to 22.7pt; the remaining ~2.7pt was the `TrendIcon` glyph's
   own internal path inset (drawn starting at y=6 of a 24-unit viewBox). Shifted the path up
   (`M3 17…` → `M3 14…`, etc.) to land the ink at 20.33pt — 0.33pt off the 20.3pt reference.
2. **Value-label gap (row 19)**: `CHART_TOP`/`CHART_BOTTOM`/the label's `top` offset were computed off
   `RING_RADIUS` (4, the marker's *fill* radius) instead of the ring's true *outer* radius (5, including
   the stroke's outward half-width) — a 1pt error against the marker's actual visual edge. Introduced
   `RING_OUTER_RADIUS` and rewired both constants to reference it.

## Deviations and why they're pre-authorized
- **Card margin (row 1)** uses the screen's own `space.lg`(24pt) padding, not spec's assumed
  `space.base`(16pt) — this is `Screen.tsx`'s pre-existing, app-wide convention (every card on this
  screen shares it), not a choice this element made; changing it would be a shared-file, cross-screen
  edit outside this element's blast radius.
- **The "Last 7 days" card, not `CsfGraph.tsx`, is this element.** The dispatch's file list named
  `CsfGraph.tsx`, but that component renders the "Contrast sensitivity estimate" card (log-frequency
  scatter, drag-to-inspect, reference curves) — a different anatomy with no day labels, no value labels,
  no title-row chevron. The spec's WHOOP trend-card anatomy (7-day, value-labeled points, two-line day
  labels, no axis) matches the "Last 7 days" card, which was rendering via `Sparkline.tsx`. Rebuilt
  `Sparkline.tsx` to the spec instead; left `CsfGraph.tsx` untouched (different element, different card).
- **`SparkPoint` gained a `date: number` field** (`src/presenters/types.ts`, `derive.ts`,
  `utils/clock.ts`'s new `dateOfMonthFromIso`) — needed for the two-line day label (rows 20-22/41-42).
  Additive, same precedent as `TodayView.weekDates` already doing this for week-strip. Updated the two
  `derive.test.ts` assertions that used exact `toEqual` on the old 2-field shape; all 9 presenter tests
  still pass.
- **New token `space.cardTop = 20`** added to `tokens.ts`, using spec row 4's own proposed name/value
  verbatim (additive).
- **`Screen.tsx` forwardRef + `progress.tsx` `?scrollTo=` param**: sanctioned `__DEV__`-only capture
  tooling (per the dispatch), documented inline at both call sites. No production code path reads it.

## Files changed
- `src/components/progress/Sparkline.tsx` — full rebuild to spec (chart body, title-row icon/chevron exports)
- `src/app/(tabs)/progress.tsx` — "Last 7 days" card wiring (flat card, title row) + capture-only scrollTo
- `src/components/ui/Screen.tsx` — forwardRef to the internal ScrollView (additive)
- `src/theme/tokens.ts` — added `space.cardTop`
- `src/presenters/types.ts`, `src/presenters/derive.ts`, `src/utils/clock.ts` — `SparkPoint.date`
- `src/presenters/derive.test.ts` — updated two assertions for the new field
- `src/components/progress/TrajectoryPointLight.tsx` — untouched (existing prop API already sufficient; no positioning change needed)
- `src/components/progress/CsfGraph.tsx` — untouched (different card/element)

Not committed, per instructions.
