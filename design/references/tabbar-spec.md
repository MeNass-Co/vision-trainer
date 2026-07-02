# Tab Bar Spec

Target source: Apple TV Mobbin screen `91bdd973-4641-4170-8620-bcc146551edc`

Reference asset: `design/references/tabbar-target.png`; bottom crop: `design/references/tabbar-target-crop.png`.

Reference rule: match structure, material, spacing, and interaction grammar. Do not copy app branding, hue, icons, or exact proprietary composition.

| Property | Target | Vision Trainer application |
|---|---:|---|
| Bar model | Low dark glass dock, floating over content | Floating rounded pill dock |
| Viewport side inset | 16-20 pt | 18 pt |
| Safe-area gap | 8-12 pt above bottom safe area | safe area + 8 pt |
| Pill height | 64-72 pt | 68 pt |
| Corner radius | 28-34 pt | 34 pt |
| Material | Dark native blur or liquid glass, cool tint | iOS liquid glass when available, blur fallback otherwise |
| Tint | Near-black, translucent | `rgba(10,16,20,0.54)` liquid tint, `rgba(12,16,20,0.72)` fallback floor |
| Hairline | 1 px white at 8-12% | 1 px white at 10% |
| Shadow | Single cold low shadow, y 8-16, blur 24-32, alpha ~18% | cold `#061316`, y 12, blur 26, opacity 28% in RN shadow terms |
| Icon box | 22-24 pt | 24 pt SVG inside 25 pt optical wrapper |
| Inactive icon/label | Cool grey at ~45-55% | token muted |
| Active icon/label | Clear cyan/near-white, no large block | Instrument Cyan |
| Active indicator | Contained item treatment, no full-height slab | 46 x 32 pt capsule behind icon only |
| Label size | 10-11 pt | 10 pt |
| Label tracking | 0 | 0 |
| Item distribution | Equal thirds | Equal thirds |
| Press motion | subtle scale/color transition | existing `PressableScale` + spring crossfade |
