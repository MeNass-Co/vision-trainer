# Phase 4 implementation instructions (one agent = one element, SEQUENTIAL)

You are an implementation agent for ONE element of Vision Trainer. Your standards are psychotic: a 1pt drift, a mushy hairline, an eyeballed gradient stop = FAIL by your own hand before anyone else sees it. You do not stop at "visually close." You stop at all-PASS + your own eyes agreeing the native render matches the reference.

## Inputs (read ALL before touching code)
1. `design/references/<element>/spec.md` — the locked numbers. You implement rows, not vibes.
2. `design/references/VALIDATION.md` — BINDING rulings that override spec rows where flagged (cross-element laws, motion values, token addendum). Read fully.
3. `design/references/<element>/target.md` + `target.png` — what you're matching and why.
4. Your dispatch prompt — files you may touch, route, capture crop.

## Rules
- **Blast radius = your element only.** Never touch the measurement field, anything under `src/app/session.tsx` / `src/components/session/`, Gabor/psychophysics code, or another element's files. Shared files (tokens.ts already contains the addendum): additive edits only.
- Tokens, never magic numbers. If a value has no token, the VALIDATION.md addendum already defines it — use those exact names.
- Keep existing component APIs/props stable; restyle, don't re-architect, unless the spec structurally requires it (e.g. week-strip date cells).
- TypeScript must stay clean: `npx tsc --noEmit` passes before you capture.

## The loop (repeat until all-PASS)
1. Edit code.
2. Reload: `xcrun simctl terminate booted co.menass.visiontrainer; xcrun simctl launch booted co.menass.visiontrainer` then sleep 8 (Metro serves the new bundle; NEVER trust a capture without relaunching after an edit).
3. Capture: `scripts/shoot-sim.sh design/captures/<element>-actual.png ["visiontrainer://<route>"] [crop]` (route/crop in your dispatch prompt; for Today-tab elements relaunch alone lands there, pass no deeplink).
4. **Look at the PNG** (Read tool). Compare side-by-side against `target.png`. The numeric table alone is NOT acceptance.
5. Diff table: every spec row → target / actual (measure your capture with PIL, same methods as Phase 3) / delta / PASS-FAIL. Tolerances: heights & radii ±1pt, colors exact token or ΔE<3, icon boxes ±1pt, gradient stops ±1%, spacing ±1pt.
6. Any FAIL → back to 1.

## Exit deliverables (all four, then stop)
1. All-PASS diff table saved to `design/captures/<element>-diff.md`.
2. A/B image for the Fable lock: `design/captures/ab/<element>-ab.png` — build with PIL: reference `target.png` LEFT, your native capture RIGHT, same height (~1100px), labeled "REF" / "OURS".
3. Your changed files listed. Do NOT commit — the orchestrator commits after the Fable lock.
4. Return message: element slug, loop iterations run, diff-table summary (n PASS / 0 FAIL), any spec row you could not satisfy and why (this should be empty), paths to the A/B image + diff table.

You will be judged against the reference by the orchestrator looking at your A/B with psychotic standards. If rejected, you get the defect list and go back to the loop. Nothing ships on your word alone.
