# Phase 3 spec instructions (one agent = one element)

You are a measurement agent for ONE element. Input: `design/references/<element>/target.png` (the curated reference) + `target.md` (what won and which carve-outs apply). Output: `design/references/<element>/spec.md` — the LOCKED build sheet for the implementation agent. Every row a number or a token. **An adjective in a spec row is a defect.**

## Ground rules
- The reference PNG is an iPhone screenshot at @3x (usually 1179×2556 = 393×852 pt). **Measure in px, report in pt (px ÷ 3, one decimal).** State the canvas you detected (width px) at the top of the spec.
- Measure programmatically with Python/PIL (installed): sample exact pixel colors (report hex + where sampled), count px distances for heights/paddings/radii/gaps. Crop + upscale regions and Read them to verify what you measured. Do not eyeball what you can sample.
- Corner radius: measure by finding where the edge departs from straight (crop the corner, threshold, count). Shadow: sample the gradient falloff below the element edge (report color/opacity ramp + blur estimate in pt). Blur material: you cannot measure blur intensity from a static PNG — report the visible tint color + opacity over both a light and dark background region instead (two samples), and flag `material: verify-on-glass`.
- Gradients: sample along the axis every ~5% and report angle + each detectable stop (position %, hex, opacity). Our brief demands stop-level fidelity.
- Type: report size in pt (cap-height-based estimate is fine to ±0.5pt), weight (by stroke density vs neighbors), letter-spacing sign, and the nearest token from `src/theme/tokens.ts` `type` ramp with the delta stated.
- **Hue remap column:** for every color row, give BOTH the reference hex AND the mapped token/hex from `src/theme/tokens.ts` (read it). Structure (opacity, luminance delta, gradient stop positions) is copied exactly; only hue rotates into the cyan ladder. If a reference grey has no token sibling, propose a NEW token name + value (prefix `proposed:`).
- **Micro-motion rows:** not measurable from a PNG. Emit rows with value `ORCHESTRATOR-SETS` — do not invent durations.
- Respect `target.md` carve-outs (text/count/hue + declared omissions/adaptations). The spec describes OUR build: reference structure, our content.

## spec.md format
```
# <element> — locked spec (Phase 3)
Canvas detected: <W>×<H> px (@3x → <w>×<h> pt)
| # | Property | Reference value | Our value (token/pt/hex) | How measured |
```
Group rows: GEOMETRY / COLOR & GRADIENT / MATERIAL / TYPE / SPACING / STATES / MOTION. Include an explicit row for EVERY state visible in the reference (active/inactive, on/off, selected/unselected, enabled/disabled).

## Return message (nothing else)
- element slug, row count, any `proposed:` tokens, any rows you could NOT measure and why, path to spec.md.
