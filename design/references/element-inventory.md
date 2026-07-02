# Element inventory — reference-match worklist (Phase 0)

> Authored by the taste tier from native captures (`design/captures/current/*.png`, iPhone 16e, 390×844 pt @3x → 1170×2532 px) + source scan. Every element below is either rebuilt to 99% of a chosen Mobbin reference (text/count/hue carve-outs only) or explicitly excluded as signature identity. No silent scope cuts.

## Worklist (reference-matched, priority order)

| # | Element | Current file(s) | Route for capture | Current state / what "good" means | Mobbin search angle |
|---|---------|-----------------|-------------------|-----------------------------------|---------------------|
| 1 | **Floating tab bar** | `src/components/ui/CustomTabBar.tsx` | `/` (all tabs) | Muddy grey pill, weak active treatment, cramped icons. Good = crisp glass material (real blur + tint + hairline), unambiguous active state, correct optical icon boxes, floats with intent. | "tab bar", "floating tab bar", "bottom navigation glass" |
| 2 | **Primary CTA button** | `src/components/ui/PrimaryButton.tsx` | `/` (Start session) | Flat cyan pill, no gradient structure, no light model. Good = premium fill (gradient ramp/inner light), exact height/radius/type, real pressed state. | "primary button", "CTA button dark app" |
| 3 | **Secondary / quiet button** | paywall + calibration ("Maybe later", "Done") | `/paywall`, `/calibration` | Grey glass pill, mushy border. Good = quiet but intentional: correct fill opacity, hairline, type weight — reads subordinate without reading disabled. | "secondary button", "ghost button dark" |
| 4 | **Settings group** (caps header + grouped card + rows: toggle row, subtitle row, chevron nav row, value row) | `src/components/settings/{Section,Row}.tsx`, `src/app/(tabs)/settings.tsx` | `/settings` | Decent bones, generic execution: separators, paddings, chevron weight, subtitle color all near-miss. Good = iOS-native rhythm with brand material — the reference's exact row heights, inset, separator treatment. | "settings screen dark", "settings list rows" |
| 5 | **Toggle / switch** | `src/components/settings/Toggle.tsx` | `/settings` | Near-stock switch, oversized thumb. Good = reference's exact track/thumb geometry, on/off fills, micro-motion. | "toggle switch settings" |
| 6 | **Slider** | `src/app/calibration.tsx` (brightness) | `/calibration` | Stock grey thumb on cyan track — the single most "amateur" control in the app. Good = reference's track height, thumb size/shadow, fill treatment, value labels. | "slider brightness control", "slider dark app" |
| 7 | **Modal sheet chrome** (top radius, close affordance) | `src/app/{science,calibration}.tsx` | `/science`, `/calibration` | Sheet radius barely reads; close button = thin hairline circle X, floats awkwardly. Good = reference's corner radius, close-button size/fill/icon weight/position, sheet background separation. | "modal sheet", "close button sheet dark" |
| 8 | **Paywall stack** (badge chip + hero copy + CTA pair + legal caption + plan card w/ price badge + feature bullet rows) | `src/app/paywall.tsx` | `/paywall` | Layout exists, plan card is generic: weak badge, big soft bullets, spongy hierarchy. Good = tier-1 subscription-screen discipline (Blinkist/Headspace/Calm class): tight badge, confident plan card, crisp bullet rhythm. | "paywall", "subscription screen dark", "plan card" |
| 9 | **Week strip** (S–S day dots, today state) | `src/app/(tabs)/index.tsx` (inline) | `/` | Letters + dots exist; states barely differentiated (done/missed/today/future). Good = reference's letter/dot geometry, spacing, and a legible 4-state system. | "streak week days", "habit tracker week row" |
| 10 | **Screen header system** (context chip + hero title + caption) | `(tabs)/index.tsx`, `progress.tsx` (inline) | `/`, `/progress` | Chip is a grey lozenge with no job; hero type solid but unanchored. Good = reference's chip geometry/fill and title block spacing ramp. | "screen header large title dark" |
| 11 | **Empty state** | `src/components/progress/ProgressEmptySky.tsx` | `/progress` (no data) | Poetic copy (keep text!) but structure is loose: illustration→title→caption→CTA spacing unmeasured. Good = reference's empty-state vertical rhythm and proportion. | "empty state dark app" |
| 12 | **Progress chart card** (CSF/trend graph + point light + confidence) | `src/components/progress/{CsfGraph,TrajectoryPointLight}.tsx` | `/progress` (seeded data) | Unverified against any reference. Good = reference's axis/gridline restraint, line weight, point treatment, label typography. | "progress chart", "line graph health app dark" |
| 13 | **Metric rows** (contributors + sparkline + count-up) | `src/components/progress/{ContributorRows,Sparkline,CountUpNumber}.tsx` | `/progress` (seeded data) | Same. Good = reference's row height, label/value alignment, sparkline proportion. | "stats rows", "metric list health app" |
| 14 | **Verdict band** (improving/holding/regressing) | `src/components/progress/VerdictBand.tsx` | `/progress` (seeded data) | Same. Good = reference's status-band fill/type/inset (WHOOP-class verdict treatment). | "status banner", "insight card health" |
| 15 | **Onboarding chrome** (step layout + bottom progress bar + CTA) | `src/app/onboarding.tsx`, `src/components/onboarding/*` | fresh install / `/onboarding` | Steps work; progress bar is a bare 2pt line, spacing unmeasured. Good = reference's step rhythm, indicator geometry, CTA anchoring. | "onboarding steps", "onboarding progress dark" |
| 16 | **Progress ring/arc** (goal arc around orb) | `src/components/home/ContrastArc.tsx` | `/` | Constrained: geometry must keep orbiting the signature orb. Reference-match the arc *properties* (stroke weight, cap, track/fill contrast, tick treatment) not the composition. | "activity ring", "circular progress dark" |

