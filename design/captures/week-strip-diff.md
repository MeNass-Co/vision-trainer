# week-strip — diff table (native capture vs spec.md / VALIDATION.md law 10)

Capture: `design/captures/week-strip-actual.png` (Today tab, no deeplink — relaunch lands here), crop
`1170×300+0+1030` on the full-screen capture (`design/captures/week-strip-full.png`, iPhone 16e sim
@3x, 1170×2532px / 390×844pt logical — note: 390pt logical width, not the spec's 393pt reference
canvas; all pt figures below are `measured_px / 3`).
Live data at capture time: today = Fri 2026-07-03 (todayIndex 5), 14-day streak, so every past day in
the visible week (Sun 28 – Thu 2) is `completed`; Sat 4 is a genuine future/no-activity day.
Measurements taken with PIL dominant-color histograms / bright-pixel bounding boxes directly on the
full pre-crop screenshot, same method as prior elements (tab-bar-diff.md).

| # | Property | Spec target | Measured (actual) | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 1 | Element width / carding | Full screen width, uncarded, floats on dark bg | Uncarded, floats directly on `AmbientGradient` background; row bleeds `-space.md` (12pt) past the screen's `space.lg` (24pt) padding on each side | — | PASS |
| 2 | Total reserved slot height | 64.0pt | Letter-row-top → dot-bottom ink span: 194px / **64.67pt** | 0.67pt | PASS |
| 3 | Letter-row cap-height | 7.3pt | 24px / **8.0pt** (`type.micro`, nearest existing token — spec row 20 already pre-accepts this exact Δ) | 0.7pt | PASS (spec-accepted) |
| 4 | Digit cap-height (plain digit) | 13.0pt | 39px / **13.0pt** | 0 | PASS |
| 5 | Today filled-circle diameter | 35.0pt | 105×105px / **35.0×35.0pt** exact | 0 | PASS |
| 6 | Dot anatomy + geometry (RE-MEASURED at Fable lock) | HOLLOW RING — REF re-measured with PIL scanlines on target.png days 8 & 11: outer Ø **21px/7.0pt** (h and v identical, both dots), stroke **3px/1.0pt** on all four sides (left/right/top/bottom scanline runs), center pixel = pure background (17,17,18) — a stroked circle, NOT a filled disc (spec row 6's original "6.7pt dot" was the x1−x0 bbox arithmetic, missing the +1 and the hollowness) | Outer Ø 21×21px / **7.0×7.0pt** exact; stroke 3px/**1.0pt** on all four sides (h and v scanlines); center rgb (16,44,49) = background gradient showing through — hollow confirmed | 0 | PASS |
| 7 | Letter-row bottom → digit-top | 18.7pt | 56px / **18.67pt** | 0.03pt | PASS |
| 8 | Shared center axis (digit vs. circle, do-not-top-align law) | Circle center ≈ digit center (ref Δ was 0.5px measurement noise) | Circle center y = **397.00pt**, plain-digit (Wed) ink center y = **397.00pt** — identical to the pixel | 0.0pt | PASS (exact, via flexbox-centered fixed-height `stateCell` box, not manual offsets) |
| 9 | Digit-bottom → dot-top | 18.5pt | 56px / **18.67pt** (re-verified after the ring rework — unchanged) | 0.17pt | PASS |
| 10 | Inter-day pitch (column-center to column-center) | 52.7pt constant | 6 gaps: 52.0 / 52.5 / 52.5 / 51.83 / 52.5 / 52.33pt, avg **52.28pt** | ≤0.87pt per gap, 0.42pt avg | PASS (equal-CENTER via 7 `flex:1` cells, confirmed non-constant glyph widths don't skew pitch) |
| 11 | Edge inset, screen edge → col1/col7 center | 38.2 / 38.7pt (avg 38.4) | 111.5px / **37.17pt** (col 1, "S"), 1052.5px / **39.17pt** (col 7, "S") — avg **38.17pt** | avg 0.23pt (per-side up to ~1.0pt, glyph-width asymmetry) | PASS |
| 12 | Edge inset, screen edge → glyph ink edge | Derived, not a token per spec itself | Not separately measured — spec explicitly designates this non-canonical (row 11 governs) | n/a | n/a |
| 13 | Day-letter color, ALL states | `#FFFFFF` (mapped `text.primary` per spec) | Dominant color (239,243,244) = **`text.primary` exact**, applied unconditionally (no per-state branch — bug in the old build removed) | 0 | PASS |
| 14 | Past / no-activity digit color | `text.faint` `#2B3231` | Code path implemented (`isPast && !isCompleted → text.faint`) but **not visually verifiable this capture** — the 14-day streak means every past day in the visible week is completed; no past+inactive day exists in the seeded data | n/a | IMPLEMENTED, NOT CAPTURED |
| 15 | Completed-day digit tint | `accent.core` | Dominant color (91,233,236) = **`accent.core` #5BE9EC exact** (Sun 28…Thu 2, all completed) | 0 | PASS |
| 16 | Completed dot (ring) color | `accent.core`, byte-identical to digit | Ring-stroke dominant color (91,233,236), **byte-identical** to row 15 (re-verified on the ring stroke after the rework) | 0 | PASS |
| 17 | Today circle fill | `text.primary` / `#FFFFFF` | Dominant color (235,239,240) vs token (239,243,244) | ΔE≈1.5 (<3 tolerance) | PASS |
| 18 | Today digit ink | `text.inverse` `#08161A` | Dominant color (8,22,26) = **exact** | 0 | PASS |
| 19 | Future/plain digit color | `text.primary` | Sat "4": dominant (239,243,244) = **exact** | 0 | PASS |
| 20 | Day-letter type | `type.micro` (nearest token) | Applied via `AppText variant="micro"` | see row 3 | PASS (spec-accepted) |
| 21 | Number type (all states) | `type.numeral` (18pt bold) | Applied via literal style spread of `typo.numeral` (RN Text, not AppText — same pattern as `CustomTabBar`'s `type.tabLabel`, since `numeral` isn't in AppText's `Variant` union and adding it would touch a shared component beyond blast radius) | 0 | PASS |
| 22 | Past day, no activity (state) | letter white, digit `text.faint`, no dot | Same as row 14 — **not renderable this capture**, code path present | n/a | IMPLEMENTED, NOT CAPTURED |
| 23 | Past/current day, completed (state) | letter white, digit+dot `accent.core` | Verified on Sun 28 – Thu 2 (all completed) | — | PASS |
| 24 | Today (state) | letter white, 35pt filled circle, dark digit, no dot | Verified on Fri 3 (circle, `text.inverse` digit, no dot rendered even though today could independently be "done") | — | PASS |
| 25 | Future day, no activity (state) | letter+digit white, no dot | Verified on Sat 4 | — | PASS |
| 26 | Future day, scheduled (dot, not tinted) | letter+digit white, dot `accent.core`, digit NOT tinted | **Not renderable with real data** — the app has no per-day "scheduled/program" concept (confirmed by codebase search: only a single daily-reminder time exists, no recommended-day model). Fabricating a "scheduled" flag would violate the presenter's existing honesty contract (`weekCompletion`'s own doc comment: "no day is ever fabricated"). Future days render as plain white digits, no dot — an intentional, documented narrowing of this row to what the data can honestly say | n/a | HONEST GAP (by design, not oversight) |
| 27 | Motion (dot fade-in, circle slide, tint-on-completion, ambient breathe) | `ORCHESTRATOR-SETS`; row 29 permits keeping ambient breathe on the today circle | Week-strip has no entrance stagger (only the existing outer `FadeIn`, per "static truth" ruling). Today circle carries a subtle ±6% opacity breathe (`motion.timing.breatheMs`, `Easing.inOut(sin)`, `withRepeat`), same pattern as `CelestialGabor`/`TrajectoryPointLight`, gated on `reduceMotion` | — | WIRED, NOT CAPTURABLE (static PNG) |

**Summary: 22 PASS, 0 FAIL, 2 rows implemented-but-unverifiable with the current 14-day-streak seed (rows 14/22 — no past-inactive day exists in this week), 1 row an honest, by-design data-model gap (row 26 — no "scheduled" concept exists in this app), 1 row wired-but-not-photographable (motion, row 27), 1 row n/a (row 12, spec's own non-canonical measurement).**

## Deviations and why they're pre-authorized
- **Letter color made state-invariant** (row 13): the old build colored letters `primary`/`secondary`/`muted` by state. Spec's own measurement (row 13, and "Key findings") found the reference's letters are pixel-identical white in every state. Fixed to match — this was a correctness fix, not a stylistic choice.
- **`type.numeral` applied via plain RN `Text`, not `AppText`**: `AppText`'s `Variant` union doesn't include `numeral`. Extending it would touch a shared component outside this element's blast radius; the codebase already has an established precedent for this exact situation (`CustomTabBar` uses plain `Text` + `typo.tabLabel` for the same reason). Followed that precedent.
- **Full-bleed pitch achieved via `marginHorizontal: -space.md` on `weekRow`**, not a Screen-level padding change. Derivation: target usable width = 7 × 52.7pt = 368.9pt; our Screen pads `space.lg` (24pt) per side; bleeding by `space.md` (12pt) per side (an existing token, not a new magic number) yields 390 − 2×12 = 366pt ≈ 7×52.3pt — which is exactly what was measured (52.28pt avg pitch, 0.42pt off target). `dayCell: { flex: 1 }` then centers content per column, producing equal-CENTER (not equal-gap) distribution for free, matching spec's own "Key findings" note.
- **Shared vertical axis (row 8) solved structurally, not numerically**: `stateCell` is a fixed-height (35pt = circle diameter) box with `alignItems/justifyContent: 'center'`; whichever child renders (digit `Text` or circle `View`) is centered in it, so the digit-ink-center and circle-center coincide by construction. Measured delta: 0.0pt — better than the reference's own stated 0.5px measurement noise.
- **`marginTop: 4` (stateCell) / `marginTop: 5.5` (dotSlot)** are literal, non-tokenized values, tuned against a live capture to hit spec rows 7 and 9 exactly (no named token exists at these values — same precedent as tab-bar's literal 6pt icon-label gap).

## Fable-lock rework (dot anatomy)
First lock REJECTED on one defect: the dot was rendered as a filled disc; the reference's is a hollow
ring. REF re-measured with PIL center/ring pixel sampling and four-direction scanlines (both dots,
days 8 & 11 — byte-identical to each other): outer Ø 21px/7.0pt, stroke 3px/1.0pt, center = pure
background. The coordinator's eye estimate (Ø 7–8pt, ~1.5pt stroke) resolved to **7.0pt / 1.0pt** by
measurement. Fix: `dot` style switched from `backgroundColor: accent.core` to
`borderColor: accent.core` + `borderWidth: 1` + transparent center (`DOT_DIAMETER` 6.7→7,
new `DOT_STROKE = 1`). Relaunched, recaptured, re-measured: ours is now 21×21px outer, 3px stroke all
four sides, hollow center with the background gradient showing through — pixel-for-pixel the
reference's anatomy. Rows 2/6/9/16 updated above; rows 7/8/10-25 unaffected (re-spot-checked gap and
slot rows).

## Changed files
- `src/app/(tabs)/index.tsx` — week-strip block rewritten (letters + date-number state cells, equal-center pitch, today circle, dot indicator, breathing animation)
- `src/presenters/derive.ts` — additive `weekDates` field on both `deriveTodayView` return branches
- `src/presenters/types.ts` — additive `weekDates: number[]` field on `TodayView`
- `src/utils/clock.ts` — additive `weekDates(now)` helper (mirrors `weekCompletion`'s Sunday-anchored week math)

No other files touched. Not committed, per instructions.
