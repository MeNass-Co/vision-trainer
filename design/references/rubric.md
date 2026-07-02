# Objective reference-ranking rubric (Phase 1)

> Authored by the taste tier. Every candidate reference is scored **0–5 on each axis**, total /25. Score what is *visible in the screenshot*, not the app's reputation in the abstract. Ties break toward axis 3 (invisibles).

## Axes

**1. Pattern convergence (×1)** — Do multiple top-tier apps execute this element the same way? A pattern seen across 3+ tier-1 apps is objective signal; a one-off novelty is a 1, no matter how pretty. State *which* other apps converge.

**2. Source-app tier (×1)** — 5 = design-benchmark apps (Apple system surfaces, Linear, Arc, Things, Headspace, Calm, WHOOP, Oura, Robinhood, Monzo, Airbnb-class). 3 = solid mid-tier product. 1 = template-grade app.

**3. Execution fidelity on the invisibles (×2 — count this axis twice in the total, /30)** — The core axis. In the actual screenshot: is the material crisp (real blur with tint discipline, not grey mush)? Are icons optically sized (not just geometrically)? Is there a *real* active/pressed state (fill + weight + color, not color alone)? Are hairlines 1px and intentional? Is spacing consistent to the pt? Penalize any visible sloppiness hard.

**4. Adaptability to our constraints (×1)** — Must survive: (a) hue remap to lunar cyan `#5BE9EC`/`#33D2D6` ladder on near-black `#080A0D`; (b) our real cell/tab/row count; (c) structural omissions (no search, no avatars, no promo banners); (d) dark-only. An element whose charm depends on white background or a 5-tab layout scores low.

**5. Measurability (×1)** — Can Sonnet extract numbers from this screenshot? High-res, uncropped, element fully visible, states visible (active AND inactive)? A gorgeous but tiny/cropped screenshot is useless downstream.

## Hard filters (reject before scoring)
- Light-mode-only execution that has no dark translation.
- Element obscured by overlays, keyboards, or device frames.
- Web screenshots. iOS mobile app screens only.

## Output contract per element (write to `design/references/<element>/top5.md`)
For each of the 5 finalists:
```
## N. <App name> — <screen title> (score X/30)
- Mobbin URL: <link>
- Screenshot: saved as design/references/<element>/candidate-N.png
- Convergence: <score> — <which apps share this pattern>
- Tier: <score>
- Invisibles ×2: <score> — <what is crisply executed: material/optical/active-state, concrete>
- Adaptability: <score> — <survives cyan remap / our count / omissions?>
- Measurability: <score> — <resolution, states visible?>
- One-line why: <what this execution gets right that ours misses>
```
Candidates must come from **at least 3 different apps**. Download every screenshot (via ctx_execute javascript fetch → file, curl is blocked). No candidate without a saved image.
