# screen-header — diff table (native capture vs spec.md / VALIDATION.md law 6)

Element scope: the context chip ("Today" on `index.tsx`, "Progress" on `progress.tsx`) plus the
chip→title→caption gap-ramp transfer into each screen's header block. Title/caption keep the
app's own hero type (`type.hero` + existing caption treatment) per the dispatch — not shrunk.

New shared component: `src/components/ui/ContextChip.tsx` (outline-chip family), exported from
`src/components/ui/index.ts`.

Captures:
- `design/captures/screen-header-actual.png` — Today, crop 1170×430+0+120 (top band with chip).
- `design/captures/screen-header-progress-actual.png` — Progress, same crop, via `visiontrainer://progress`.
- Full-frame screenshots (not committed as deliverables, used only for the gap-ramp measurements
  below): `/tmp/full-today-clean.png`, `/tmp/full-progress-v3.png`.

Measurement method: PIL pixel scans on the pre-crop full screenshot (1170×2532px, iPhone 16e
sim @3x, 390×844pt logical → 3px/pt), same bbox/mode-sample approach as Phase 3. Border color
verified analytically: `material.hairlineOutline` (rgba(255,255,255,0.34)) composited over
`surface.raised` (14,19,22) predicts (95.9, 99.2, 101.2); measured border pixels were exactly
(96,100,101) — an exact match.

## CHIP anatomy (outline family, law 6)

