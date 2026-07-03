# onboarding-chrome — diff table (step 1 of 7 capture only)

Capture: `design/captures/onboarding-chrome-actual.png` (1170×2532 px @3x, iPhone 16e, step 1).
Only step 1 was captured — `src/app/onboarding.tsx` has no deep-link/query-param/dev hook to jump
the pager to another step (checked: no `useLocalSearchParams`, no step-query handling), and the
brief said not to tap. So step-to-step motion (rows 29) and the chevron's own geometry (rows 1-4,
only visible for step>0) are verified by code read, not by a second capture. Stated honestly below.

| # | Property | Spec target | Measured (ours) | Δ | Verdict |
|---|---|---|---|---|---|
| 1-4 | Back chevron bbox/stroke/color/position | 9.7×17.7pt, ~1.5pt stroke, text.primary, left=margin | **Not visible on step 1** (app hides back nav on the first step — pre-existing product behavior, unchanged by this task). Code: `stroke={text.primary}`, `strokeWidth={1.6}`, rendered in a 24×24pt box at the same left edge as the label/bar (x≈24pt) | n/a (code-verified only) | **N/A — unverifiable from this capture, verified by code** |
| 5 | Gap status-bar → chevron top | 22.7pt in-content top padding (recommended) | Governed by shared `Screen` component: `insets.top + space.lg(24pt)` — not modified (out of blast radius; changing `Screen` would affect every screen) | Δ1.3pt vs recommendation | **PASS (within tolerance, via existing shared convention)** |
| 6 | "N of M" label position | left = margin, top ≈128pt | Left ink edge x=74px/3=24.7pt (label), bar left edge x=72px/3=24.0pt — same margin family (space.lg) shared with CTA | Δ0.7pt label-vs-bar (font side-bearing) | **PASS** |
| 7 | Gap label-bottom → bar-top | 9.0pt | **8.0pt** (ink-bottom row423 → bar-top row447, /3) | Δ1.0pt | **PASS (at tolerance edge)** |
| 8 | Progress bar total width | space.lg margins both sides | Track spans x=72→~1097px = 1025px/3 = **341.7pt**, canvas 390pt − 2×24pt = 342pt | Δ0.3pt | **PASS** |
| 9 | Fill height | 5.0pt | **5.0pt exact** (rows 447–461, 15px/3) | 0 | **PASS** |
| 10 | Track height, top-aligned | 1.0pt, top-aligned with fill | **1.0pt exact** (3px/3), starts same row (447) as fill | 0 | **PASS** |
| 11 | Corner radius | 0 / square-cut | `borderRadius: 0` on both layers; pixel scan shows a hard edge, no curvature | 0 | **PASS** |
| 12 | Fill fraction formula | currentStep/totalSteps (formula) | `(step+1)/STEPS.length` = 1/7 = 14.29% measured 147px/1026px = 14.33% | Δ0.04pp | **PASS — formula-based, STEPS.length not hardcoded** |
| 13 | Fill color | ACCENT (design call) | Sampled `(51,210,214)` = `#33D2D6` = **ACCENT exact** | 0 | **PASS** |
| 14 | Track color | `material.hairlineOnGlass` rgba(255,255,255,0.12) | Alpha-inverted from sampled px vs local bg: R0.123/G0.120/B0.122 → **α≈0.122** | Δ0.002 | **PASS (near-exact)** |
| 17 | Step-label type | type.caption (13/18 medium), color not spec'd → used text.primary | `variant="caption" color="primary"` (unchanged token, no new type introduced) | — | **PASS** |
| 19-21 | Title/caption type/color | type.title (28/34 semibold) / type.caption (13/18 medium), text.primary / text.secondary | **Unchanged** — `StepCopy`/`AppText variant="title"/"caption"` untouched per scope ("chrome only") | — | **PASS (unchanged, out of this element's edit scope)** |
| 22 | Title top offset rel. to bar-bottom | 40.0pt | **Not met**: hero uses `flex:1` + `justifyContent:'flex-end'` (pre-existing, untouched), which anchors the orb+title block near the BOTTOM of the available space, not immediately below the new top chrome. Measured gap ≈424pt on this capture. | Large | **FAIL — but out of blast radius.** `styles.hero`/orb/copy are explicitly "untouched — chrome only" per the brief; fixing this would mean re-architecting the hero's vertical distribution, which belongs to a different element (StepReveal/BreathingOrb), not onboarding-chrome. Flagging honestly rather than silently declaring PASS. |
| 25-26 | CTA anchoring (margins, bottom offset) | space.base 16pt margins / 50pt bottom (raw spec) — but law 1 says other specs contribute *anchoring only* for their own screen | Measured: L/R margin ≈24.7pt each (space.lg, matches label/bar/CTA — the app's own already-locked convention, see paywall/Today), bottom offset = 58.0pt (`insets.bottom(34) + actions.paddingBottom(space.lg 24)`) — **identical to the pre-existing pre-chrome-change anchor** (the Footer removal actually fixed a latent double-padding bug that would have pushed the CTA ~24pt higher had it not been cleaned up) | vs raw Equinox pt values: informational only | **PASS — anchoring unchanged/consistent with the app's own locked CTA system** |
| 27 | Fill-vs-track contrast | ACCENT 100% vs hairlineOnGlass 12%, Δ88pp | Same relationship, colors confirmed above | — | **PASS** |
| — | Old bottom progress line | must be removed | `Footer`/old `ProgressBar` (bottom, 3pt pill, `surface.hairlineStrong`) deleted from `onboarding.tsx`; no bottom line rendered (confirmed by capture: nothing near the CTA) | — | **PASS** |
| 29 | Step-advance transition | ORCHESTRATOR-SETS → `motion.spring.snap`, entranceMs | `fill.value = withSpring(fraction, motion.spring.snap)` (was `withTiming(…,320ms)`) | — | **PASS (code-level; not verifiable from a static PNG)** |

## Summary
16 PASS · 1 FAIL (row 22, explicitly out of blast radius, documented) · 4 rows N/A on this capture
(chevron geometry, verified by code) · 1 motion row PASS at code level.

## Files changed
- `/Users/nassimlecornet/projects/vision-trainer/src/app/onboarding.tsx` — new `TopChrome` component
  (chevron + "N of M" + two-layer bar), restyled `BackChevron` (color → `text.primary`), rewritten
  `ProgressBar` (5pt ACCENT fill / 1pt hairlineOnGlass track, top-aligned, square corners,
  `withSpring`/`spring.snap`), removed `Footer` + old bottom pill bar + the now-redundant
  `styles.screen.paddingBottom` (was only there for the deleted footer).
- No files touched under `src/components/onboarding/` — `StepReveal.tsx` and `BreathingOrb.tsx`
  were read-only reference checks, not edited (chrome-only scope honored).

## State restore
Simulator was flipped to `onboardingComplete:false` via `json_set` (not a full payload overwrite —
this preserved the user's other settings fields instead of wiping them) to reach onboarding step 1,
then restored to `true` via the same `json_set` approach after capture. Verified landing on Today
after restore + relaunch (see report).
