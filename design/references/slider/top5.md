# Slider — top 5 references (Phase 1)

Current state (`design/captures/current/calibration.png`): stock-feeling grey circular thumb (flat fill, no shadow/highlight), thin cyan-fill/grey-remainder track, "Dim / 50% / Bright" text labels below. The single most "amateur" control in the app — no thumb depth, no track-height intention, no fill gradient.

## 1. Philips Hue — Fade duration (score 25/30)
- Mobbin URL: https://mobbin.com/screens/c216a8a8-9771-4c3d-be68-59191f06531b
- Screenshot: saved as design/references/slider/candidate-5.png
- Convergence: 3 — numeric-ruler slider pattern echoes Runna's dot-tick track and Zero's single recommended-value tick; the "value pair above track" header (Fade for 30 min / Ends at 10:30 PM) echoes Hatch Sleep's label+% header row.
- Tier: 3 — solid smart-home benchmark app, not quite Linear/Arc-class but very deliberate execution.
- Invisibles ×2: 5 (→10) — track fill has a genuine gradient (brighter near origin, fading toward the thumb, not a flat color block), thumb is a crisp white disc with a soft, correctly-blurred drop shadow, and the 0/10/20…60 tick labels are perfectly evenly spaced beneath the track — real ruler discipline, not decorative dashes.
- Adaptability: 4 — dark modal sheet remaps to our near-black + cyan ladder trivially; the full numeric ruler is more machinery than our two-word (Dim/Bright) labels need, so we'd trim to endpoints only.
- Measurability: 5 — full track width visible uncropped, dual numeric headers, tick labels give an exact pixel-to-value ruler for extracting thumb geometry and fill length.
- One-line why: the fill isn't just a color swap of the track — it has its own light gradient, which is exactly the "fill treatment" our current flat cyan bar is missing.

## 2. Insight Timer — Your device volume (score 25/30)
- Mobbin URL: https://mobbin.com/screens/a45fd54e-8239-4d52-a221-4f8ba9bbcd80
- Screenshot: saved as design/references/slider/candidate-2.png
- Convergence: 5 — the hairline-track + plain white circular thumb pattern repeats identically across Spotify's crossfade slider, Zero's mode slider, and the DoorDash/Google Photos photo-edit sliders. This is the dominant "minimal dark slider" convention, not a one-off.
- Tier: 3 — solid mid-tier meditation app, not a design-benchmark name but executes the convention cleanly.
- Invisibles ×2: 4 (→8) — track is a true 1–2px hairline (not a chunky bar), thumb has a subtle correctly-scaled shadow, and the same geometry repeats identically across 5 stacked sliders on one screen — proof the ratios are systemized, not eyeballed per-instance.
- Adaptability: 5 — pure black background, no card needed, remaps straight onto our token system; percentage-above-thumb pattern is a direct swap for our "50%" label.
- Measurability: 4 — full width, numeric label, multiple instances at different fill %, but no end-point labels (no Dim/Bright equivalent) so the endpoint-labeling half of our element isn't demonstrated here.
- One-line why: proves the hairline-track/plain-thumb combination reads as premium specifically *because* it's repeated identically five times on one screen — consistency is the tell.

## 3. Hatch Sleep — Clock and Display (Daytime/Nighttime Brightness) (score 24/30)
- Mobbin URL: https://mobbin.com/screens/4efea615-e77f-4860-9d4d-9c17d59d7a3e
- Screenshot: saved as design/references/slider/candidate-1.png
- Convergence: 3 — the card-wrapped slider with a label+value header row (name left, "60%" right) also structures Runna's advanced-customization sliders; a recurring settings-screen convention.
- Tier: 3 — smart-home sleep app, competent but not top-tier benchmark.
- Invisibles ×2: 4 (→8) — thumb is a clean white disc with real shadow depth (not flat), fill/remainder split is crisp, and two sliders stacked with different fill ratios (60% vs 10%) confirm the fill scales correctly rather than being a fixed decorative bar.
- Adaptability: 5 — already sits on a dark, cyan/teal-leaning card; the closest existing palette to our lunar cyan ladder of any candidate found.
- Measurability: 5 — two full-width, uncropped sliders at very different fill values with exact % labels — ideal for extracting thumb diameter and fill-color ratio at two data points.
- One-line why: this is structurally almost identical to our own slider (label header + %, card wrap, track+thumb below) — closest 1:1 layout match, so it's the cleanest "same shape, better execution" reference.

## 4. Zero — Dark Mode Auto threshold (score 24/30)
- Mobbin URL: https://mobbin.com/screens/7cdaac37-bad5-4247-904d-9e12db0b49cb
- Screenshot: saved as design/references/slider/candidate-3.png
- Convergence: 3 — icon-as-endpoint-label (sun outline / sun filled instead of text) is a less common variant, but the tick-mark-for-recommended-value device echoes Philips Hue's ruler and Runna's stepped dots.
- Tier: 3 — well-regarded fasting/habit app, solid mid-tier execution.
- Invisibles ×2: 4 (→8) — thumb is a filled coral pill-circle with a genuine soft shadow (not flat color), the vertical tick mark denoting the recommended setting is a crisp 1px line, and the whole control sits inside a distinct card with its own corner radius separate from the page background.
- Adaptability: 5 — pure black card on black page, icon-endpoint idea maps directly onto our "Dim ☾ / Bright ☀" concept if we ever want icons instead of (or alongside) text.
- Measurability: 5 — full track visible, tick mark gives a second reference point beyond the thumb itself, end icons unambiguous.
- One-line why: the icon-endpoint + tick-mark combo is the most direct precedent for upgrading our plain "Dim / Bright" text into something with more visual weight.

## 5. Runna — Advanced Customisation (4 stacked sliders) (score 23/30)
- Mobbin URL: https://mobbin.com/screens/ca979ec1-1891-42ab-9152-3f60b5f23352
- Screenshot: saved as design/references/slider/candidate-4.png
- Convergence: 3 — the 3-dot stepped-track (start/mid/end tick dots under a continuous drag range) is a recognizable "discrete-feeling continuous slider" pattern also implied by Philips Hue's tick ruler.
- Tier: 4 — Runna is a well-crafted, near-benchmark running-coach app; typography and card discipline read close to tier-1.
- Invisibles ×2: 3 (→6) — thumb is a crisp white disc with correct shadow and the dot-tick spacing is precise, but the track itself never shows a filled/unfilled color split (it's uniform grey regardless of thumb position) — a real miss on "fill treatment," which is one of the three things our own rubric explicitly wants fixed.
- Adaptability: 5 — accent value text is already teal/green, near-identical hue family to our `#33D2D6`; card and row rhythm drop into our settings/calibration shell with no fights.
- Measurability: 5 — four sliders at four different thumb positions on one screen, teal value labels for each — excellent for cross-checking thumb-diameter consistency across instances.
- One-line why: best reference for *thumb* geometry and stepped-tick treatment, but explicitly demonstrates the failure mode to avoid (no fill color) — useful as a negative data point alongside the other four.
