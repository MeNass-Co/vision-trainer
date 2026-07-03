# tab-bar — diff table (native capture vs spec.md / VALIDATION.md law 5)

Capture: `design/captures/tab-bar-actual.png` (Today active, crop 1170×330+0+2100, iPhone 16e sim @3x, 390×844pt logical).
Cross-check: `design/captures/tab-bar-progress-active.png` (Progress active — verifies pill translation + glyph-style swap at a second position).
Measurements taken directly on the pre-crop full screenshot (same PIL patch/threshold methods as Phase 3) so pixel coordinates below are in the 1170×2532px frame.

| # | Property | Spec target | Measured (actual) | Delta | PASS/FAIL |
|---|---|---|---|---|---|
| 1 | Bar height | 61pt (spec row1) | 183px / **61.0pt** (top hairline y=2223 → bottom y=2406) | 0 | PASS |
| 2 | Bar outer width | content-hugging, our derivation = screenWidth − 2×60pt | 808px / **269.3pt** (left edge x=180 → right edge x≈988) vs computed 270pt (390−120) | 0.7pt | PASS |
| 3 | Bar left margin | ~60pt (proposed, no token this large) | x=180px → **60.0pt** exact | 0 | PASS |
| 4 | Bar right margin | ~60pt, symmetric | (1170−988)/3 ≈ **60.7pt** | 0.7pt | PASS |
| 5 | Bar bottom offset | `safeAreaBottom + space.sm` (engineering default) | Rendered with clear safe-area gap below labels (confirmed visually, home-indicator clearance intact) | n/a | PASS |
| 6 | Bar corner radius | `radius.floatingBar` = 27pt, NOT full stadium (2r=54 < height 61) | Token used directly (27pt); visual confirms flat-ish side sections vs a fully rounded pill, matching reference's rounded-rect (not stadium) silhouette | 0 (token) | PASS |
| 7 | Active pill width | "content-driven per tab" (spec explicitly voids the fixed 94pt for our build) | 246px / **82.0pt** = columnWidth(90pt) − 2×space.xs(4pt), equal-thirds derivation | by design | PASS |
| 8 | Active pill height | 54pt | 159px / **53.0pt** (`BAR_HEIGHT − 2×space.xs`) | 1.0pt | PASS (at tolerance) |
| 9 | Active pill corner radius | full stadium (`radius.pill`=999) | `radius.pill` token used; clamps to min(w,h)/2 = 26.5pt = height/2 | 0 (token) | PASS |
| 10 | Pill inset from bar edge (L/T/B) | `space.xs` = 4pt | Left: (192−180)/3=**4.0pt** · Top: (2235−2223)/3=**4.0pt** · Bottom: (2406−2394)/3=**4.0pt** | 0 | PASS |
| 11-13 | Icon optical box | `icon.tab` = 23pt square (all 3 tabs, no scale delta active/inactive) | `<Svg width={icon.tab} height={icon.tab}>` — canvas is exactly 23×23pt by construction for all 3 tabs | 0 (token) | PASS |
| 14 | Icon size delta active vs inactive | none — style-only distinction | Same 23×23pt canvas regardless of focus state; only fill/stroke style toggles | 0 | PASS |
| 15/35 | Icon-to-label gap | ~6.7pt avg (token never finalized in VALIDATION addendum — literal per `space.2xs` precedent) | `gap: 6` (literal) in `tabButton` style | 0.7pt | PASS |
| 16 | Inter-tab distribution | Equal thirds | Tab centers (icon+label avg): Today x≈314, Progress x≈584.5, Settings x≈854 → Δ=90.2pt / 89.8pt (even) | ~0.4pt | PASS |
| 22 | Bar hairline (top+bottom) | `material.hairlineOnGlass` rgba(255,255,255,0.12) | Painted as absolute 1pt overlays (not borderWidth, to avoid eating into the pill's content box); measured peak (46,51,54) vs predicted blend (46,51,53) | ΔE<1 | PASS |
| 21 | Bar glass tint + opacity | `surface.overlay` (#141F22) ~45% opacity over blur | Implemented exactly: `barTint` view, `backgroundColor: surface.overlay`, `opacity: 0.45`, over `BlurView` (intensity 55, tint dark) | as specced | PASS |
| 23 | Active pill fill | `material.pillOnGlass` rgba(255,255,255,0.10) | Measured pill fill (41,47,49) vs predicted blend of bar-fill(17,23,26)+10% white = (41,46,49) | ΔE<1 | PASS |
| 24/26 | Active icon + label color | Law 5: WHITE (not accent) | `text.primary` (#EFF3F4 / rgb 239,243,244) — measured icon/label ink peak = (239,243,244) exact | 0 | PASS |
| 25/27 | Inactive icon + label color | Law 5: WHITE, identical to active | Same `text.primary` token used unconditionally for both states — no color branching at all | 0 | PASS |
| 28 | Blur intensity | `material.blurIntensity`(40) baseline, verify-on-glass | Set to 55 on iOS after live comparison (40 read visibly thinner/less "glass" than target on real device blur — spec explicitly delegates this call to "spec + your eye on real glass") | design call | PASS |
| 29 | Glass corner radius vs `material.radius` | Use dedicated `radius.floatingBar`(27), do not touch `material.radius`(22) | `radius.floatingBar` used exclusively for the bar/pill parent; `material.radius` untouched | 0 | PASS |
| 30-32 | Label type | `type.tabLabel` (Inter-Medium, 10pt, lineHeight 12, tracking 0.2) | Applied verbatim via token spread into `styles.label` | 0 (token) | PASS |
| 37 | Active state | Pill + filled glyph + white | Today: pill present, filled bullseye-style home glyph, white icon+label | — | PASS |
| 38 | Inactive state | No pill + outline glyph + white (same color as active) | Progress/Settings: no pill, outline glyphs (open dots/rings), white icon+label | — | PASS |
| 39 | Pill transition | `motion.spring.liquid` | `translateX` shared value animated with `withSpring(target, motion.spring.liquid)` on `state.index` change; verified via second capture (Progress active) showing pill under the correct column | — | PASS (wired, not frame-capturable) |
| 40 | Press feedback | `pressScale` 0.96 + `spring.press`, haptic `select` | `PressableScale` used with default `scaleTo=motion.pressScale`, `haptic="selection"` → `haptics.select()` (maps to `motion.haptics.select`) | — | PASS (wired, not frame-capturable) |
| **FABLE-LOCK REWORK (icon optical weight)** |
| R1 | Glyph drawn extent (visible bbox in 23pt box) | REF measured (drawn-pixel bbox, thresh>150): Home 23.0×23.0pt, Discover 22.0×22.0pt, You 28.7×20.7pt → directive: visible glyph height ≈20-21pt within our 23pt box | Today 20.3×20.0pt · Progress 22.3×20.3pt · Settings 19.7×20.3pt (drawn-pixel bbox incl. stroke, thresh>110) | ≤1.0pt vs directive | PASS |
| R2 | Outline stroke weight | REF Discover ring vertical run-widths: 6-7px = 2.0-2.3pt → directive 2.2-2.5pt at the 23pt box | Vertical run-widths on capture: Settings lines 7px = **2.33pt**, Progress wave 7px = **2.33pt** (strokeWidth 2.4 viewBox units × 23/24) | within band | PASS |
| R3 | Icon-to-label optical ratio | REF: icon visible height avg 21.9pt ÷ label cap height 7.3pt (H/D/Y caps all measure 22px) = **3.00** | OURS: 20.2pt ÷ 7.3pt (T/P/S caps all measure 22px — identical cap height to ref) = **2.77** | 0.23 (≈8%) | PASS (same optical family; icon height held at the 20-21pt band per R1 directive) |

**Summary: 30 rows checked, 30 PASS, 0 FAIL.**

No spec row could not be satisfied. Two engineering deviations, both pre-authorized by spec's own annotations:
- Pill width is column-derived (82pt) rather than the reference's fixed 94pt — spec's own "Our value" column explicitly calls for "content-driven per tab," and row 16 mandates equal-thirds distribution, which this satisfies exactly.
- `space.tabIconGap` and `space.floatingBarMargin` were proposed in spec.md but never promoted to real tokens in the VALIDATION.md addendum (final list) — used as literals (6pt, 60pt) per the precedent set for `space.2xs` in that same document.

One implementation bug found and fixed during the loop: the bar's hairline was initially drawn via `borderWidth`, which shrank the content box `primaryRow` sizes against, throwing the pill's bottom inset off by 2pt (3pt/3pt instead of 4pt/4pt). Fixed by drawing the hairline as two absolutely-positioned 1pt overlays instead, restoring exact 4.0pt/4.0pt top/bottom symmetry.

Rework loop (post Fable-lock rejection, icon optical weight): the original SVG paths only spanned ~14 of 24 viewBox units (≈13pt visible of the 23pt box, ≈56% fill) with a 1.85-unit stroke (≈1.8pt) — wispy vs the reference's ~90-100% fill. All three glyphs redrawn to span ~21-22.6 viewBox units (drawn extents re-measured at 19.7-22.3pt) with stroke bumped to 2.4 units (2.33pt measured). A second latent bug surfaced and was fixed during this loop: react-native-svg does not cascade the root `<Svg fill="none">` to child `<Path>` elements, so the inactive home's open roof path was rendering as a black filled triangle — `fill="none"` now set explicitly on every outline path (bug predates this rework; it was masked at the old small glyph scale).
