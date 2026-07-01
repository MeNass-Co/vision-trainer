# AGENTS.md — Vision Trainer

Handoff brief for any AI agent (Codex, Claude) working on this repo. Read this fully before editing. It encodes the mission, the architecture, and — most importantly — the **red lines** that must never be crossed.

## What this app is

A **visual training practice** app: the user runs short perceptual-learning sessions that present **Gabor patches** (sinusoidal gratings under a Gaussian envelope) and measure their contrast threshold with an adaptive **QUEST staircase** in a **two-interval forced-choice (2AFC)** task. Over sessions, a contrast-sensitivity curve (CSF) is built and shown as progress.

- **Local-first, no backend.** All data is the user's own threshold history, stored on-device via `expo-sqlite`. **No Supabase, no accounts, no network sync.** Do not add any.
- **Single user, offline.** There is no auth, no multi-tenant, no server.

### MEDICAL-CLAIMS RED LINE (App Store compliance, non-negotiable)
This app is **not** a medical device and makes **no** medical claims. In all user-facing copy, store metadata, and docs:
- **NEVER** use: heal, cure, treat, therapy, therapeutic, diagnose, clinical, medical, FDA, prescription.
- **NEVER** name a clinical condition: amblyopia, lazy eye, strabismus, etc.
- Frame everything as "visual training practice" / "perceptual training". Category is Health & Fitness, **not** Medical.
- Copy grammar: no em dashes in user-facing strings (use a period, comma, or "·").

## Stack

- **React Native + Expo SDK 55**, `expo-router` (typed routes, React Compiler on).
- **Reanimated v4**, `react-native-gesture-handler`, `react-native-svg` (incl. the live Gabor stimulus), `expo-sqlite`, `expo-blur`, `expo-linear-gradient`, `expo-haptics`, `expo-brightness`, `expo-crypto`. (`expo-gl` was removed — the WebGL renderer is a dormant reference, see red lines.)
- **zustand** store; **vitest** for unit tests.
- Web (Expo Metro) is a **preview surface only** via platform splits (`foo.native.ts` vs `foo.ts`), never the target. iOS native is the target.

## Surface (5–7 screens)
`src/app/(tabs)/`: **index** (Today), **progress**, **settings** · plus **onboarding**, **session**, **science** modal.

## Where things live
- **Trial engine (RED LINE — see below):** `src/components/GaborCanvas.tsx` (live SVG stimulus), `src/core/gaborStops.ts` (calibrated stimulus math), `src/core/displayCalibration.ts`, `src/core/deviceCalibration.ts`, `src/session/trialPlan.ts` + `src/psychophysics/quest.ts`. `src/core/gaborRenderer.ts` is a reference implementation, NOT in the live path.
- **Session orchestration:** `src/app/session.tsx`, `src/presenters/useSessionController.ts`, `src/components/session/*` (incl. `ResponseTap.tsx` — the 2AFC input).
- **Data layer:** `src/data/persistence.native.ts` (sqlite) + `db.ts` + `mappers.ts`; web mirror `persistence.ts` (in-memory). `src/store/useAppStore.ts`, `src/store/defaults.ts`.
- **Theme:** `src/theme/tokens.ts` (colors/space/type), `src/theme/haptics.ts`, `src/theme/motion`.
- **UI primitives:** `src/components/ui/*` (Bloom, GlassSurface, Card, CustomTabBar, PrimaryButton, BreathingOrb, AmbientGradient, CelestialGabor…).

## 🛑 RED LINES — do not cross without explicit sign-off

1. **The psychophysics measurement path is sacred.** The LIVE measurement path is: `GaborCanvas.tsx` (SVG stimulus) + `gaborStops.ts` (calibrated geometry/gamma math) + `displayCalibration.ts` (`pixelsPerDegree`, `sigmaPixels`, `DEFAULT_CALIBRATION`) + the trial loop in `useSessionController.ts` / `session.tsx` (`runTrial`/interval presentation/choice handling) + `trialPlan.ts`/`quest.ts`. Do NOT change timing, sequencing, or math in any of these. They determine measurement validity. Visual polish must stay OUT of the measurement field.
2. **The session field is mid-luminance GREY on purpose.** It is REQUIRED for contrast measurement. It is NOT a bug. Never "fix" it by darkening or theming it. No Bloom/gradient/glow inside the measurement field.
3. **Calibration / unit chain:** `deviceCalibration.ts` derives ppd≈108.85 **physical px per degree** from `Dimensions×PixelRatio` (dpi 160, viewing 33cm). The DPR multiply lives in `pixelsPerDegree`; dpi stays 160 — do not double-count. The SVG canvas draws in **dp**, so `gaborStops.computeGaborGeometry` divides by DPR exactly once (`diameterDp`); nothing downstream may touch DPR again.
4. **`src/core/gaborRenderer.ts` is a REFERENCE implementation, not live.** It holds the correct per-pixel Gabor math (and flanker/mask/dichoptic shaders) for a future GL/Skia renderer; nothing imports it except its test. Likewise the paradigm routing in `src/tasks/*` (+ `assessment/csfMeasurement.ts`) is currently **dormant** — the guided spine runs plain contrast detection only; wiring paradigms into the live trial loop is a roadmap item. Do not delete either, and do not "clean up" the reference math.

