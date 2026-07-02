# week-strip — locked spec (Phase 3)
Canvas detected: 1179×2556 px (@3x → 393×852 pt)

Adoption note: our current strip has letters only; per `target.md` we adopt the reference's full letter+number+dot structure (row 8 marks this ADOPTED, not carried over from our old build). Content is ours (letters = our week labels, states = driven by our completion data, hue = green→cyan) per target.md carve-outs.

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|
| **GEOMETRY** | | | | |
| 1 | Element width | Full screen width, no card, floats on dark bg | 393pt, uncarded | Visual: row sits directly on header bg #111112, no container edge visible |
| 2 | Total component height (reserved slot, tallest state incl. dot) | 192px / 64.0pt | 64pt fixed slot (prevents layout shift when dot toggles) | bbox top of letter row (y360) → bottom of dot (y551) |
| 3 | Letter-row height (cap-height band) | 22px / 7.3pt | 7.3pt cap-height row | bbox y360–382, all 7 columns identical |
| 4 | Number/state-cell height, plain digit | 39px / 13.0pt | 13.0pt cap-height | bbox y437–476, digits 6/7/8/10/11/12 all identical |
| 5 | ADOPTED — today filled-circle diameter | 105px / 35.0pt, perfect circle | 35.0pt diameter | bbox (537,405)-(641,509), w=h=105px exactly |
| 6 | ADOPTED — dot diameter (completed/scheduled indicator) | 20px / 6.7pt | 6.7pt diameter | bbox (421,531)-(441,551) and (895,531)-(915,551), identical |
| **SPACING** | | | | |
| 7 | Letter-row bottom → plain-digit-cell top | 56px / 18.7pt | 18.7pt (~space.lg+space.xs, or custom) | y381→437 |
| 8 | Letter-row bottom → today-circle top | 24px / 8.0pt (circle's own radius eats the gap — circle is vertically CENTERED on the same slot-center as plain digits, y≈456.8 for every column; circle top sits 17.5pt above that shared center vs a plain digit's ink-top sitting only ~6.6pt above it) | Center all state-cells (digit/circle) on one shared row-center 26.9pt below letter-row center; do not top-align | Circle center y457 vs plain-digit center y456.5 — match confirms shared axis |
| 9 | Digit-cell bottom → dot top (completed/scheduled states only) | 55–56px / ~18.5pt | 18.5pt | day 8: 476→531 (55px); day 11: 475→531 (56px) |
| 10 | Inter-day spacing, column-center to column-center | 158px / 52.7pt, constant across all 6 gaps (157.5–159px range) | 52.7pt fixed pitch | Letter-column centers: 114.5, 272.0, 430.0, 588.5, 747.5, 905.0, 1063.0px — arithmetic progression despite glyph widths varying 13–26px → **EQUAL-CENTER distribution (7 equal-width cells), NOT equal-gap** |
| 11 | Edge inset, screen edge → 1st/7th column CENTER | left 114.5px/38.2pt, right 116px/38.7pt | 38.4pt (symmetric, avg) | Screen edge (x0/x1179) to outer column centers |
| 12 | Edge inset, screen edge → 1st/7th glyph ink edge | left 104px/34.7pt (M), right 108px/36.0pt (S) | derived, not a direct token — cell edge ≈ center ∓ half-pitch (26.35pt) | Glyph bbox left/right edges, distinct from cell-center inset (row 11) |
| **COLOR & GRADIENT** (ref hex → mapped token) | | | | |
| 13 | Day-letter color, ALL 7 letters, ALL states (see row 22–26: no active/inactive distinction found) | `#FFFFFF` | `text.primary` `#EFF3F4` (Δ ref is pure white; luminance −3%, negligible) | Dominant-color histogram inside each letter bbox — all 7 columns return `#FFFFFF` as top mode, including the "active" Wed column |
| 14 | Past / no-activity digit (Mon 6, Tue 7) | `#545553` | `proposed: text.faint` `#2B3231` — no existing token matches this luminance; `muted` `#6E827F` and `secondary` `#A7B2B4` are both far lighter. Derived: ref-grey/ref-bg luminance ratio (≈4.96×) applied to `surface.base` `#080A0D`, holding `muted`'s hue ratio | Dominant color in digit bbox; luma formula 0.2126R+0.7152G+0.0722B against bg `#111112` |
| 15 | ADOPTED — completed-day digit tint (Wed 8) | `#A5FE00` (lime) | `accent.core` `#5BE9EC` — hue rotated into cyan ladder; "core" chosen because it's the single live/success signal on the row | Dominant color in digit bbox (404 px @ exact hex) |
| 16 | ADOPTED — completed/scheduled dot (under 8 and 11) | `#A5FE00`, identical to row 15 | `accent.core` `#5BE9EC` (mapped identically to its parent digit — one consistent "live" signal) | Dominant color in both dot bboxes, byte-identical to digit tint |
| 17 | Today filled-circle fill | `#FFFFFF` | `text.primary` `#EFF3F4` (or literal `#FFFFFF` if a true-white selection surface is preferred — it's a neutral surface, not on the hue ladder) | Dominant color, 7713/8338 sampled px |
| 18 | Today digit (inside circle) | `#000000` | `text.inverse` `#08161A` (token exists exactly for dark-text-on-light-surface) | Near-black threshold mask inside circle bbox, 519px |
| 19 | Future/plain digit (Fri 10, Sun 12) AND future-scheduled digit (Sat 11, NOT tinted despite the dot) | `#FFFFFF` | `text.primary` `#EFF3F4` (same mapping as row 13) | Dominant color in each digit bbox |
| **TYPE** | | | | |
| 20 | Day-letter | cap-height 7.3pt, stroke 3–4px/1.0–1.3pt (thin) | Nearest token `type.micro` (11pt, semibold, letterSpacing +1.4). Δ cap-height ≈ −0.7pt vs micro's implied 8.0pt cap-height (fontSize×0.727) | Cap-height bbox + stroke width at mid-glyph scanline on "M" |
| 21 | Number, all states incl. digit-in-circle | cap-height 13.0pt, stroke 6–9px/2.0–3.0pt (thick) | No token matches size+weight. `proposed: type.numeral = { fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 22, letterSpacing: -0.3 }` (fontSize derived from cap-height ÷ 0.73 bold ratio) | Cap-height bbox on digits 6/7/8/10/11/12/9; stroke width scanline confirms bold vs letters' lighter weight |
| **STATES** (every state visible in reference) | | | | |
| 22 | Past day, no activity (Mon 6 / Tue 7) | letter `#FFFFFF`, digit `#545553`, no dot | letter `text.primary`, digit `proposed:text.faint`, no dot | rows 13/14 |
| 23 | Past/current day, completed (Wed 8) | letter `#FFFFFF`, digit `#A5FE00`, dot `#A5FE00` 6.7pt Ø, 18.5pt below digit | letter `text.primary`, digit+dot `accent.core` | rows 13/15/16/6/9 |
| 24 | Today (Thu 9) | letter `#FFFFFF`, filled circle 35pt Ø `#FFFFFF`, digit `#000000`, no dot | letter `text.primary`, circle `text.primary`/`#FFFFFF`, digit `text.inverse` | rows 13/17/18/5 |
| 25 | Future day, no activity (Fri 10 / Sun 12) | letter `#FFFFFF`, digit `#FFFFFF`, no dot | letter+digit `text.primary` | rows 13/19 |
| 26 | Future day, scheduled (Sat 11) | letter `#FFFFFF`, digit `#FFFFFF` (**not tinted** — tint only fires on completed/past, not merely-scheduled), dot `#A5FE00` 6.7pt Ø, 18.5pt below digit | letter+digit `text.primary`, dot `accent.core` | rows 13/19/16/6/9 |
| **MOTION** | | | | |
| 27 | Day-state transitions (dot fade-in, circle slide when "today" advances, tint on completion) | Not measurable from static PNG | `ORCHESTRATOR-SETS` | n/a |

## Key findings worth flagging
- **No active/inactive letter color exists in the reference** — the must-cover brief assumed a letter-color state distinction; measurement shows all 7 day-letters are pixel-identical `#FFFFFF` regardless of day state. All state signaling lives in the number/circle/dot row (rows 13, 22–26).
- **Distribution is equal-center, not equal-gap** (row 10): glyph widths vary 13–26px but column centers land on an exact 158px arithmetic pitch — implement as 7 equal-width flex cells with centered content, not manual gap math.
- **Completed vs. scheduled-only are visually distinct**: a dot alone (Sat 11, future) does NOT tint the digit; tint + dot together (Wed 8) signals "already elapsed and done." Our data model must expose both flags independently (`hasActivity` for the dot, `isCompleted`/`isPast` for the tint) — do not conflate them into one boolean.
- One `proposed:` token (`text.faint`) and one `proposed:` type ramp entry (`type.numeral`) — both flagged above with derivation math, ready for tokens.ts review.
