# paywall — diff table (Phase 4 rev 2, vs `design/references/paywall/spec.md` + VALIDATION.md law 11)

Capture: `design/captures/paywall-actual.png` (iPhone 16e sim, 1170×2532 px @3x → 390×844pt).
Rev 2 addresses the Fable-lock rejection: (1) stack order restored to the reference's
headline → checks → plan card → CTA → legal (was: card last, below legal); (2) headline +
supporting caption LEFT-aligned at the spec's 32pt content margin (was: centered). Orb stays
centered (approved illustrative deviation). Card treatment, FREE-badge overlap, check glyphs,
chips were approved in rev 1 and are unchanged.

Method: PIL pixel scans on the capture (accent-band classification, bright-text left-edge
scans, CTA flat-fill bbox — `measure_v2.py`) plus exact source values where the row is a
token (our code has zero measurement uncertainty). Our screen renders over the animated
`AmbientGradient`, so scans were run on isolated y-bands to avoid background-bloom false
positives. Every row verified by eye against `target.png` (A/B image).

## GEOMETRY

| # | Property | Spec target | Our measured/actual | Method | Verdict |
|---|---|---|---|---|---|
| 1 | Top badge slot | Chip primitive reused, at left content margin above headline | `FilledChip` measured: 19.7pt tall, left edge x=32.0pt, sits above headline (reference slot position) | PIL band scan | PASS |
| 2 | Plan-badge chip | h=19.3pt, `radius.pill` | Measured 19.7pt tall, straddling card top border | PIL band scan | PASS (Δ0.4pt) |
| 3 | Checkmark glyph | 14.0×9.7pt | Svg 14×10 box; measured glyph band 9.0pt tall, left edge 32.7pt | PIL band scan | PASS (Δ0.7pt) |
| 4 | Feature-row pitch | 32.1pt (single-line ref rows) | Measured 52.0pt top-to-top (glyph bands at 362.3/414.3/466.3pt) | PIL band scan | **CARVE-OUT** — our copy wraps to 2 lines (`type.body` 24pt ×2); row rhythm token (`space.xs` gap) matches, absolute pitch can't with wrapped text |
| 5 | Checkmark→text gap | 10.7pt | Feature text left edge measured 58.7pt = 32.7 (glyph left) + 14 (glyph) + 12 (`space.md`) | PIL left-edge scan | PASS (Δ+1.3pt, spec-accepted nearest token) |
| 6 | Plan card outer bbox | Carve-out: ONE card, full content width | Measured x 24.0–365.3pt (= Screen's `space.lg` column, full width); height content-driven ≈123.7pt (3 text rows vs. ref's fixed 106.3) | PIL band scan | PASS (law 11 anatomy; height intrinsic) |
| 7 | Card corner radius | ≈9.0 → `radius.md`(10) | `radius.md` = 10 | Source (exact) | PASS (law 11 binding) |
| 8 | Card border width | 1.0pt | `hairline.px1` = 1 | Source (exact) | PASS |
| 9 | Selection radio | 20pt (ref) | Not built | — | **CARVE-OUT** (single card: nothing to select against; badge + border carry the signal) |
| 10 | Badge chip padding | h:12 / v:~6 recommended | `paddingHorizontal: space.md`(12), fixed 20pt height | Source (exact) | PASS |
| 11-12 | CTA bbox / radius | ref 44.3pt h, 9.2pt radius | CTA law governs: measured h=47.7pt (48 spec'd), `radius.pill` | PIL bbox + source | N/A — superseded by CTA law (correctly) |

## COLOR

| # | Property | Spec target | Our value | Verdict |
|---|---|---|---|---|
| 13 | Card fill | = page bg, zero elevation, no glass | Transparent `View` over the ambient canvas (same zero-elevation role); `GlassSurface` removed | PASS |
| 14 | Shared accent tint | one tint for check/border/badge | `accent.core` for all three (verified: all accent bands in scan match #5BE9EC within tol) | PASS |
| 15 | CTA fill | saturated accent | CTA law's isoluminant ramp | N/A (law-governed) |
| 16 | Unselected border | ref-only | Not built | **CARVE-OUT** |
| 17 | Ink on accent fills | `text.inverse` | `color="inverse"` on both `FilledChip` instances | PASS |
| 18 | Headline text | near-white | `text.primary` | PASS |
| 19 | Feature/price text | `secondaryBright` proposed | `color="secondary"` (nearest token exposed by AppText's ColorKey; `secondaryBright` exists in tokens.ts but isn't in the AppText union — kept AppText rather than bypass it) | PASS (documented) |
| 20-21 | Billed / legal captions | `text.secondary`-family | `muted` (billed-analog) / `secondary` (legal) | PASS |

## MATERIAL

| 22 | No blur/glass/shadow | flat or stroked only | Plain bordered `View`; no glass anywhere on the element | PASS |

## TYPE

| # | Property | Spec target | Our value | Verdict |
|---|---|---|---|---|
| 23 | Headline | `type.title` (28/34/−0.4) | `variant="title"` | PASS |
| 24 | Feature-row text | `type.body` | `variant="body"` | PASS |
| 25 | Badge label | `type.caption` bold | caption + `fontFamily.bold` override | PASS |
| 26 | Plan-card title | `type.bodyStrong` | `variant="bodyStrong"` | PASS |
| 27 | Plan price row | `type.caption` | `variant="caption"` (copy carve-out fills the slot) | PASS |
| 28 | Billed caption | `type.micro` | `variant="micro"` | PASS |
| 29 | CTA label | CTA law governs | `variant="heading"` via PrimaryButton | N/A |
| 30 | Legal caption | `type.micro` | `variant="micro"` | PASS |

## SPACING

| # | Property | Spec target | Our measured/actual | Verdict |
|---|---|---|---|---|
| 31 | Left content margin (badge/headline/caption/features) | 32.0–33.0pt | Measured: chip 32.0 / headline 33.7 (glyph side-bearing on a 32.0 box) / subtitle 32.7 / check glyph 32.7 — `headerBlock`+`features` add `space.xl − space.lg` over Screen's 24 | PASS |
| 32 | Plan-card margins | ≈27pt | 24.0pt both sides (Screen's `space.lg` column, full-width carve-out baseline) | PASS (Δ3.0 = spec's own accepted token delta) |
| 33 | CTA margins | law: 32pt total | Measured 32.0 / 32.7pt | PASS |
| 34 | Badge→headline gap | 22.7pt | `space.base`(16) — compressed | **ADAPTED** (documented: subtitle + secondary button the ref doesn't carry must fit the same 844pt) |
| 35 | Headline→features gap | 61.3pt | `space.base`(16) after the subtitle block — compressed | **ADAPTED** (same fit rationale, commented in source) |
| 36 | Last check row→next block | 36.7pt | `space.lg`(24) to the plan card — compressed | **ADAPTED** (next block differs structurally: card, not the "Plus…" caption) |
| 37 | Card-bottom→CTA-top | 25.3pt | Measured 24.3pt (card border bottom 642.7 → CTA fill top 667.0) — now directionally 1:1 with the reference order | PASS (Δ1.0pt) |
| 38 | CTA-pair→legal gap | 17pt | `actions` gap 12 + `marginTop: 5` = 17 (anchored to the pair's last button) | PASS |
| 39-43 | Card internals | left 13 / top 21 / title→price 6.3 / price→billed 26.3 / bottom 13.7 | left `space.md`(12) Δ1.0 · top 16 (compressed) · title→price 6 Δ0.3 · price→billed 16 (compressed) · bottom `space.md`(12) Δ1.7 | PASS / ADAPTED as noted, each commented in source with the spec row cited |

## STATES

| 44 | Card — selected | `accent.core` border + badge | Only shipped state: 1pt accent.core border + overlapping "FREE" chip | PASS |
| 45-46 | Unselected / radio | ref-only | Not built | **CARVE-OUT** (law 11) |

## Stack order & alignment (Fable-lock rev 2 rulings — both defects closed)
1. Order now bit-identical to the reference: orb (ours, centered) → badge chip → headline →
   caption → checkmark features → plan card → CTA pair → legal caption as the final line.
2. Headline + caption left-aligned at the 32pt content margin (measured row 31); features
   share the same margin; orb keeps the approved centered treatment.
3. Space math: full stack fits 844pt — legal caption bottom lands ≈824pt. Compressions
   required for fit are rows 34/35/36/40/42, each documented at the style site.

## Summary
- PASS: 27
- ADAPTED (documented fit compressions): 5
- CARVE-OUT (law 11 / dispatch carve-outs): 4
- N/A (superseded by CTA law): 4
- 0 unexplained FAIL — both Fable-lock defects (stack order, alignment) closed and re-measured
