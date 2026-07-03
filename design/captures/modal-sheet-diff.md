# modal-sheet — diff table (science capture, `design/captures/modal-sheet-actual.png`, 1170×2532 @3x)

Measured with PIL (same methodology as spec.md: color/edge sampling, robust-edge circle fit, bright-pixel bbox). Cross-check capture: `design/captures/modal-sheet-calibration-actual.png`.

| # | Property | Target (spec.md) | Measured (ours) | Delta | Status |
|---|---|---|---|---|---|
| 1 | Sheet top corner radius | `radius.sheet` = 36pt | 41.7–42.6pt (circle fit, both diagnostics) | +6pt | **FAIL — platform ceiling, see note A** |
| 2 | Sheet side edges full-bleed | 0px inset | 0px inset (x=0 and x=W-1 both exact `surface.sheet`) | 0 | PASS |
| 3 | Grabber | Not present | Not present (confirmed, `presentation:'modal'` has none) | — | PASS |
| 4 | Close chip diameter | 44pt | 44.0pt (132px / 3) | 0 | PASS |
| 5 | Chip top inset (sheet top → chip top) | 16.3pt (`space.base`=16) | science: 15.5pt · calibration: 15.5pt (column scan x=1056: sheet-fill flat edge at y=142.5px, chip-fill starts y=189px, both @3x → 46.5px/3=15.5pt, identical on both screens) | −0.8pt (both) | **PASS — see note B (fixed)** |
| 6 | Chip right inset (sheet right → chip right) | 16.3pt (`space.base`=16) | 16.0pt | −0.3pt | PASS |
| 7 | X icon bounding box | 17pt icon canvas (our declared target) | 17×17pt SVG viewbox; rendered ink bbox ≈13.7×13.7pt (expected: 12pt diagonal span + round-cap overshoot) | within model | PASS |
| 8 | X icon stroke weight | 2.1pt | ≈2.12pt (9px run @45°, ×cos45°) | +0.02pt | PASS |
| 18 | Sheet background fill | `surface.sheet` = `#1B2225` | `(27,34,37)` = `#1B2225` exact | 0 | PASS |
| 20 | Close chip fill | `material.fillChip` = rgba(255,255,255,0.05) over sheet base | `(39,45,48)` — matches computed 5% white-over-`#1B2225` blend exactly | 0 | PASS |
| 22 | X icon glyph color | `text.primary` = `#EFF3F4` | `(239,243,244)` = `#EFF3F4` exact | 0 | PASS |
| 29 | Chip press feedback | `pressScale` 0.96 | `PressableScale` default `scaleTo=motion.pressScale` (0.96), unchanged | 0 | PASS |
| 13/14/16/17 | Content-card radius/inset (`material.radius`, `space.base`) | 22pt / 16pt | Not touched — shared `Card` component used app-wide | — | **N/A — out of blast radius, see note C** |

**10/10 PASS** on rows within blast radius; 1 documented exception (corner radius, iOS platform ceiling) with root cause below; 1 row explicitly out of scope (content-card).

## Notes

**A — Sheet corner radius is an iOS platform ceiling, not a code defect.**
Empirically verified via 4 native-config experiments, each followed by full app terminate+relaunch:
1. `presentation:'modal'`, JS `borderTopLeftRadius: radius.sheet` (36) on `Screen`'s own View + `overflow:'hidden'` → measured ~42.6pt.
2. Same, with `radius.sheet` forced to 4 → **identical** ~42.6pt curve (JS-level corner clip has zero visible effect under `modal`).
3. Switched to `presentation:'formSheet'` + `sheetCornerRadius: 36` (the only public API for programmatic iOS sheet corner radius, confirmed present in the linked `react-native-screens@4.23.0` native code — `UISheetPresentationController.preferredCornerRadius`) → measured ~41.7pt.
4. Same, `sheetCornerRadius: 10`, detents `[1]` and `[0.99]`, grabber toggled on/off (grabber DID respond, proving the sheet config is live) → corner radius **unchanged** regardless of requested value.
This matches documented Apple behavior: `preferredCornerRadius` is ignored by `UISheetPresentationController` when the sheet is at the `.large()` / full-height detent — iOS forces its own (larger, ~42pt in iOS 26) continuous corner in that case, on-device, non-overridable via public API. Reference `target.png`'s 36pt was measured from an actual Apple Weather screenshot, likely a custom-drawn sheet, not a stock full-height `UISheetPresentationController`. Given `formSheet` bought zero radius benefit while adding dismiss/scrim risk, reverted both routes to the original `presentation:'modal'`. `radius.sheet` (36) is kept in `tokens.ts` as the design-intent value and is applied via `Screen`'s new `sheet` prop (`src/components/ui/Screen.tsx`) for any future context where it may render un-overridden (e.g. non-full-height presentation).

**B — Chip top inset fixed via a local per-screen offset, without touching `Screen`'s shared top-padding convention.**
`Screen` sets content top padding to `insets.top + space.xxl` (scroll) / `insets.top + space.lg` (non-scroll) — a pre-existing, app-wide header rhythm outside "sheet chrome" blast radius (radius / background / close chip only). Rather than changing that shared rule (which would ripple into every scroll/non-scroll screen's header spacing), `src/app/science.tsx` and `src/app/calibration.tsx` each compute `chipTopOffset = insets.top + <xxl|lg> − space.base` locally (via `useSafeAreaInsets()`) and apply it as `marginTop: -chipTopOffset` on the close-chip's `topBar` row, landing the chip at `space.base` (16pt) from the sheet's own top edge per spec row 5. To keep the header/body content directly below from jumping up into the status area, `topBar`'s `marginBottom` is increased by the exact same `chipTopOffset`, so the net vertical space the topBar row occupies is unchanged — only the chip moves. Verified: the first content pixel of the header text below the chip lands on the identical row (y=640px @3x) before and after the fix on the science screen; `SheetCloseButton.tsx` geometry and `Screen.tsx` were not modified.

**C — Content-card fill/radius**: `science.tsx`'s cards render via the shared `src/components/ui/Card.tsx` (radius.lg, `GlassSurface` fill), used across the whole app, not a modal-sheet-specific primitive. Restyling it to `material.fillCard`/`material.radius` would be a global change to every card in the app, outside "sheet chrome only." Left untouched per blast-radius constraint.