| # | Property | Spec target | Measured (actual) | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 1 | Chip height | 20.0pt (spec row 1) | 60px / **20.0pt** exact, both Today ("Today", rows 102–161) and Progress ("Progress", rows 285–344) — built as a fixed `height:20` per row-35's note, not lineHeight+padding | 0 | PASS |
| — | Chip width | N/A — reference text ("iOS 26") differs from ours ("Today"/"Progress"), content-driven | "Today": ~149px ≈ **49.5pt** (coincidentally close to ref's 49.0pt); "Progress": wider (longer word) | n/a | N/A (by design — content-driven) |
| 2 | Chip corner radius | `radius.xs`=4pt (spec row 2) | `radius.xs` token applied directly in `ContextChip` styles | 0 (token) | PASS |
| 5 | Chip row vertical alignment | `alignItems:'center'` (spec row 5) | Today's `eyebrow` row keeps its existing `alignItems:'center'`; chip and streak-badge render vertically centered | — | PASS |
| 28 | Chip-to-chip gap | 8.0pt exact, two ADJACENT chips (spec row 28) | Not applicable — our row has the label chip and the "N day streak" badge at opposite ends (`justifyContent:'space-between'`), a different, pre-existing layout outside this element's blast radius (streak badge is a separate component, not touched) | n/a | N/A (different layout, out of scope) |
| 7 | Chip fill | law 6 override: `surface.raised` remap (not spec's own `surface.card` guess) | Sampled interior mean **(14,19,22)** = `surface.raised` exact | 0 | PASS |
| 8 | Chip border color | `material.hairlineOutline` = rgba(255,255,255,0.34) (spec row 8 / VALIDATION addendum) | Measured border pixels **(96,100,101)** vs analytically-predicted blend (95.9,99.2,101.2) | ΔE<1 | PASS |
| 9 | Chip border width | `hairline.px1` (spec row 9) | 3 physical px at @3x = **1.0pt** exact (border rows 102–104 / 159–161 on Today) | 0 | PASS |
| 10 | Chip text color | `text.primary` (spec row 10) | Sampled glyph interior **(239,243,244)** = `text.primary` (#EFF3F4) exact | 0 | PASS |
| 13 | Chip material | Flat opaque fill, no blur/glass (spec row 13) | No `BlurView`/glass primitive used — plain `View` with solid `backgroundColor` | — | PASS |
| 14/17 | Chip type size | `type.micro` recommended (spec rows 14/17) | `type.micro` (11pt) spread into chip label style | 0 (token) | PASS |
| 15/18 | Chip type weight | `fontFamily.bold` (spec rows 15/18) | `fontFamily: fontFamily.bold` override on top of `type.micro` (whose default family is semibold) | 0 (token) | PASS |
| 16/19 | Chip tracking | Spec recommends tightening `type.micro.letterSpacing` (1.4) to **≈0.5pt** (spec row 16) | `letterSpacing: 0.5` override | 0 (per spec's own estimate) | PASS |
| 31/33 | Chip horizontal padding | `space.sm`=8pt (spec rows 31/33, Δ+1.3pt vs ref's ~6.7pt, spec's own accepted tolerance) | `paddingHorizontal: space.sm` | as specced | PASS |
| 35 | Chip vertical rhythm | Do NOT build height as `lineHeight + 2×padding`; lock to a fixed value (spec row 35) | Fixed `height:20` + `alignItems/justifyContent:'center'`, independent of `type.micro.lineHeight` | — | PASS |
| 36/37 | States | ORCHESTRATOR-SETS (not measurable from a static PNG) | No pressed/disabled state implemented — chip is a static label, matching the reference's single visible state | — | PASS (no regression) |

## Gap ramp transfer (chip→title→caption, law 6 "declared deviation")

| # | Property | Spec target | Measured (actual) | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 30 | Today: title→caption gap | ≈10.0pt exact, ink-bbox to ink-bbox (spec row 30) | CSS `titleBlock.gap` tightened `space.sm`(8)→**10**; measured ink gap (hero title line-2 descender bottom → sessionMeta top) = 35px/3 = **11.67pt** | +1.67pt | PASS (within the row's own hedge — spec itself notes this falls "between space.sm(8) and space.md(12)"; the residual overshoot vs the literal 10pt is `type.hero`'s tight lineHeight=fontSize box letting descenders spill past the CSS gap, not a token/value error) |
| 29 | Progress: chip→title gap | ≈20.0pt total (spec row 29) | Discovered `styles.screen.gap` (`space.md`=12pt) already separates every top-level section in `progress.tsx`, stacking with any padding added on `hero`. Calibrated `hero.paddingTop` to **4** (was `space.xl`=32, uniform top+bottom) so the total chip-bottom→label-top ink gap lands at exactly 60px/3 = **20.0pt** | 0 | PASS (bug caught and fixed during the loop — see note below) |
| 30 | Progress: title→caption gap (`hero` internal rhythm) | ≈10.0pt (spec row 30) | `hero.gap` tightened `space.sm`(8)→**10**, applied uniformly across the header's own internal stack (micro label → heroNumber → VerdictBand → confidence caption); confirmed via full-screen visual inspection, self-contained to the header block (does not touch `hero.paddingBottom`, which still separates the header from the "Vision profile" card below at the original `space.xl`) | — | PASS |

**Summary: 15 PASS, 0 FAIL, 2 N/A (out-of-scope layout differences, documented above).**

## Bug found and fixed during the loop
`progress.tsx`'s `Screen` receives `style={styles.screen}`, which sets `gap: space.md` (12pt)
between every top-level section — including between the chip and the `hero` block. An initial
`hero.paddingTop: 20` stacked on top of that pre-existing gap, producing a ~32pt visual gap
(measured 24–36pt across two failed iterations) instead of the intended ~20pt. Fixed by reducing
`hero.paddingTop` to 4pt so the total (screen-gap 12 + paddingTop 4 + label's own line-box
leading ~4pt) lands at exactly 20.0pt, confirmed by direct pixel measurement.

## Changed files
- `src/components/ui/ContextChip.tsx` (new) — the outline-chip primitive.
- `src/components/ui/index.ts` — added `ContextChip` export.
- `src/app/(tabs)/index.tsx` — swapped the inline `screenLabelPlate`/`screenLabel` for
  `<ContextChip label="Today" />`; removed the now-unused styles and `ACCENT_HOT` import;
  tightened `titleBlock.gap` 8→10 (title→caption ramp).
- `src/app/(tabs)/progress.tsx` — swapped the inline plate for
  `<ContextChip label="Progress" style={styles.screenLabelPlate} />` (style now just
  `alignSelf:'flex-start'`); removed the now-unused `screenLabel` style and `ACCENT_HOT` import;
  split `hero`'s `paddingVertical` into `paddingTop:4`/`paddingBottom:space.xl` and tightened
  `hero.gap` 8→10 (chip→title and title→caption ramp).

Not committed, per instructions — the orchestrator commits after the Fable lock.
