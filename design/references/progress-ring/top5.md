# Progress ring/arc — top 5 references

> Element: circular progress arc orbiting the celestial orb on Today. Scored on arc PROPERTIES only (stroke weight, cap style, track/fill contrast, tick treatment) — not overall screen composition, per constraint.

## 1. Apple Fitness — Summary "Activity Ring" (score 27/30)
- Mobbin URL: https://mobbin.com/screens/a69eb6f0-44e3-4b5c-95e6-43a34561d837
- Screenshot: saved as design/references/progress-ring/candidate-1.png
- Convergence: 5 — this IS the origin pattern; Any Distance, Streaks, Google Fit, WHOOP all trace their ring treatment back to it.
- Tier: 5 — Apple system surface, the design benchmark for this element category.
- Invisibles ×2: 5 (10/10) — stroke width ≈22% of ring diameter (thick "donut," not a hairline arc), track sits at ~25% opacity of the fill hue on near-black (tonal, same-hue track/fill relationship rather than grey-vs-color), fill terminates in a perfect rounded cap capped by a small circular badge with a directional arrow — a real, legible "active state" marker riding the stroke, not just a color change.
- Adaptability: 4 — thick donut + badge-marker survives a cyan hue remap and a smaller canvas without issue; only friction is that our arc is intentionally much thinner than this reference's proportion.
- Measurability: 3 — full ring uncropped and high-res, but this capture shows the 0% (empty) state only, so the track/fill contrast ratio can't be read at a mid-fill value.
- One-line why: the cleanest "thick tonal donut + rounded-cap badge marker" execution in the set — exactly the template every other ring app is imitating.

## 2. WHOOP — Recovery ring (68%) (score 27/30)
- Mobbin URL: https://mobbin.com/screens/984f5bd5-2aeb-4ce1-80e5-e215df9872a8
- Screenshot: saved as design/references/progress-ring/candidate-2.png
- Convergence: 4 — thin-ring-with-centered-number pattern shared with Oura, Google Fit, MacroFactor.
- Tier: 5 — WHOOP is an explicit tier-1 benchmark app per rubric.
- Invisibles ×2: 4 (8/10) — stroke width ≈9% of diameter (medium-thin), fill cap is a crisp flat/slightly-rounded cut, and — the standout detail — the fill's start point drops a precise dashed vertical tick line down into a synchronized timeline strip below, landing on a solid tick mark at the matching hour. Docked one point because the inactive track is so low-contrast (near-charcoal on near-black) it nearly disappears — a deliberate quiet-track choice, but it does test the track-visibility axis.
- Adaptability: 5 — thin ring + centered number + dark canvas is nearly our exact context already; green→cyan is a trivial hue swap.
- Measurability: 5 — full ring uncropped, both fill and track states visible, high-res, tick/marker fully legible.
- One-line why: the sharpest tick-treatment in the set — it's the only reference that maps the ring's position onto a second scale via an actual measured tick line, not just a dot.

## 3. Zero — Fasting elapsed-time ring (score 26/30)
- Mobbin URL: https://mobbin.com/screens/7bc4cd65-c967-4de4-9a8d-2eee11512c3d
- Screenshot: saved as design/references/progress-ring/candidate-5.png
- Convergence: 4 — "ring orbiting a center focal element with a badge riding the stroke" recurs across Zero, Apple Fitness (arrow badge), and WHOOP (implicit via its own marker language).
- Tier: 3 — solid, polished mid-tier lifestyle app, not top-5 canon.
- Invisibles ×2: 5 (10/10) — stroke width ≈14% of diameter, track rendered as a legible solid mid-grey (unlike WHOOP's near-invisible track), a red circular badge (wrench icon) is pinned directly onto the stroke at the goal position, a second smaller flame icon sits further along the ring as a secondary milestone marker, and a thin dashed inner echo-ring runs just inside the main stroke — a genuine layered dual-ring tick treatment none of the others attempt.
- Adaptability: 5 — composition is almost identical to ours: an arc orbiting a center element with text inside. Near-zero structural change needed, only a hue remap.
- Measurability: 4 — full ring uncropped, high-res, track and badges unambiguous; only the active-fill state at a nonzero % isn't shown in this particular capture.
- One-line why: the closest compositional and tick-marker analog to our own arc-around-content layout — validates a badge-on-stroke treatment as adaptable, not just Apple-specific.

## 4. Oura — Readiness gauge (83/Good) (score 25/30)
- Mobbin URL: https://mobbin.com/screens/9606969d-6f33-4cc7-8ef9-33d1f56cebbc
- Screenshot: saved as design/references/progress-ring/candidate-3.png
- Convergence: 3 — the semicircle-gauge form is mostly an Oura-internal pattern (repeated across Readiness/Sleep/Activity) rather than one shared broadly with the other 4 apps here.
- Tier: 5 — Oura is an explicit tier-1 wearable/health benchmark.
- Invisibles ×2: 5 (10/10) — extremely thin, crisp white stroke (~4-5% of the arc's span), flat/softly-rounded end caps, inactive arc rendered as a dimmer translucent overlay of the same white (contrast via opacity, not hue swap) sitting cleanly on a photographic background, with a subtle gap/notch at the fill terminus reading as an intentional handoff mark.
- Adaptability: 3 — the thin-stroke, opacity-based track/fill relationship transfers directly to our cyan-on-black arc, but the semicircle (not full-circle) form doesn't match our orbiting-ring composition, so only the stroke properties — not the shape — are usable.
- Measurability: 4 — high-res and crisp, but only a single near-full state is shown, and the busy photo background adds minor extraction friction versus a flat-black canvas.
- One-line why: the best reference for pure stroke-material crispness (thin, flat-capped, opacity-driven track) independent of any ring-shape assumptions.

## 5. Any Distance — Goal ring, 16228% complete (score 20/30)
- Mobbin URL: https://mobbin.com/screens/4f373b8b-8f7d-4298-b817-121bf349fa04
- Screenshot: saved as design/references/progress-ring/candidate-4.png
- Convergence: 4 — thick full-donut stroke-to-diameter ratio converges directly with Apple Fitness and Streaks' ring icons.
- Tier: 3 — solid mid-tier fitness app, polished but not top-5 canon.
- Invisibles ×2: 3 (6/10) — stroke width ≈20% of diameter with a soft ambient light-glow hotspot riding the stroke (real light-modeling on the material, not a flat fill) — but this capture is a looped/overflowed 100%+ ring with no visible inactive track at all, so track/fill contrast can't actually be judged from it.
- Adaptability: 4 — bright solid color on black remaps to cyan trivially; thick full-ring weight is a legitimate alternate target.
- Measurability: 3 — high-res and uncropped, but the missing inactive-track state weakens what can be measured here versus the other candidates.
- One-line why: useful only for the light-glow-on-stroke detail; otherwise the weakest candidate because its "complete" state hides the exact contrast relationship we need to extract.
