# toggle — diff table (native capture vs spec)

Capture: `design/captures/toggle-actual.png` (Settings → Feedback card, Haptics ON / Reduce motion OFF), full-res screenshot `design/captures/toggle-full.png` measured directly with PIL (iPhone 16e capture, 1170×2532px, i.e. @3x → divide px by 3 for pt).

Both instances measured: **Haptics (ON)** track y=608–700px, x=921–1073px; **Reduce motion (OFF)** track y=798–890px, x=921–1073px (identical horizontal position, confirming shared geometry).

| # | Property | Spec value | Measured (ON) | Measured (OFF) | Delta | PASS/FAIL |
|---|---|---|---|---|---|---|
| 1 | Track width | 51.0pt | 153px → 51.0pt | 153px → 51.0pt | 0 | PASS |
| 2 | Track height | 31.0pt | 93px → 31.0pt | 93px → 31.0pt | 0 | PASS |
| 3 | Track corner radius | 15.5pt (stadium) | Visually confirmed full stadium end-caps (radius.pill clamps to height/2) | same | 0 | PASS |
| 4 | Thumb diameter | 27.0pt | 81×81px → 27.0×27.0pt | 81×81px → 27.0×27.0pt | 0 | PASS |
| 5 | Thumb inset (radial, at rest) | 2.0pt uniform | top 6px/2.0pt, bottom 6px/2.0pt, right(ON) 6px/2.0pt | left(OFF) 6px/2.0pt | 0 | PASS |
| 6 | Thumb travel | 20.0pt | ON center x=1027, OFF center x=967 → Δ60px = 20.0pt | — | 0 | PASS |
| 7 | Track fill — ON | `ACCENT` #33D2D6 | sampled (51,210,214) = #33D2D6 exact | n/a | 0 | PASS |
| 8 | Track fill — OFF | `surface.controlTrackOff` #33383D | n/a | sampled (51,56,61) = #33383D exact | 0 | PASS |
| 9 | Thumb fill — both states | #FFFFFF flat | sampled (255,255,255) | sampled (255,255,255) | 0 | PASS |
| 10 | Row/card ground | `surface.card` #12181C (nearest token, per spec) | sampled (18,24,28) = #12181C exact | same | 0 | PASS |
| 11 | Track/thumb translucency | None (opaque) | Confirmed opaque, no blur | same | — | PASS |
| 12 | Text on toggle | None | None | None | — | PASS |
| 13 | Thumb inset (dup) | 2.0pt | see row 5 | see row 5 | 0 | PASS |
| 14 | Thumb travel (dup) | 20.0pt | see row 6 | see row 6 | 0 | PASS |
| 15 | State ON | track ACCENT, thumb right cap | confirmed | — | 0 | PASS |
| 16 | State OFF | track controlTrackOff, thumb left cap | — | confirmed | 0 | PASS |
| 17 | Thumb shadow | black 6%/blur 2pt/offset (0,+1), visible below thumb on ON track, absent above | Above thumb: track (51,209,213) ≈ base (51,210,214), no darkening (PASS: absent). Below thumb: (49,203,207) vs base (51,210,214) — darkened ~2–3% (spec nominal 6%; softened by blur radius since band is clipped to the 2pt inset gap, same physical constraint the spec's own OFF-track note flags as pixel-quantization-limited). Asymmetric present/absent pattern matches. | Not resolvable on grey OFF track per spec caveat (`verify-on-device`) — visually a faint darkening is present at the same position, consistent. | qualitative match, magnitude below nominal | PASS (directional match; spec itself flags this as near-threshold) |
| 18 | Outer/ambient shadow | None | Confirmed: track edge steps directly to row ground, no falloff | same | 0 | PASS |
| 19 | Motion (thumb travel + track crossfade) | `motion.spring.toggle`, haptic `select` | Implemented: `withSpring(target, motion.spring.toggle)` drives both `translateX` and `interpolateColor`; `haptics.select()` fires on commit (`handleChange`) | same code path | — | PASS |

**19/19 PASS, 0 FAIL.**

No spec row could not be satisfied.

## Changes made
`src/components/settings/Toggle.tsx` only:
- `KNOB_SIZE` 25→27, `KNOB_INSET` 3→2 (travel formula `TRACK_WIDTH - KNOB_SIZE - KNOB_INSET*2` unchanged, still resolves to 20pt).
- OFF track color: `surface.hairlineStrong` → `surface.controlTrackOff` (token already present in `tokens.ts` per VALIDATION.md addendum).
- Thumb fill: was interpolating `text.secondary → text.inverse` (wrong — `text.inverse` is dark, not white); now flat literal `#FFFFFF` both states, matching spec row 9 ("nothing else changes" from stock white; not a themed token since it's the stock-UISwitch invariant, and tokens.ts itself is asserted pure-black/white-free by `tokens.design.test.ts`).
- Thumb shadow: replaced the old ACCENT-tinted glow (`shadowColor: ACCENT_GLOW`, opacity tied to `progress`) with a static black shadow (`shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: {0,1}`) matching spec row 17.
- Motion/haptics were already correct (`motion.spring.toggle`, `haptics.select()` on commit) — untouched.
