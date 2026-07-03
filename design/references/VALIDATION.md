# Phase 3 validation — orchestrator sign-off (BINDING)

All 16 specs reviewed and approved. Where a spec flags a conflict or `ORCHESTRATOR-SETS`, the rulings below are law. An implementation agent that deviates from spec.md + this file has failed before capture.

## Cross-element laws
1. **CTA law** — `primary-button/spec.md` (Opal) governs EVERY full-width CTA in the app (Today, paywall, empty-state, onboarding, calibration). Other specs contribute only *anchoring* rows (bottom offset, margins) for their screens. Explicitly voided: Shake Shack's 4.3pt CTA radius + 166.7pt dead-zone; Mimo's 9pt CTA radius; Equinox+'s flat grey CTA. Button label type: the primary spec's label rows govern secondary buttons too (one label voice; secondary's proposed 18pt-bold token is voided).
2. **Secondary-button geometry inherits OUR primary** (pill radius, height, margins) — Waking Up contributes the *treatment*: true-transparent fill (verified), hairline border → `surface.hairlineStrong` at 1.5pt, identical type to primary, 12pt gap below primary.
3. **CTA gradient (isoluminant ruling)** — the spec's ladder-token column (row 7) is REPLACED by the derived isoluminant ramp, horizontal (90°), 5 stops:
   `0% #A2FFD1 · 25% ≈#BAFFE9 · 50% #BCFEF3 · 75% ≈#B0FDF9 · 100% #A3F9FD`
   (Opal's per-stop lightness/saturation preserved; hue sweep 86.5°→181.3° compressed to 150°→183°.) Label: `text.inverse` at 100%. Disabled: fill 10% opacity, label 35–40%, per spec rows 17–18. New tokens: `accent.ctaRamp` (array), do NOT reuse HOT/CORE/ACCENT here.
4. **Toggle single source of truth** — `toggle/spec.md` (51×31pt, 27pt thumb, 2pt inset, shadow 6%/2pt/+1pt) governs every switch. Settings-group's toggle rows (stadium-thumb 36×23 read) are STRUCK — blurred-region artifact.
5. **Tab-bar neutrality ruling** — copy Breathwrk exactly: icons + labels WHITE in both states; active distinction = frosted pill fill (`rgba(255,255,255,0.10)`) + filled-vs-outline glyph swap. No cyan on the tab bar. (Introducing accent where the reference has none is not a hue remap.) Bar radius 27.3pt → new token, do not touch `material.radius` (22, still governs cards).
6. **Screen-header scale ruling (declared deviation)** — chip anatomy (both fill families), chip gaps, and the chip→title→caption *gap ramp* transfer. Absolute title/caption type stays OUR hero ramp (`type.hero` 47pt + `type.body` caption): Flighty's 28pt title belongs to an announcement card, not a screen hero; shrinking the app's voice is copying the wrong thing. Context chips ("Today", "Progress") use the OUTLINE family (fill `#171718`→`surface.raised` remap, border `rgba(255,255,255,0.34)`… reduce to 0.34→**verify on glass**, ~0.3pt hairline→render at `hairline.px1` with 34% white).
7. **Progress-ring ruling (pre-declared adaptation, numbers set)** — REJECT the 0.198 stroke:diameter ratio at our diameter (49.6pt band would destroy the orb composition). Transfer: (a) tonal track = `rgba(51,210,214,0.15)` (`accent.trackTint`, fixes the opaque-grey defect the spec caught), (b) rounded caps (already correct), (c) circular head marker riding the stroke end, diameter = 2× stroke. Stroke: 3.0pt (up from ~2pt hairline, presence without bulk). Fill → `accent.core`.
8. **Progress screen speaks WHOOP** — chart card + metric rows per their specs; the reference's current-day highlight column is OMITTED (not carved in target.md). Chart line → `accent.soft` (muted), points + value labels → `accent.core` (bright): the two-tier hue role is load-bearing. Our `TrajectoryPointLight` glow rides ONLY the latest point, on top of the reference's plain-ring anatomy.
9. **Metric delta arrows are semantic here** — reference's single orange (non-semantic) becomes `verdict.improving`/`verdict.regressing` by direction (declared adaptation; verdict tokens exist for exactly this).
10. **Week-strip adopts date numbers** (reference structure): letters row + state cells at equal-CENTER 52.7pt pitch. Today = 35pt filled white circle w/ dark text; completed = `accent.core` tint + 4pt dot; scheduled = white text + dot, no tint; past-inactive = `text.faint`. Two independent booleans (done, scheduled) in the presenter.
11. **Paywall single plan card** spans full content width (count carve-out), radius `radius.md` (measured 9pt ≈ 10 within ±1pt tolerance), selected state = `accent.core` border per spec. Badge slot reuses the measured "Most Popular" chip primitive.
12. **Onboarding progress fill** = `ACCENT` (accepted design call — "the one live element on screen"); two-layer bar copied exactly (5pt fill on 1pt 14%-white track, top-aligned, formula-based fraction).

## Motion rows (all `ORCHESTRATOR-SETS` resolved — tokens from `src/theme/tokens.ts`)
- Tab switch: active pill translates with `motion.spring.liquid`; press = `pressScale` 0.96 + `spring.press`; haptic `select`.
- Buttons (primary+secondary): press `pressScale` 0.96 + `spring.press`; no haptic on press, haptic `tick` on release-commit where already wired.
- Toggle: thumb travel + track color cross-fade with `spring.toggle`; haptic `select`.
- Slider: thumb scale 1.15 while grabbed (`spring.input`); haptic `tick` at 0%/100% only.
- Modal close chip: press `pressScale` 0.96; sheet present/dismiss stays native iOS.
- Chart: line draw-on `motion.timing.drawOnMs` (900), value labels fade-in staggered `staggerMs` after draw; no count-up on axis labels.
- Metric rows: count-up `countUpProgressMs` on values, rows enter with `entranceMs` + `staggerMs`.
- Week-strip: no entrance animation (static truth); today circle may keep existing ambient breathe.
- Onboarding bar: fill width animates `entranceMs` (280) with `spring.snap` on step advance.
- Verdict word: fades with `rangeFadeMs` when state changes.

## Token addendum (single consolidated list — add to tokens.ts, names final)
```ts
// radius
radius.xs = 4            // chips (screen-header spec)
radius.xl = 25           // settings grouped cards
radius.sheet = 36        // modal sheet top corners
radius.floatingBar = 27  // tab bar (do not touch material.radius)
// color
accent.ctaRamp = ['#A2FFD1','#BAFFE9','#BCFEF3','#B0FDF9','#A3F9FD']  // isoluminant CTA fill
accent.trackTint = 'rgba(51,210,214,0.15)'   // ring tonal track
accent.onLight = '#0B6A6D'                    // text on light accent fills (filled chips)
surface.controlTrackOff = '#33383D'           // UISwitch off track on dark
surface.sheet = '#1B2225'                     // modal sheet fill (hue-rotated neutral)
text.faint = '#2B3231'                        // week-strip past days
text.tertiary = '#6B7477'                     // delta-chip word grey
text.secondaryBright = '#C9D6D7'              // paywall body/price
// material
material.hairlineOutline = 'rgba(255,255,255,0.34)' // outline-chip border
material.fillChip = 'rgba(255,255,255,0.05)'
material.fillCard = 'rgba(255,255,255,0.07)'
material.pillOnGlass = 'rgba(255,255,255,0.10)'     // tab-bar active pill
// type (additions, not replacements)
type.tabLabel = { fontFamily: medium, fontSize: 10, lineHeight: 12, letterSpacing: 0.2 }
type.metricValue = { fontFamily: semibold, fontSize: 24, lineHeight: 28, letterSpacing: -0.3, tabular }
type.numeral = { fontFamily: bold, fontSize: 18, lineHeight: 22 }  // week-strip dates
// sizes
icon.tab = 23
sparkline = { width: 26, height: 30, stroke: 2 }   // top-anchored 19pt from row top
```
Voided proposals: `type.buttonLabel` (CTA law), `radius.plan=9` (→ radius.md), settings `toggle.*` (law 4), `rowHeight.*`/`avatarSize.*` (inline in spec, no token needed), `space.2xs` (use 6pt literal via space.xs+2? No — approved as literal in chip padding rows).

## Per-spec verdicts
tab-bar ✓ (law 5) · primary-button ✓ (law 3) · secondary-button ✓ (laws 1–2) · settings-group ✓ (law 4 strike) · toggle ✓ · slider ✓ (keep the fill-stops-short-of-thumb quirk verbatim) · modal-sheet ✓ · paywall ✓ (law 11) · week-strip ✓ (law 10) · screen-header ✓ (law 6) · empty-state ✓ (rhythm only, law 1) · progress-chart ✓ (law 8) · metric-rows ✓ (laws 8–9) · verdict-band ✓ (caption-bold mapping approved; delta chip from Eight Sleep secondary) · onboarding-chrome ✓ (law 12) · progress-ring ✓ (law 7)
