# metric-rows — Phase 1 scout findings

Current: `design/captures/current/progress-data.png` — "Vision profile" card, 3 rows (Reading confidence / Bands measured / Strongest band), muted-label-left / white-value-right, thin hairline separators, no icons, no sparkline, no delta/state color.

## 1. Apple Stocks — Oil & Gas watchlist (score 29/30)
- Mobbin URL: https://mobbin.com/screens/bfed4d8f-9892-4328-99e1-273c1844f891
- Screenshot: saved as design/references/metric-rows/candidate-3.png
- Convergence: 5 — three-column row (label stack / sparkline / value+delta badge) also seen in Yahoo Finance and Crypto.com watchlists this session; this is the canonical iOS metric-row-with-sparkline layout.
- Tier: 5 — Apple system app, absolute benchmark.
- Invisibles ×2: 5 — sparkline is optically sized to the row (never dominates label/value), 1px hairlines between rows, tabular-figure price alignment, delta is a real filled color badge (not just red/green text) — genuine state encoding.
- Adaptability: 4 — true black background survives as-is; red/green semantic accent remaps to cyan/amber easily; full watchlist needs consolidating into our single-card 3-row count but the per-row anatomy transfers directly.
- Measurability: 5 — native res, label/sparkline/value/badge all crisp and legible, multiple rows show the pattern at scale.
- One-line why: this is the only candidate that actually proves sparkline proportion inside a metric row — ours has none, and this shows exactly how small it should stay.

## 2. Oura — Readiness contributors (score 27/30)
- Mobbin URL: https://mobbin.com/screens/e745b574-5055-471d-8258-55460df2fa56
- Screenshot: saved as design/references/metric-rows/candidate-2.png
- Convergence: 3 — row = label left / status word right / thin proportional bar beneath, repeated consistently across Oura's Readiness/Sleep/Activity tabs; less common outside Oura but a clean, legible solve.
- Tier: 5 — Oura, quantified-self benchmark app.
- Invisibles ×2: 5 — bar fill height is a true hairline-scale element, semantic color (red "Pay attention" / blue "Good") drives both text and bar together, consistent row height and padding, real filled vs. track bar states.
- Adaptability: 4 — the progress-bar-under-label device is a strong stand-in for "sparkline proportion" in our spec, remaps trivially to the cyan ladder, and rows can be merged into one card with dividers instead of Oura's separate rounded cards.
- Measurability: 5 — full res, label + status word + bar all readable, several distinct semantic states visible at once (Fair/Good/Pay attention).
- One-line why: proves that a metric row can carry a *visual proportion* (bar) without a full chart — the middle ground between our plain text rows and Stocks' sparkline.

## 3. WHOOP — Sleep statistics (score 25/30)
- Mobbin URL: https://mobbin.com/screens/bee12552-2907-4422-af27-33155595c4ea
- Screenshot: saved as design/references/metric-rows/candidate-1.png
- Convergence: 4 — icon-left / bold count-up value-right / small comparison figure + delta caret below, the standard WHOOP/Oura/Apple-Fitness quantified-self row grammar.
- Tier: 5 — WHOOP, benchmark quantified-self app.
- Invisibles ×2: 4 — optically-sized ghost-line icons, genuinely bold count-up numerals vs. a muted comparison figure directly beneath (not a separate row), consistent card padding, orange up/down caret as a real state marker.
- Adaptability: 3 — each metric is its own full-width rounded card (bigger footprint than our single-card multi-row); would need compressing into shared-card rows with dividers to fit our layout.
- Measurability: 5 — native res, four rows, uptrend/downtrend caret states both visible.
- One-line why: shows the discipline of pairing a bold "now" value with a small muted "baseline" figure directly under it — a legible way to add a comparison without a chart.

## 4. QuestMobile — Account balances (score 22/30)
- Mobbin URL: https://mobbin.com/screens/ce4fbad6-20f4-420b-adcd-b1fde5b006c6
- Screenshot: saved as design/references/metric-rows/candidate-4.png
- Convergence: 4 — plain label-left/value-right rows grouped under bold section headers with hairline dividers; this exact grammar recurs across fintech and utility apps broadly.
- Tier: 3 — solid mid-tier fintech product, not a design-benchmark app.
- Invisibles ×2: 3 — consistent row height, real 1px hairlines, semantic green for positive P&L, muted-label/white-value contrast — competent but plain (no icons, no active-state variety).
- Adaptability: 5 — closest structural sibling to our exact card: single container, grouped label/value rows, dark-only, no sparkline dependency, trivial hue remap.
- Measurability: 4 — high-res and legible but shows only static values, no dynamic/active states.
- One-line why: validates that our current bare label/value grammar is already close to a real fintech benchmark — the gap is section-header hierarchy and bolder section-total rows, not the row anatomy itself.

## 5. Polestar — Trip statistics (score 22/30)
- Mobbin URL: https://mobbin.com/screens/dfaa06c6-d952-4b18-949d-2386cfc182dc
- Screenshot: saved as design/references/metric-rows/candidate-5.png
- Convergence: 4 — same muted-label/white-value + hairline-divider + section-header family as QuestMobile; a near 1:1 structural match to our own "Vision profile" card (headline stat above, grouped rows below).
- Tier: 3 — decent automotive app, not benchmark-tier.
- Invisibles ×2: 3 — clean type, consistent row height/padding, genuine 1px hairlines, but no icons, no color coding, no state variety — plain execution.
- Adaptability: 5 — nearly identical container shape to ours (big headline metric + card with grouped label/value rows underneath); trivial cyan remap, our exact row count works unmodified.
- Measurability: 4 — high-res and legible, but every value is a single static reading with no visible alternate state.
- One-line why: the most literal structural mirror of our own card — useful as a sanity check that our current row skeleton is sound; what it lacks (and what 1–3 supply) is any visual encoding beyond plain text.
