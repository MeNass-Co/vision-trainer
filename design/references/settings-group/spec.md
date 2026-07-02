# settings-group — locked spec (Phase 3)
Canvas detected: 1179×2556 px (@3x → 393.0×852.0 pt)
Source: Apple TV app — Account settings sheet, grouped list (opaque cards, not glass, per target.md).

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| **GEOMETRY** | | | | |
| 1 | Card corner radius | 75px → 25.0pt (fixed, same on 1-row and 3-row-tall cards — confirmed by testing 3 different card heights) | `proposed: radius.xl = 25` (current max non-pill is `radius.lg`=14, an 11pt gap too large to reuse) | Row-by-row leftmost-fill-pixel scan into top-left corner on 3 cards (158px, 218px, 310px tall); flattens to card edge at dy≈74-80px on all three |
| 2 | Card horizontal inset (screen edge → card edge) | 48px → 16.0pt, symmetric L/R | `space.base` (16) — exact match | Horizontal pixel scan at 3 different row y-values; left edge transition at x=48, right edge at x=1131 on every card |
| 3 | Card width | 1083px → 361.0pt (= 393 − 2×16) | derived, no token needed | Computed from row 2 |
| 4 | Row height — single-line, value+chevron (Connected Apps, Play Next Episode) | 157px → 52.3pt | `proposed: rowHeight.single = 52` | Vertical scan, card-fill-to-bg transition, x=950 (clear of content) |
| 5 | Row height — single-line, text-link/button (Manage Subscriptions, Redeem, Clear Play History) | 152-154px → 50.7-51.3pt | same token as row 4, treat variance as sub-pixel/AA noise | Vertical scan at separator boundaries inside 2-row cards |
| 6 | Row height — two-line identity row (Avatar + title + subtitle) | 218px → 72.7pt | `proposed: rowHeight.double = 73` — **low confidence**, see STATES note | Card1 top/bottom transition scan. Subtitle is a blurred/redacted placeholder graphic in the source (privacy blur), not real text, so bottom padding may be inflated |
| 7 | Row horizontal padding — leading (card edge → text) | 52px → 17.3pt | `space.base` (16), Δ+1.3pt | Text-left-pixel scan on "Connected Apps" and "Manage Subscriptions" rows — both start at x=99-100, card edge at x=48 |
| 8 | Row horizontal padding — trailing, chevron row | 51px → 17.0pt (card edge → chevron right edge) | `space.base` (16), Δ+1.0pt | Chevron bbox right edge (x=1080) vs card edge (x=1131) |
| 9 | Row horizontal padding — trailing, toggle row | 43px → 14.3pt (card edge → track right edge) | `space.base` (16), Δ−1.7pt | Toggle track bbox right edge (x=1088) vs card edge (x=1131) |
| 10 | Avatar diameter (leading icon, two-line row) | 167px → 55.7pt | `proposed: avatarSize.md = 56` | Bluish-pixel mask bbox on profile row, x102-269 / y465-632 (square, confirms circle) |
| 11 | Avatar → title text gap | 54px → 18.0pt | `space.base` (16), Δ+2.0pt | Avatar right edge (x=269) to title left edge (x=323) |
| 12 | Separator thickness | 3px core (+1px AA each side) → 1.0pt | `hairline.px1` (1) — exact match | Vertical cross-section through separator inside 2-row cards, solid color band y=1242-1244 |
| 13 | Separator left inset (from card edge) | 48px → 16.0pt (≈ flush with text-leading edge, not full-bleed) | `space.base` (16) | Horizontal scan through separator, left transition at x=96 vs card edge x=48 |
| 14 | Separator right inset (from card edge) | 48px → 16.0pt (symmetric) | `space.base` (16) | Same scan, right transition at x=1083 vs card edge x=1131 |
| 15 | Chevron bounding box | 20×35px → 6.7×11.7pt | `proposed: iconSize.chevron = {w:7, h:12}` | bbox threshold vs card-fill background, card2 chevron (x1060-1080, y886-921) |
| 16 | Chevron stroke weight | ~6-7px core → 2.0-2.3pt | ≈2pt (no direct token; matches a "medium" SF Symbol weight) | Cross-section row/column through chevron arm, solid-color run length |
| 17 | Toggle track size / shape | 188×83px → 62.7×27.7pt, fully rounded (pill, radius=41.5px/13.8pt) | `proposed: toggle.track = {w:63, h:28, radius:pill}` | Green-only pixel mask bbox + vertical/horizontal cross-sections through center |
| 18 | Toggle thumb size / shape | 109×70px → 36.3×23.3pt — **not circular**, a stadium/pill (custom control, not stock UISwitch) | `proposed: toggle.thumb = {w:36, h:23, radius:pill}` | Strict-white mask bbox + cross-sections; confirmed non-circular via crop inspection |
| 19 | Toggle thumb inset from track (top/bottom/leading-edge-of-travel) | 6-7px → 2.0-2.3pt | `space.xs`/2 ≈ 2pt, no exact token | Cross-section deltas: track edge vs thumb edge on all 3 adjacent sides |
| **COLOR & GRADIENT** | | | | |
| 20 | Card fill | `#28282A` (40,40,42) | `surface.card` `#12181C` (hue-neutral remap; see MATERIAL row 27 for contrast-ratio caveat) | Mode-color sample, multiple cards, multiple points per card |
| 21 | Screen background behind cards | `#151518` (21,21,24) | `surface.base` `#080A0D` | Mode-color sample in inter-card gaps |
| 22 | Title / primary row text (Alex Smith, Connected Apps) | `#FFFFFF` (255,255,255) | `text.primary` `#EFF3F4` — exact structural match | Peak-brightness sample over title text runs |
| 23 | Secondary/value/chevron text ("1", chevron glyph) | `#6A6B6F` (106,107,111) | `text.muted` `#6E827F` — near-exact luminance match | Peak sample over "1" digit and chevron stroke |
| 24 | Section-cap label & caption/footnote text (Sources, Auto-Play, "Clear what you've watched…") | `#9999A0` (153,153,160) | `text.secondary` `#A7B2B4` — close luminance match | Peak sample over "Sources" glyphs and caption line |
| 25 | Link/action text (Manage Subscriptions, Redeem Gift Card or Code, Allow Notifications) | `#0091FE` (0,145,254) | `accent.default` `#33D2D6` (hue rotated into cyan ladder per single-accent doctrine) | Blue-biased peak sample over link text runs |
| 26 | Destructive row text (Clear Play History) | `#FB3F42` (251,63,66) | `verdict.regressing` `#E0607A` — **explicit remap per brief**, not the accent ladder | Red-biased peak sample over destructive text |
| 27 | Toggle ON track fill | `#2CD257` (44,210,87) | **proposed remap → `accent.default` `#33D2D6`**, not a new green token — avoid a second living hue; violates "one accent" doctrine otherwise | Pure-color sample mid-track, both toggle instances (identical) |
| 28 | Toggle thumb | `#FFFFFF` (255,255,255) | `text.primary` `#EFF3F4` | Strict-white sample, thumb center |
| 29 | Separator line | `#3D3D40` (61,61,64) ≈ card fill + ~10% white overlay | `surface.hairline` `#1E2A2D` — closest relative-contrast match (+67% over card vs reference's +52%); `hairlineStrong` (+122%) overshoots | Cross-section color read + delta-vs-card-fill math |
| **MATERIAL** | | | | |
| 30 | Surface treatment | Opaque flat fill — confirmed by target.md ("cards are opaque raised surface, not glass"). No blur/translucency to sample. | Copy structure: flat opaque `surface.card` over flat opaque `surface.base`, no blur | N/A — visually confirmed, no gradient/alpha falloff detected at card edges |
| 31 | Background↔card contrast ratio | 40.7/22.0 ≈ **1.85×** (reference avg-luminance ratio) | `surface.base`(avg 10.3) → `surface.card`(avg 23.3) ≈ **2.26×** — slightly higher contrast than reference, same direction, flag as acceptable delta | Average RGB of the two mode-color samples (rows 20-21), same math applied to token hexes |
| **TYPE** | | | | |
| 32 | Section-cap label (Sources, Auto-Play) — sentence-case, NOT uppercase/tracked | cap-height 39px→13.0pt ⇒ est. fontSize ≈18pt, Bold, tracking ≈0 | `proposed: type.sectionCap = {fontFamily: bold, fontSize:18, lineHeight:23, letterSpacing:-0.2}`. Nearest existing: `type.heading` (20/26/-0.2, Medium) — Δ−2pt size, weight too light | Cap-height bbox on "Sources" (S-top→baseline, no descenders) and cross-checked on "Auto-Play" (A-top→baseline before 'y' descender) |
| 33 | Row title text (Alex Smith, Connected Apps, Manage Subscriptions) | cap-height 38px→12.7pt ⇒ est. fontSize ≈17.8pt, Regular/Medium (link & destructive rows read lighter than "Alex Smith") | `proposed: type.rowTitle = {fontSize:17, lineHeight:22, weight:regular}`. Nearest existing: `type.body` (15, Regular) Δ+2.8pt undersized | Cap-height bbox on "Alex Smith" title run, no descenders |
| 34 | Value/chevron trailing text ("1") | same size class as row 33, color = row 23 | shares `type.rowTitle`, color `text.muted` | Visual size match against adjacent row title |
| 35 | Caption/footnote under group ("Clear what you've watched…", "At the end of an episode…") | cap-height 26px→8.7pt ⇒ est. fontSize ≈12.1pt, Regular | `type.caption` (13, Medium) — **good match**, Δ−0.9pt; weight reads Regular not Medium in reference, flag minor mismatch | Cap-height bbox on "C" of "Clear", cross-checked on "At the end…" line 1 |
| **SPACING** | | | | |
| 36 | Section-to-section gap (card bottom → next card top, label optional in between) | 103-107px → 34.3-35.7pt, constant regardless of whether a section-cap label sits inside the gap | `proposed: space.section = 34` (nearest existing `space.xl`=32, Δ+2 to +4pt) | Measured on 3 independent gaps: card1→Sources label→card2, card2→card3 (no label), card3→card4 (no label) — all converge to ~34pt |
| 37 | Section-cap label → card gap (label baseline → next card top) | 30px → 10.0pt | between `space.sm`(8) and `space.md`(12); `proposed: space.labelGap = 10` | Label bbox bottom vs card top transition, measured on "Sources"→card2 |
| 38 | Card → caption gap (card bottom → footnote top) | 30-32px → 10.0-10.7pt | same as row 37, `space.labelGap = 10` | Card4 bottom vs caption1 top transition |
| **STATES** | | | | |
| 39 | Disclosure/chevron row (Connected Apps, profile row) | Trailing chevron, optional trailing value text, navigates on tap | Copy structure 1:1 | Visual + geometry rows 8, 15-16 |
| 40 | Link/action row (Manage Subscriptions, Redeem Gift Card or Code, Allow Notifications) | No leading icon, no chevron, full-row-tap text in accent color, coexists in same card as other link rows separated by hairline | Copy structure 1:1, color = row 25 | Visual inspection of card3 |
| 41 | Destructive row (Clear Play History) | Centered text (not left-aligned like other rows), no chevron, no icon — reads as a button styled into the list, isolated in its own single-row card | Copy structure 1:1, color = row 26 (`verdict.regressing`) | Visual inspection + horizontal scan showing text is centered in card4, not left-inset like rows 39-40 |
| 42 | Toggle row — ON (Play Next Episode, Play a Recommendation) | Green track, thumb slid to trailing edge, both instances identical | Copy structure, fill = row 27 (`accent.default` proposed), thumb = row 28 | Geometry rows 17-19, both toggle instances cross-checked identical |
| 43 | Toggle row — OFF | **Not measurable — no OFF-state toggle exists anywhere in the reference.** Both visible switches are ON. | Implementer must infer: track → `surface.hairlineStrong` or `surface.cardPressed`, thumb → `text.primary`, thumb slid to leading edge, per standard switch convention — **not derived from this asset** | N/A, flagged per ground rules (cannot invent) |
| 44 | Two-line identity row (avatar + title + placeholder subtitle) | Only one instance in reference; subtitle content is a blurred/redacted diagonal-gradient placeholder graphic, not legible real text | Copy structure (avatar, title, subtitle line, trailing chevron); our subtitle will be real text — vertical rhythm from row 6 is a **best-effort estimate only** | Flagged — see row 6 |
| **MOTION** | | | | |
| 45 | Row press feedback (highlight/opacity on tap) | Not visible — static PNG, no pressed-state frame captured | `ORCHESTRATOR-SETS` | Not measurable from a static image |
| 46 | Toggle thumb slide (on/off transition) | Not visible — no transition frame | `ORCHESTRATOR-SETS` | Not measurable from a static image |
| 47 | Chevron/disclosure tap response | Not visible | `ORCHESTRATOR-SETS` | Not measurable from a static image |
