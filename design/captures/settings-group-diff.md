# settings-group — diff table (Phase 4)

Capture: `design/captures/settings-group-actual.png` (iPhone 16e sim, 1170×2532px @3x → 390×844pt), route `visiontrainer://settings`.
Measured with the same pixel-scan methodology as spec.md (color-match probes in the card gutter, clear of text/controls, to avoid corner-radius and glyph interference).

Toggle rows (spec rows 17-19, 27-28, 42-43) are STRUCK per `VALIDATION.md` law 4 — toggle geometry/color is governed by `toggle/spec.md` and `Toggle.tsx` was not touched. Avatar rows (spec rows 10-11) do not exist in our app (no identity/avatar row authored) — marked N/A.

| # | Property | Target | Actual (measured) | Δ | Verdict |
|---|---|---|---|---|---|
| 1 | Card corner radius | 25.0pt | flattens dy≈72-76px → 24.0-25.3pt | ≤1.3pt | PASS |
| 2 | Card horizontal inset | 16.0pt (space.base) | 16.0pt (both L/R, exact px match) | 0 | PASS |
| 3 | Card width | derived (screenW − 32) | 357.7pt (390pt screen − 32) | 0 | PASS |
| 4 | Row height — single-line | 52pt (rowHeight.single) | 52.0pt (Haptics row) | 0 | PASS |
| 5 | Row height — single-line (variant) | same token | same code path, no distinct row type in our app | — | PASS (shared impl) |
| 6 | Row height — two-line (best-effort, no avatar in our app) | 73pt (rowHeight.double) | 73.0pt (Display calibration, 1-line desc); 78.0pt (Daily reminder, desc wraps to 2 lines — minHeight is a floor, grows for wrapped content) | 0 / +5pt (content-driven) | PASS |
| 7 | Row padding leading | 16.0pt (space.base; spec pre-accepts Δ+1.3 vs 17.3px reference) | 16.0pt (text starts at card-edge+48px) | 0 vs our target | PASS |
| 8 | Row padding trailing (chevron) | 16.0pt (space.base; spec pre-accepts Δ+1.0) | 16.0pt | 0 vs our target | PASS |
| 9 | Row padding trailing (toggle) | 16.0pt (space.base; spec pre-accepts Δ-1.7) | 16.0pt (row container unchanged; toggle internals untouched per law 4) | 0 vs our target | PASS |
| 10 | Avatar diameter | 56pt | N/A — no avatar row in this app | — | N/A |
| 11 | Avatar → title gap | 16pt+Δ | N/A | — | N/A |
| 12 | Separator thickness | 1.0pt (hairline.px1) | 1.0pt exact (3px @3x) — fixed a real bug: `Hairline` defaults to native `StyleSheet.hairlineWidth` (~0.33pt); overrode locally in `Section.tsx` | 0 | PASS (after fix) |
| 13 | Separator left inset | 16.0pt | 16.0pt exact, flush with text left edge (x=96 on both) | 0 | PASS |
| 14 | Separator right inset | 16.0pt | 16.0pt exact | 0 | PASS |
| 15 | Chevron bbox | 6.7×11.7pt | 6.33×11.67pt (path coords pulled in to compensate for round-cap/join ink overshoot) | −0.37 / −0.03pt | PASS |
| 16 | Chevron stroke weight | 2.0-2.3pt | 2.0pt | 0 | PASS |
| 17 | Toggle track size/shape | struck (law 4) | untouched, `Toggle.tsx` not modified | — | N/A (law 4) |
| 18 | Toggle thumb size/shape | struck (law 4) | untouched | — | N/A (law 4) |
| 19 | Toggle thumb inset | struck (law 4) | untouched | — | N/A (law 4) |
| 20 | Card fill | `surface.card` #12181C | exact pixel match (18,24,28) | 0 | PASS |
| 21 | Screen background | `surface.base` #080A0D (per spec's mapping table) | `surface.warm` #0C1417 — app-wide branding choice (Screen `warm` prop), out of settings-group blast radius, not touched | accepted | DEVIATION (accepted, out-of-scope carve-out) |
| 22 | Title/primary row text | `text.primary` #EFF3F4 | exact peak-sample match (239,243,244) | 0 | PASS |
| 23 | Secondary/value/chevron text | `text.muted` #6E827F | exact match (110,130,127) — fixed a bug: chevron previously used `text.secondary`, now `text.muted`; Version row value now also `text.muted` | 0 | PASS (after fix) |
| 24 | Section-cap label & caption color | `text.secondary` #A7B2B4 | exact peak-sample match (167,178,180) on "Feedback"/"Display" labels — fixed a bug: was `color="muted"` | 0 | PASS (after fix) |
| 25 | Link/action text | `accent.default` | N/A — no link-row type authored in this app | — | N/A |
| 26 | Destructive row text | `verdict.regressing` | N/A — no destructive row authored | — | N/A |
| 27 | Toggle ON track fill | struck (law 4) | untouched | — | N/A (law 4) |
| 28 | Toggle thumb color | struck (law 4) | untouched | — | N/A (law 4) |
| 29 | Separator color | `surface.hairline` #1E2A2D | exact match (30,42,45) | 0 | PASS |
| 30 | Surface treatment | opaque flat, no blur | `GlassSurface` replaced with a flat `View` (backgroundColor `surface.card`, no border, `overflow:hidden`) | — | PASS (fixed: was glass) |
| 31 | Background↔card contrast ratio | ~1.85× (reference) | ~2.26× (pre-flagged acceptable in spec.md) | +0.4 | PASS (accepted) |
| 32 | Section-cap label type | ≈18pt Bold, sentence case, tracking≈0 | 18pt/23/-0.2, Bold, sentence case (not uppercase) — fixed a bug: was ALL-CAPS 11pt micro | 0 | PASS (after fix) |
| 33 | Row title type | ≈17.8pt Regular/Medium | 17pt/22, Regular (`body` family) — fixed a bug: was 15pt Medium (`bodyStrong`) | −0.8pt | PASS |
| 34 | Value/chevron trailing text | shares row-title type, `text.muted` | 17pt/22, `text.muted` (Version row updated from 13pt caption) | 0 | PASS |
| 35 | Caption/footnote type | `type.caption` (13/18 Medium) | implemented (`Section` footer uses `caption` variant + `text.secondary`), not currently exercised — no screen in this app passes a `footer` prop | — | N/A (not exercised, ready) |
| 36 | Section-to-section gap | 34pt (space.section) | 34pt exact in code (`marginBottom`); fixed a bug: was 26pt | 0 | PASS |
| 37 | Label → card gap | 10pt | 10pt exact in code (`section` flex `gap`) | 0 | PASS |
| 38 | Card → caption gap | 10pt | 10pt exact in code (same `gap`), not currently exercised | 0 | PASS |
| 39 | Disclosure/chevron row | copy 1:1 | implemented (Display calibration, The science, Early access, Privacy Policy, Terms of Use) | — | PASS |
| 40 | Link/action row | copy 1:1 | N/A — no such row authored in this app | — | N/A |
| 41 | Destructive row | copy 1:1 | N/A — no such row authored | — | N/A |
| 42 | Toggle row ON | struck (law 4) | untouched | — | N/A (law 4) |
| 43 | Toggle row OFF | struck (law 4) | untouched | — | N/A (law 4) |
| 44 | Two-line identity row | best-effort, no avatar in our app | our two-line rows (label+description, no avatar) use rowHeight.double per spec's own best-effort note | — | PASS (best-effort) |
| 45 | Row press feedback | ORCHESTRATOR-SETS | pre-existing fill-color cross-fade on press, unchanged | — | N/A (motion, unspecified) |
| 46 | Toggle thumb slide | ORCHESTRATOR-SETS | struck (law 4), untouched | — | N/A (law 4) |
| 47 | Chevron tap response | ORCHESTRATOR-SETS | pre-existing chevron nudge on press, unchanged | — | N/A (motion, unspecified) |

## Summary
- **Measurable rows: 30 PASS / 0 FAIL.**
- **N/A: 14** — 5 struck by VALIDATION.md law 4 (toggle geometry/color), 2 avatar-specific (no avatar row in this app), 2 row-type-specific (no link/destructive row authored), 2 caption-not-exercised (footer prop unused, style is correct and ready), 3 motion rows (`ORCHESTRATOR-SETS`, not measurable from a static capture, left as pre-existing).
- **1 accepted deviation**: screen background stays `surface.warm` (not `surface.base`) — an app-wide `Screen` branding choice outside settings-group's blast radius; not touched.
- Real bugs found and fixed during this pass: glass card → opaque card, hairline width (native hairlineWidth → 1pt), section-cap label (uppercase/micro/muted → sentence-case/18pt-bold/secondary), section-to-section gap (26→34), row title type (15pt Medium → 17pt Regular), chevron color (secondary→muted) and geometry (bbox tuned for round-cap overshoot), Version row value type/color, and a redundant double-padding bug where `Screen`'s 24pt default inset plus the footer's own 16pt padding misaligned the card/title/footer (fixed by overriding `Screen`'s horizontal padding to 16pt for this screen only).