## Signature elements — EXCLUDED from reference match (identity, not chrome)
- `CelestialGabor`, `AmbientGradient` starfield, `Bloom`, `Grain`, `GaborCanvas`/`GaborMark` — the app's soul; referenced by nothing, matched to nothing.
- **Session/measurement path** (`src/app/session.tsx`, `src/components/session/*`, Gabor rendering, psychophysics) — hard blast-radius exclusion per brief.
- `science.tsx` content cards ride on elements 4/7/10 tokens; no dedicated reference.

## Rig facts (for Phase 4 agents)
- Canvas: **iPhone 16e, iOS 26, 390×844 pt @3x = 1170×2532 px** (UDID `86A20F69-A2CC-40F1-BA01-F7CB30048F13`, already booted). ONE canvas for the whole run.
- Capture: `scripts/shoot-sim.sh <out.png> ["visiontrainer://<route>"] [WxH+X+Y crop]` → `design/captures/`.
- Real routes: `/` = Today tabs index (relaunch app to land there: `xcrun simctl terminate booted co.menass.visiontrainer; xcrun simctl launch booted co.menass.visiontrainer`), then `visiontrainer://progress|settings|paywall|science|calibration|onboarding`. There is **no** `visiontrainer://today` route — the script's example is stale.
- Deep-link "Open in?" prompt is permanently whitelisted via schemeapproval plist (done). Status bar overridden to 9:41/full battery (done).
- Onboarded state injected in app DB (`settings.payload = {"onboardingComplete":true}` in `Documents/SQLite/vision-trainer.db`). To shoot onboarding, temporarily flip it back or uninstall/reinstall — restore after.
- Metro runs on :8081 (background). **Reload after every code change before re-shooting**; when unsure, terminate+relaunch the app.
- Elements 12–14 need seeded `sessions`/`thresholds` rows in the DB before capture (orchestrator seeds before those elements run).
- Tokens: `src/theme/tokens.ts` — add tokens, never magic numbers. Accent ladder: `ACCENT_CORE #5BE9EC` / `ACCENT #33D2D6` / soft/muted/glow/hot.
