# Week strip — top 5 references

## 1. Apple Fitness — "Jane's Plan" weekly training calendar (score 28/30)
- Mobbin URL: https://mobbin.com/screens/eac5518f-afb2-4ddc-9fdf-9680fb1bc1d4
- Screenshot: saved as design/references/week-strip/candidate-2.png
- Convergence: 4 — the letter-row + per-day status-indicator geometry is the canonical pattern for weekly activity status (Apple Health/Fitness widgets, WHOOP calendar markers, Ultrahuman's day-ring row all converge on "letter above, state signal below/inside").
- Tier: 5 — Apple system surface, the definitional design benchmark.
- Invisibles ×2: 5 (→10) — pixel-precise ~4px activity dot, consistent letter/date baseline alignment, a real color-coded state system (dimmed grey = past, green text+dot = has scheduled activity, solid white circle = today, plain white = no activity), optically centered today-circle.
- Adaptability: 4 — survives cyan remap trivially (green dot → cyan dot, white fill → cyan fill); our row omits date numbers (letters only), a minor structural trim, not a blocker.
- Measurability: 5 — full res (1179×2556), uncropped, four distinct states legible in one frame (past-dimmed / has-activity-dot / today-filled / no-activity-plain).
- One-line why: it is structurally almost identical to our spec (letter row + independent per-day state signal) and proves the state can be conveyed with a tiny dot rather than a big color block.

## 2. Open — "Aug 24 – Aug 30" streak week strip (score 28/30)
- Mobbin URL: https://mobbin.com/screens/520499f8-5d63-41c7-9b66-787efd6a06ce
- Screenshot: saved as design/references/week-strip/candidate-1.png
- Convergence: 4 — fill-for-done / outline-for-today / plain-for-future also appears in stoic. (boxed today) and Habitify (outlined today pill); a real cross-app pattern, not a one-off.
- Tier: 4 — Open (Sam Harris's meditation app) is a widely-cited premium/design-forward app, just under the Apple/Linear ceiling.
- Invisibles ×2: 5 (→10) — consistent rounded-square radius across all 7 cells, crisp ~1.5px hairline outline on the today cell, tight letter-to-number vertical rhythm, three genuinely distinct fill states (solid white / outlined / dark plain).
- Adaptability: 5 — true near-black background already, trivial hue remap (white fill → cyan fill, white outline → cyan outline), identical 7-cell S–S layout to ours.
- Measurability: 5 — full res (1179×2556), uncropped, all 3 states visible simultaneously in one row (done ×2, today, future ×3).
- One-line why: cleanest "3-state legibility per pt" execution of the whole set — exactly the fill/outline/plain vocabulary our spec is missing.

## 3. Calm — "Your Progress: This week" (score 26/30)
- Mobbin URL: https://mobbin.com/screens/56e1a984-3812-4790-988c-76c793ab1b67
- Screenshot: saved as design/references/week-strip/candidate-4.png
- Convergence: 4 — checkmark-for-done + ring-highlight-for-today converges with (Not Boring) Habits, stoic., and Duolingo's streak week — checkmark-as-done is near-universal.
- Tier: 5 — Calm is explicitly named as a design-benchmark app in our own rubric.
- Invisibles ×2: 4 (→8) — real ring-outline state for "today, done" is a nice third signal, but the muted circles for untouched days read a little soft/mushy next to Open's crisper geometry.
- Adaptability: 4 — background is a blue gradient, not our near-black, so the whole palette needs remapping (not just an accent swap), but the circle+checkmark mechanic itself transfers cleanly.
- Measurability: 5 — full res (1179×2556), uncropped, three states clearly visible (muted/not-done, checkmark done, checkmark+ring today).
- One-line why: proves a goal-count ring ("3 Days") can sit directly above the week row without competing with it — relevant since our strip sits under the orb/arc.

## 4. (Not Boring) Habits — "Stretch" habit day rail (score 26/30)
- Mobbin URL: https://mobbin.com/screens/19157854-0153-4d03-928b-a549e02345c8
- Screenshot: saved as design/references/week-strip/candidate-3.png
- Convergence: 4 — checkmark-for-done converges with Calm/Duolingo/stoic; the orange-underline-for-today accent is a distinct but legible convention seen across habit-tracker-class apps.
- Tier: 3 — a respected, design-forward indie app, but not a category-defining benchmark.
- Invisibles ×2: 5 (→10) — the strongest material execution in the set: soft-shadowed 3D checkmark glyph, a genuinely separate "viewing/selected day" (black fill) state from "done" (white+check) and "untouched" (dim grey), plus a crisp 2px orange underline marking literal today — four states, all pixel-consistent.
- Adaptability: 4 — needs date numbers dropped to match our letters-only spec, and the orange accent swaps to cyan; the state logic maps directly onto done/missed/today/future.
- Measurability: 5 — full res (1125×2436), uncropped, four legible states in a single frame.
- One-line why: the only reference that visibly separates "today marker" from "done state" as two independent signals — directly solves our "today state barely differentiated" problem.

## 5. stoic. — week checklist header (score 24/30)
- Mobbin URL: https://mobbin.com/screens/2bc954b2-f338-46a0-94cf-2c7bb4bd6da0
- Screenshot: saved as design/references/week-strip/candidate-5.png
- Convergence: 3 — checkmark-done + boxed-today converges with Calm/(Not Boring) Habits but is the most generic, textbook execution of the pattern.
- Tier: 3 — solid mid-tier journaling app, not a category benchmark.
- Invisibles ×2: 4 (→8) — clean type and legible checkmark, but the today-box is a flat rectangle with no material/depth treatment.
- Adaptability: 5 — true black background already, checkmark+outline mechanic remaps to cyan trivially, and the 7-cell Su–Sa row matches our spec almost 1:1.
- Measurability: 5 — full res (1179×2556), uncropped, both states visible, though only 2 states are demonstrated (every day already has a checkmark except today's outline box — no explicit "missed" or "future" state shown).
- One-line why: the most literal geometry match to our current S–S letter row, useful as a baseline even though its state vocabulary is thinner than #1–#4.
