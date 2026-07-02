# Toggle / switch — top 5 references

## 1. Apple Fitness — Notifications (score 30/30)
- Mobbin URL: https://mobbin.com/screens/c922783c-55ac-401c-b36f-a31ee3a78383
- Screenshot: saved as design/references/toggle/candidate-1.png
- Convergence: 5 — this IS the canonical iOS `UISwitch` geometry that every other finalist (Calm Sleep, Apollo for Reddit, Twitch, Shop) independently converges on: pill track with radius = height/2, circular thumb with soft drop-shadow, only the on-fill hue differs per brand.
- Tier: 5 — Apple system surface, the literal design benchmark.
- Invisibles ×2: 5 — track corners are exactly semicircular, thumb has a real soft shadow separating it from the track (not flat color-on-color), off-state reads as a distinct dark-grey track + white thumb (not the same muddy grey as background), on-state green is saturated but not neon, row card has consistent 16pt-ish inset padding.
- Adaptability: 5 — green → lunar cyan is a one-value remap; grouped dark card with caption text under each row matches our own settings-group pattern (element 4) almost exactly; dark-only native.
- Measurability: 5 — high-res, uncropped, 3 full rows with both ON (2×) and OFF (1×) states simultaneously visible, thumb/track edges crisp enough to measure in pt.
- One-line why: this is the un-improvable stock geometry — exact track/thumb proportions and inset we should clone 1:1 before doing anything else.

## 2. Calm Sleep — Bedtime Reminders (score 27/30)
- Mobbin URL: https://mobbin.com/screens/35620bc1-41f1-4d57-82c2-20afe484900b
- Screenshot: saved as design/references/toggle/candidate-3.png
- Convergence: 5 — identical track/thumb geometry to Apple Fitness/Apollo/Twitch/Shop; same iOS-switch DNA, different accent.
- Tier: 5 — Calm is an explicit rubric benchmark app (wellness/mindfulness tier-1).
- Invisibles ×2: 4 — thumb shadow and track fill are clean and crisp, but the screen is a bare flat list (no grouped card, no hairline separators) so there's less surface to judge separator/inset discipline against.
- Adaptability: 4 — green → cyan trivial, dark-only native; loses one point because rows float directly on black with no card container, a slightly different structural context than our grouped-card settings screen.
- Measurability: 5 — only 2 rows but both ON (green) and OFF (white-on-dark-grey) states fully visible, high-res, nothing cropped.
- One-line why: cleanest possible side-by-side proof that the SAME switch reads unambiguously in both states purely through fill + thumb contrast, no extra ornamentation.

## 3. Apollo for Reddit — Theme (score 27/30)
- Mobbin URL: https://mobbin.com/screens/9e713de7-5008-4a8b-a05c-adb4a9df5ded
- Screenshot: saved as design/references/toggle/candidate-2.png
- Convergence: 5 — same stock switch pattern confirmed across Apple Fitness/Calm/Twitch/Shop.
- Tier: 4 — Apollo for Reddit is a widely cited craft-benchmark third-party client, not quite Apple/Calm tier but close.
- Invisibles ×2: 4 — track/thumb crisp with consistent hairline row separators inside a grouped dark card (closest structural match to our settings-group of all 5 candidates), but flatter shadow treatment than Apple Fitness.
- Adaptability: 5 — green → cyan trivial; grouped-card-with-section-headers layout is nearly identical to our own settings screen (caps header, inset card, hairline rows).
- Measurability: 5 — 4 toggle rows in one screen, 2 ON + 2 OFF simultaneously, high-res, fully uncropped.
- One-line why: best structural twin of our actual settings screen — section header + grouped card + multiple mixed-state toggle rows in one shot.

## 4. Twitch — Appearance (score 26/30)
- Mobbin URL: https://mobbin.com/screens/020163a3-2309-4fc3-af34-b7b3d7612bf9
- Screenshot: saved as design/references/toggle/candidate-4.png
- Convergence: 5 — same iOS switch geometry.
- Tier: 3 — solid mass-market app, not a design-benchmark brand.
- Invisibles ×2: 4 — track/thumb crisp, purple on-fill is a clean non-stock tint proving the pattern survives a saturated brand color, subtle thumb shadow present.
- Adaptability: 5 — purple → cyan trivial remap; single-section grouped card sits above a bottom tab bar, structurally close to our own tab-bar + settings-card layout.
- Measurability: 5 — both ON (purple) and OFF (grey) states visible in one small, fully uncropped, high-res card.
- One-line why: cleanest proof that a fully custom accent color (not Apple green) still reads as native when track/thumb geometry stays stock.

## 5. Shop — App settings (score 25/30)
- Mobbin URL: https://mobbin.com/screens/b31ffa6f-9636-43eb-aeba-f416331404d5
- Screenshot: saved as design/references/toggle/candidate-5.png
- Convergence: 5 — same iOS switch geometry.
- Tier: 3 — solid mid-tier consumer app (Shopify).
- Invisibles ×2: 4 — track/thumb crisp with a custom purple fill, but rows are a flat separator-only list (no card containment), and a chevron nav row is interleaved with toggle rows, slightly diluting focus on the switch itself.
- Adaptability: 4 — purple → cyan trivial, dark-only; flat-list structure is a mild mismatch vs. our grouped-card settings pattern.
- Measurability: 5 — 5 rows in one shot with 2 ON + 2 OFF states plus a chevron row for contrast, high-res, fully uncropped.
- One-line why: shows the switch holding up correctly even when interleaved with a different row type (chevron nav), useful proof of geometric consistency across our settings-group row variants.
