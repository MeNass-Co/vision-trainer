# progress-chart — top 5 references

Element: progress chart card (CSF/trend graph + point light + confidence), inventory row 12.
Current state (`design/captures/current/progress-data.png`): CSF number hero + "Vision profile" card render cleanly; the "Last 7 days" trend card itself is below the fold and unverified against any reference — axis/gridline restraint, line weight, point treatment, and label typography are all open questions per the inventory row.

## 1. WHOOP — Recovery: Resting Heart Rate + Respiratory Rate (score 30/30)
- Mobbin URL: https://mobbin.com/screens/2e135095-0dd0-4b9b-9be8-929e204cbb81
- Screenshot: saved as design/references/progress-chart/candidate-1.png
- Convergence: 5 — hollow-circle point markers with a bold value label floating directly above/below each point is the same grammar Oura uses (candidate-3) and The Outsiders echoes with printed values on its zigzag (candidate-5); 3+ apps converge on "label the point, don't make the reader read an axis."
- Tier: 5 — WHOOP is a named benchmark app in the rubric.
- Invisibles ×2: 5 — crisp 1px hollow-ring markers, near-invisible 2-hairline gridline budget (not a grid, just two reference lines), a soft vertical "today" column tint that reads as a real active-state distinct from the rest of the week, value-label type colored to match the line hue exactly.
- Adaptability: 5 — dark graphite background, single blue accent trivially remaps to lunar cyan, stacked dual-metric card layout maps 1:1 onto our card system, and the 7-point series is literally our "Last 7 days" cardinality.
- Measurability: 5 — full width, every day labeled (Tue–Mon), every point numbered, nothing cropped.
- One-line why: proves a 7-day trend can carry a value label per point AND stay restrained — no grid at all, just two horizontal reference hairlines plus a tinted "current" column, which is exactly the discipline our CsfGraph is missing.

## 2. Weather (Apple) — Averages / Temperature (score 29/30)
- Mobbin URL: https://mobbin.com/screens/84291d12-0a0f-44a4-be2f-16607f026522
- Screenshot: saved as design/references/progress-chart/candidate-2.png
- Convergence: 4 — the "solid line + shaded expected-range band behind it" pattern is the cleanest confidence-interval analog found; the same band-behind-line idea recurred in Bevel's "Normal range" strain card and MacroFactor's "Flux Range" expenditure chart (both light-mode, so excluded as finalists but confirm the pattern is real across 3 apps).
- Tier: 5 — Apple first-party system surface.
- Invisibles ×2: 5 — the band is a true two-edge fill (today's curve above, range-low curve below) not a flat translucent rectangle, dashed vertical gridlines at 6-hour intervals are barely-there, right-aligned axis numerals sit clear of the plot, and the current-value point has a soft halo ring that doesn't compete with the line weight.
- Adaptability: 5 — already near-black (#0d0d0f-ish) background, single orange accent swaps to cyan with zero structural change, legend row (dot + label) below the chart is a pattern we can reuse verbatim for a "reading" vs "range" legend.
- Measurability: 5 — axis min/max labeled, legend spells out the exact range numerically ("Normal Range 22° to 34°"), nothing obscured.
- One-line why: this is the reference for the "confidence" half of the element name — a real shaded range band with a confident foreground line, not a fog of overlapping series.

## 3. Oura — Trends: Resting Heart Rate, 7-day (score 28/30)
- Mobbin URL: https://mobbin.com/screens/a32e9c74-98de-40a1-a54d-b5a9a5c3d3a2
- Screenshot: saved as design/references/progress-chart/candidate-3.png
- Convergence: 5 — same value-labeled-point grammar as WHOOP (candidate-1), plus a dashed horizontal reference line at the week's baseline value (47) that reappears as WHOOP's dashed average line and Bevel's dashed "Avg: 19%" line — 3+ apps converge on "dashed line = a number worth comparing against."
- Tier: 5 — Oura is a named benchmark app in the rubric.
- Invisibles ×2: 4 — gradient fill under the line is soft and controlled, dashed reference lines are genuinely dashed (not a fake-dotted stroke), the "today" (Sat) point is drawn larger than the rest as real point-hierarchy; docked slightly for only plotting 2 of 7 days with data (a straight diagonal segment across 4 empty days), which is less rich than WHOOP's fully-populated week.
- Adaptability: 5 — pure black background, blue accent to cyan is a non-issue, day-of-week labels along the bottom are the same shape as our 7-day axis.
- Measurability: 5 — full width, every axis tick labeled (44/46/48), day labels for the full week even where the line has no point.
- One-line why: the dashed-reference-line + oversized "today" dot combination is the cleanest way seen to say "this is the point that matters" without a gimmick.

## 4. Ultrahuman — Sleep Index detail, point trend (score 26/30)
- Mobbin URL: https://mobbin.com/screens/0504fd30-548e-4a89-9c8d-f6c0d88c5df1
- Screenshot: saved as design/references/progress-chart/candidate-4.png
- Convergence: 4 — the glowing halo-ring on the latest point converges with WHOOP's yellow circled endpoint (seen live in search on the Strain & Recovery screen, not saved as a finalist) and The Outsiders' green ring endpoint (candidate-5) — a real cross-app "point light" pattern, which is the literal name of our `TrajectoryPointLight` component.
- Tier: 3 — solid quantified-self wearable app, respected but not quite Apple/WHOOP/Oura benchmark tier.
- Invisibles ×2: 5 — the endpoint halo is a genuine soft-blur glow (not just a bigger dot or a color change), a dotted vertical guide drops from the point to its axis label, gridlines are reduced to left-side numeric ticks only (no vertical lines at all except the one dotted guide), and the whole card sits inside an ambient radial glow that echoes the number above it — this is closest of all 5 to Vision Trainer's own ambient-glow language already visible around the "1.63" hero number in our current capture.
- Adaptability: 5 — near-black background with a single ambient glow color, trivially recolors to lunar cyan, and the "glow the thing that matters" idea generalizes to our point-light concept directly.
- Measurability: 4 — only 2 data points (Sat/Sun) are plotted in this daily view, so it under-demonstrates a full 7-day series; every element present is legible at full res.
- One-line why: this is the reference for the "point light" half of the element name — a real glow, not a bigger fill, on exactly one point, with a dotted guide connecting it to its axis label.

## 5. The Outsiders — Training Load Ratio trend (score 19/30)
- Mobbin URL: https://mobbin.com/screens/55b1ee19-084f-460c-a5e2-cb4384b2a3c6
- Screenshot: saved as design/references/progress-chart/candidate-5.png
- Convergence: 4 — combines two patterns seen elsewhere: labeled horizontal zone bands ("High Risk" / "Medium R." / "Detraining", echoing WHOOP's and Bevel's banded-range treatments) and a glowing ring on the latest point (echoing Ultrahuman, candidate-4).
- Tier: 2 — a smaller/niche training app, not a design-benchmark reference.
- Invisibles ×2: 3 — the endpoint glow ring is well executed, but the raw zigzag line is noisy/sawtooth rather than a restrained trend, and the dashed-average label ("0.92") visually overlaps the big background number ("0.83") — a real legibility flaw, exactly the kind of sloppiness the rubric says to penalize hard.
- Adaptability: 3 — dark background and green-to-cyan remap are fine, but the jagged unsmoothed line contradicts the "line weight, gridline restraint" brief more than it supports it.
- Measurability: 4 — full res and axis-labeled, but the label-overlap issue costs real readability.
- One-line why: included as the third distinct-app data point for the glow-endpoint pattern, but its noisy line and overlapping labels are a caution — do not import its density/label discipline, only its zone-band idea.
