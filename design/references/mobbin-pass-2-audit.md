# Mobbin Pass 2 Audit

Scope: paywall plan card, CTA stack, settings rows/toggles, onboarding goal cards, onboarding back control.

Viewport: 393 x 852, DPR 3, Expo web preview.

Capture folder:

`/Users/nassimlecornet/Library/Mobile Documents/com~apple~CloudDocs/temp/vision-trainer-audit/captures/after-mobbin-pass-2`

Final onboarding correction:

`/Users/nassimlecornet/Library/Mobile Documents/com~apple~CloudDocs/temp/vision-trainer-audit/captures/after-mobbin-pass-2c/onboarding-goals.png`

| Element | Mobbin target feature | Implementation | Result |
|---|---|---|---|
| Paywall plan card | Endel-style calm plan card with badge, rows, and quiet disclosure | Added right badge, 56 pt benefit rows, 30 pt glyph pucks, hairline separators, tighter `18` pt padding | PASS |
| CTA stack | Spotify-style single dominant primary and quiet secondary | Primary button now has `minHeight: 56`; paywall action gap set to `11`; secondary stays quiet text | PASS |
| Settings title | Oura-style native settings scale | Settings title reduced from hero scale to 34/40 | PASS |
| Settings rows | Apple Fitness row density | Rows now enforce 56 pt minimum and native switch size remains 51 x 31 | PASS |
| Section labels | Oura section rhythm | Section gap tightened to 10, bottom rhythm 26, label tracking 1.8 | PASS |
| Goal cards | Tonal-style selected cards | Goal rows now 68 pt, radius 14, selected 1.5 px cyan stroke, 18 pt radio target | PASS |
| Stepper back control | pliability-style 32-40 pt icon control | Back moved to top-left 38 pt circle, no clipped bottom control | PASS |

Mobbin asset note: the exact Apple TV tab bar image asset was retrievable. The four older UUIDs from the initial scout did not resolve exactly through the current MCP search interface, so this pass uses the previously extracted feature specs rather than committing unverifiable screenshots.

Native caveat: web confirms geometry, typography, layout, and copy. iOS-only liquid glass and native shadow still need device/Xcode validation.
