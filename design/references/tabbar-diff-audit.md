# Tab Bar Diff Audit

Reference: Apple TV Mobbin screen `91bdd973-4641-4170-8620-bcc146551edc`

Rendered capture: `/Users/nassimlecornet/Library/Mobile Documents/com~apple~CloudDocs/temp/vision-trainer-audit/captures/after-mobbin-tabbar-pass/01-today.png`

Viewport: 393 x 852, DPR 3, Expo web preview.

Native caveat: web validates geometry, typography, and approximate fallback material only. iOS liquid-glass material and native shadow still require a real iOS build or simulator with Xcode installed.

| Property | Target | Actual | Delta | Tolerance | Result |
|---|---:|---:|---:|---:|---|
| Side inset | 18 pt | 18 pt | 0 | +/-1 pt | PASS |
| Pill width | 357 pt | 357 pt | 0 | +/-2 pt | PASS |
| Pill height | 68 pt | 68 pt | 0 | +/-1 pt | PASS |
| Bottom safe gap | 8 pt | 8 pt | 0 | +/-1 pt | PASS |
| Corner radius | 34 pt | 34 pt | 0 | +/-1 pt | PASS |
| Border width | 1 px | 1 px | 0 | exact | PASS |
| Label size | 10-11 pt | 10 pt | in range | target range | PASS |
| Label tracking | 0 | 0 | 0 | exact | PASS |
| Active indicator | contained item treatment | 46 x 32 pt icon capsule | structural match | visual | PASS |
| Item distribution | equal thirds | equal thirds | 0 | visual | PASS |
| Press motion | subtle scale/crossfade | existing spring scale/crossfade | structural match | interaction | PASS |
| Material | dark low glass | dark blur/liquid fallback on web | native pending | native device required | PENDING |

Before crop: `/Users/nassimlecornet/Library/Mobile Documents/com~apple~CloudDocs/temp/vision-trainer-audit/captures/current-before-mobbin-locators/tabbar-before-crop.png`

After crop: `/Users/nassimlecornet/Library/Mobile Documents/com~apple~CloudDocs/temp/vision-trainer-audit/captures/after-mobbin-tabbar-pass/tabbar-after-crop.png`