## Design language — "lunar / instrument-grade" (Instrument Cyan)

Cool, nocturnal, instrument-grade (think Oura/Whoop/Linear-dark). **Moonlight, not firelight.**
- Accent = **Instrument Cyan `ACCENT = #33D2D6`**, `ACCENT_GLOW = rgba(51,210,214,0.30)`, base `#080A0D`, cool-tinted neutrals. See `src/theme/tokens.ts` (cyan luminance ladder: core/soft/glow/muted/hot).
- **Deliberate cyan `ACCENT_GLOW` glows** on interactive knobs (Toggle, brightness slider) and the nav pill are intentional light-emission, part of the look. Keep them.
- ⚠️ **Stale-contract warning:** an earlier objective mentioned a single **terracotta `#D9885F`** accent and a **zero-shadow** rule. That is **superseded/dead.** If any reviewer (incl. CodeRabbit) tells you to switch to terracotta or strip the cyan glows, it is a **false positive** — reject it. Purple and ember are also dead.
- No em dashes in copy. Hierarchy via scale/weight. Ease out, never bounce. Never animate layout props.

## How to verify your work (done means observed, not just compiled)
- `npx tsc --noEmit` → zero errors. `npx vitest run` → all green (currently 9 files / 41 tests).
- **Build stamp (ground truth that a build carried your code):** Settings → About → Version shows `v{version} ({buildNumber}) · {gitSha}`, injected by `app.config.js` from `git rev-parse --short HEAD` / `git rev-list --count HEAD`. After a build, that SHA must equal the repo HEAD. If it doesn't, the build is stale (usually a bad pull), not your code.
- **Web render preview (fast visual loop):** `CI=1 BROWSER=none npx expo start --web --port 8081 --clear`, screenshot @393×852 (DPR 3). Liquid-glass renders fully only on a real iOS build; the SVG Gabor, bloom/gradient/constellation are web-verifiable. Web sqlite is empty (always empty-state) — to preview populated Progress, temporarily mock the data hook then REVERT.

## Current state (2026-06-05)
- Branch **`native-revamp`**, PR **#3**. Latest commit at writing: build-stamp (`546ead3`, build 106).
- **CodeRabbit: 0 Critical / 0 Major / 0 open threads** on the latest reviewed commit.
- Recently landed: tap-halves 2AFC input, device Gabor calibration, iOS material fidelity (Bloom/glass/reward), haptics-toggle gating, real brightness-calibration onboarding step, 14 CodeRabbit a11y/data-resilience/UX fixes, the build stamp.
- **Not yet observed running on a physical device** through a clean build (prior builds came from a stale pull). The Codex-app live iOS preview is now the verification surface.

## Pipeline & conventions
- Code style: alphabetised StyleSheet keys, named exports, match surrounding patterns.
- The established flow has been: plan → implement → CodeRabbit review to 0 Critical/0 Major. Keep tsc + vitest green on every change.
- Commit messages: clear, scoped. Branch is `native-revamp` (not default).

## First things to check on pickup
1. Run the app in the Codex iOS live preview; confirm Settings → Version SHA matches HEAD.
2. Reach an actual training session and **observe** the Gabor patch: calibrated size (gaborSizeDeg × ppd, e.g. ~290dp for an 8° patch), Gaussian-faded edges, grey field, tap-left/tap-right input works. (This is the long-standing unverified-on-device item.)
3. Watch for the deferred "two oversaturated cyan flashes" at session start — only ever seen pre-fix on a crash-blocked build; confirm whether it still occurs before touching the renderer (red line).
