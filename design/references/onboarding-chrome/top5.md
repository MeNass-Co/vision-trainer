# Onboarding chrome — top 5 references

> Element: step layout rhythm, progress indicator geometry/position, anchored CTA. NOT illustration content.
> Current state: single 2pt cyan/grey line at the very bottom of the screen, illustration→hero→caption→CTA stack above it.
> **Headline finding:** every quality candidate found puts the progress indicator at the TOP of the screen (below the status bar, often paired with a back chevron), not the bottom. 5/5 finalists below use top placement — this is a strong, convergent signal that our bottom-line placement is the outlier.

## 1. Beside — "What should I call you?" (score 28/30)
- Mobbin URL: https://mobbin.com/screens/b4646317-e557-4c7f-b3ae-eb4435e8f149
- Screenshot: saved as design/references/onboarding-chrome/candidate-3.png
- Convergence: 5 — top-of-screen placement shared with Matter, pliability, Equinox+, Mindvalley; segmented-track geometry specifically shared with Matter.
- Tier: 3 — solid mid-tier AI SaaS product, not a design-benchmark app but well executed.
- Invisibles ×2: 5 — the standout detail is a real **gradient fill inside the track** (cream→blue) with a soft glow at the leading edge, not a flat color fill. Rounded caps on both track and fill, crisp 1px-scale track/fill contrast, generous top margin below the status bar, disabled-state Continue button shown with correct muted fill (useful reference for our own disabled CTA state).
- Adaptability: 5 — the gradient-fill concept maps directly onto our ACCENT_CORE #5BE9EC → ACCENT #33D2D6 ladder; icon/headline/caption centered stack is structurally simple and survives our no-avatar, dark-only constraints untouched.
- Measurability: 5 — full-res, fill vs. track contrast and gradient direction fully legible, disabled CTA state also visible.
- One-line why: proves a progress bar doesn't have to be a flat two-tone line — a real gradient fill is a premium, on-brand upgrade our cyan ladder was built for.

## 2. Matter — "Let's tailor your reading experience." (score 27/30)
- Mobbin URL: https://mobbin.com/screens/97cf2178-4df1-473d-baf3-7462da855d73
- Screenshot: saved as design/references/onboarding-chrome/candidate-2.png
- Convergence: 5 — same top-placement pattern as Beside/pliability/Equinox+/Mindvalley; 2-segment split geometry matches Beside's segmented approach.
- Tier: 3 — well-regarded reading app, solid upper-mid tier.
- Invisibles ×2: 5 — the closest structural analog to our own step-1 screen: pure-black background, real gap (not just a color change) between filled and unfilled segment with rounded caps on both, generous vertical rhythm between centered headline → caption → CTA, quiet-grey Continue pill with legible weight (not washed out).
- Adaptability: 5 — pure black bg + white text remaps to our near-black/cyan palette with zero friction; no incidental content to strip out.
- Measurability: 4 — full-res and both states (filled/unfilled) are clear, but only 2 segments are shown so tick-spacing at higher step counts can't be directly verified from this shot.
- One-line why: this is what our own layout looks like today, minus a badly-placed bottom line — validates that our vertical rhythm is already close to correct, only the indicator needs to move and gain a real track/fill gap.

## 3. Equinox+ — "1 of 5, tell us about yourself" (score 26/30)
- Mobbin URL: https://mobbin.com/screens/0f1e7902-c527-45db-b01b-f020da340a17
- Screenshot: saved as design/references/onboarding-chrome/candidate-1.png
- Convergence: 4 — shares top-of-screen placement with the other 4 finalists; the "X of N" numeric label paired with the bar is a rarer sub-pattern but still reinforces the core geometry.
- Tier: 4 — premium fitness/wellness brand, close to design-benchmark class.
- Invisibles ×2: 4 — crisp thin bar with clean rounded caps, numeric label baseline-aligned to the bar's top edge, back chevron and Skip balanced symmetrically in the corners, real ambient gradient background (ember glow) reading premium rather than flat. Minor ding: the "Next Step" CTA renders in a washed grey that reads ambiguous rather than a clear active/disabled distinction.
- Adaptability: 5 — the ambient gradient background is structurally identical to our own ambient-orb aesthetic (just needs a hue swap to cyan); numeric label + bar survives any step count without redesign.
- Measurability: 5 — full-res, numeric label, back/skip, and bar fill vs. track all clearly legible.
- One-line why: shows how to pair a numeric "step X of N" label with the bar for extra legibility, on a background treatment that's almost a hue-swap away from our own.

## 4. Mindvalley — "Select 6 growth areas..." (score 25/30)
- Mobbin URL: https://mobbin.com/screens/5d554b50-11fb-40ad-90ee-5a26c734c79d
- Screenshot: saved as design/references/onboarding-chrome/candidate-5.png
- Convergence: 4 — top placement shared with all finalists; percentage-label pairing is a distinct but recognized sub-pattern across quiz-style onboarding flows.
- Tier: 4 — well-known growth/education app, solid-to-upper tier.
- Invisibles ×2: 4 — bar, percentage numeral, and "Skip" all sit tidily on one row with matched baselines; accent-purple fill against dark track reads crisp. The inline accent-color word-highlight in the headline is a nice touch but belongs to a different element (header system, #10), not this one.
- Adaptability: 4 — percentage-label add-on is optional polish for us (could read as busy against our minimal aesthetic) but the underlying bar geometry remaps cleanly to near-black/cyan.
- Measurability: 5 — full-res, bar/percentage/skip all clearly legible.
- One-line why: demonstrates pairing a numeric percentage directly against the bar for at-a-glance progress, an option worth considering if step count grows.

## 5. pliability — "Build Your Program" (score 24/30)
- Mobbin URL: https://mobbin.com/screens/703e65c2-9b9e-471f-b8be-ae9d11ecd996
- Screenshot: saved as design/references/onboarding-chrome/candidate-4.png
- Convergence: 4 — top placement shared with all finalists; continuous single-track (non-segmented) geometry shares its sub-pattern with Equinox+ and Mindvalley.
- Tier: 3 — solid niche fitness app, mid tier.
- Invisibles ×2: 4 — back chevron sits in a proper dark circular touch target (correct optical sizing), left-aligned headline+caption is a clean divergent pattern, card content below keeps consistent radius/padding, full-width Continue CTA anchored with a clear margin above the home indicator — this is the most direct reference for "CTA anchoring" and "step rhythm" specifically called out in the brief.
- Adaptability: 4 — fully dark and color-independent; left-aligned headline is a layout decision (vs. our centered one) that would need a conscious choice, everything else translates directly.
- Measurability: 5 — full-res, bar fill and CTA anchoring both clearly visible.
- One-line why: best reference for CTA-to-home-indicator anchoring distance and for how a back-chevron touch target should be optically sized.

## Cross-cutting takeaway for implementation
- **Move the indicator from bottom to top**, right below the status bar (paired with a back chevron slot even if unused on step 1).
- **Give the track a real gap** between filled and unfilled portions with rounded caps on both — never a single hairline with no track visible (our current 2pt line has this flaw).
- **Consider a gradient fill** (Beside) using ACCENT_CORE → ACCENT rather than a flat color, to match our existing token ladder.
- Vertical rhythm (illustration → hero → caption → CTA) is already close to Matter/Beside's centered pattern — the fix is isolated to the indicator's position and geometry, not the whole stack.
