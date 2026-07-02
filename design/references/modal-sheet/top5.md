# Modal sheet chrome — top 5 (Phase 1 scout)

Current state (`science.png`, `calibration.png`): sheet corner radius barely reads; close button is a thin hairline circle-X that floats awkwardly with no fill/weight. What "good" means: reference's corner radius, close-button size/fill/icon weight/position, sheet-vs-background separation.

## 1. Apple Weather — Visibility detail sheet (score 29/30)
- Mobbin URL: https://mobbin.com/screens/61918a17-142a-45b2-9189-fca290846cdd
- Screenshot: saved as design/references/modal-sheet/candidate-1.png
- Convergence: 5 — filled mid-grey circle chip + medium-bold X, top-right aligned to title baseline; the exact same chip pattern recurs on Apple Weather's own Beaufort Scale screen and on Netflix (candidate 3) — a genuine cross-app standard, not a one-off.
- Tier: 5 — Apple first-party system surface, the explicit tier-5 benchmark.
- Invisibles ×2: 5 — chip fill reads as a real ~40%-white-on-dark material, X stroke is medium weight and optically centered (not geometrically centered and not hairline), corner radius is large and consistent, and the near-black graphite sheet is unmistakably separated from the hazy sky photo bleeding in above it.
- Adaptability: 5 — pure neutral grey chip remaps trivially to a cyan-tinted glass fill; card floats over any content; fully dark-only already.
- Measurability: 4 — full native resolution, close button and corner radius both fully legible; only the pressed state isn't shown.
- One-line why: the filled circular chip (not an outline) is what gives the X actual visual weight — this is the single fix our hairline circle-X needs.

## 2. eBay — Edit Scene sheet (score 26/30)
- Mobbin URL: https://mobbin.com/screens/8be54224-f590-4889-967c-abaad7afbb18
- Screenshot: saved as design/references/modal-sheet/candidate-2.png
- Convergence: 4 — drag handle + filled circle-chip X + large top radius recurs with pliability's drag-handle sheet and the chip pattern from Weather/Netflix.
- Tier: 3 — solid mid-tier commerce app, not a design-benchmark app but well executed.
- Invisibles ×2: 5 — the strongest close-button execution in the set: solid black circle with a thin light ring border, bold centered X, drag-handle pill sized and weighted correctly, and a very pronounced, consistent top corner radius (~28pt) that reads as a distinct floating card even though both sheet and background are black.
- Adaptability: 5 — fully neutral (black/white), no light-mode dependency, drops straight into our stack.
- Measurability: 4 — full resolution, button and handle fully visible; no pressed state shown.
- One-line why: proves the corner-radius/floating-card read can come from silhouette and drag-handle alone, without needing a lighter sheet fill.

## 3. Netflix — Black Mirror info sheet (score 26/30, tiebreak below eBay on invisibles)
- Mobbin URL: https://mobbin.com/screens/0d72058c-b2b1-4d97-a81a-053380c7a478
- Screenshot: saved as design/references/modal-sheet/candidate-3.png
- Convergence: 4 — same filled-grey-circle-chip-X pattern as Apple Weather, corroborating it as a real cross-app standard from a second, unrelated tier-1 app.
- Tier: 5 — Netflix, a tier-1 media-app benchmark.
- Invisibles ×2: 4 — chip fill and X weight are crisp and well-centered against the title baseline, and the top corners round off right at the screen edge for a genuine floating-card look; scores slightly below the top two because the content behind the sheet is nearly featureless, so the sheet-vs-background separation signal is weaker.
- Adaptability: 5 — neutral dark chip, dark-only content already, remaps cleanly.
- Measurability: 4 — full resolution, rich content, single static state.
- One-line why: confirms the filled-chip-X pattern is standard even in long, text-dense info sheets like ours.

## 4. Apple TV — Miami vs Vancouver recap sheet (score 22/30)
- Mobbin URL: https://mobbin.com/screens/3ffdc3e2-b9a2-4962-bb89-b483e50f02a9
- Screenshot: saved as design/references/modal-sheet/candidate-4.png
- Convergence: 3 — the floating-card-with-vignette-peek treatment echoes Netflix's edge-rounding and pliability's dimmed peek-through, a real but less common variant of the pattern.
- Tier: 5 — Apple first-party (Apple TV app).
- Invisibles ×2: 3 — the corner radius and soft vignette showing the blurred screen behind are genuinely well executed depth cues, but the close X itself is a thin unfilled outline ring — the same hairline weakness our current app has, so this candidate teaches the "what to avoid" half of the lesson as much as the "what to copy" half.
- Adaptability: 4 — dark and neutral, but the vignette/blur-behind approach requires a real blur layer, which fits our glass-material direction but adds implementation cost.
- Measurability: 4 — full resolution, clean single state, small element count makes the button easy to inspect.
- One-line why: shows the corner-radius/vignette technique for sheet separation works independently of the button's own fill quality — useful for the radius half of this element, not the button half.

## 5. pliability — Poses workout sheet (score 21/30)
- Mobbin URL: https://mobbin.com/screens/e5ca6524-4050-413d-9664-5098dc85320f
- Screenshot: saved as design/references/modal-sheet/candidate-5.png
- Convergence: 3 — drag handle + rounded top card recurs with eBay; the dimmed peek-through of the underlying screen's own close button and pill is a distinctive separation technique not seen as clearly elsewhere in this pool.
- Tier: 3 — solid mid-tier fitness app.
- Invisibles ×2: 3 — drag handle geometry and corner radius are clean, and the dimmed peek of the screen behind is an excellent, unusual separation cue, but the sheet's own close X (next to the "Poses" title) is a bare stroke icon with no chip/fill at all — the same core flaw as our current implementation, and worse than candidate 4's outline ring.
- Adaptability: 4 — neutral dark grey card, dimming technique is compatible with our stack.
- Measurability: 5 — uniquely shows both the active sheet AND the dimmed background state in a single frame, useful for verifying the separation effect end to end.
- One-line why: the dimmed-peek-through technique is a second, distinct way (besides color/material contrast) to sell "this is a sheet floating over something" — worth stealing even though its own close button is not.

## Synthesis for the rebuild
Every top-3 finalist (Weather, eBay, Netflix) converges on the same fix: replace the hairline stroke with a **filled circular chip** (solid or ~40% translucent dark fill) sized to give the X real visual weight, centered on a medium-bold (not hairline) X glyph, positioned top-right at the title's baseline. Corner radius should be large and consistent (eBay's ~28pt read is the cleanest). The dimmed-peek-through technique (candidate 5) is a good secondary idea for selling sheet-vs-background separation if a blur/vignette layer (candidate 4) isn't in budget.
