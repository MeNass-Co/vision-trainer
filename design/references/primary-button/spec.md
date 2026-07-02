# primary-button — locked spec (Phase 3)
Canvas detected: 1180×2556 px (@3x → 393.3×852.0 pt — iPhone 14/15/16 Pro class canvas; treated as 393×852pt)
Source measured: `target.png` (Opal 'Continue', full-bleed screenshot, identical file to curated `candidate-1.png`). Disabled-state rows only from `candidate-4.png` (GO Club 'Next').

| # | Property | Reference value | Our value (token/pt/hex) | How measured |
|---|---|---|---|---|

**GEOMETRY**
| 1 | Button height | 144px (y 2261.5→2405.5) | **48.0pt** | Column scan x=150 (clear of text), luminance half-max crossing top/bottom edge. |
| 2 | Corner radius | 72px, fitted circle center (119.5, 2333.5), r=72 matches measured corner curve at every sampled y (e.g. y=2270→x=85.6 predicted vs 86 measured; y=2300→x=55.8 predicted vs 56 measured) | **radius.pill (999)** — effective 24.0pt = height/2 exactly | Corner is a true stadium/pill: straight-side length = height − 2r = 0. Confirmed by circle-fit against left-corner silhouette, both samples within 1px. |
| 3 | Side margins (L/R to canvas edge) | Left edge x=47.5px, right edge x=1131.5px, canvas W=1180px → margin 47.5px each side, symmetric | **space.base (16pt)** (measured 15.83pt, −0.17pt rounding) | Row scan at y=2333 (button vertical mid, full pill width), half-max luminance crossing at both edges. |
| 4 | Bottom offset (canvas bottom → button bottom) | 2556−2405.5 = 150.5px | **safeAreaBottom (34pt, device home-indicator inset) + space.base (16pt) = 50pt** (measured 50.17pt, −0.17pt) | Same top/bottom edge detection as row 1, distance to canvas bottom row (2555). Composition inferred: 50.17pt splits almost exactly into iOS home-indicator safe area (34pt) + a standard 16pt margin. |
| 5 | Button width (informational, not must-cover) | 1084px = 361.3pt, i.e. canvas width − 2×16pt margins | derived, not a fixed token — flex to container minus 2×space.base | Row scan, same as row 3. |

**COLOR & GRADIENT**
| 6 | Gradient axis/angle | Purely horizontal, 0 vertical variance confirmed (top-row vs bottom-row color diff = 0 at 5 x-samples) | **CSS `to right` / 90°**, i.e. `linear-gradient(90deg, ACCENT_HOT → ACCENT_CORE → ACCENT)` | Sampled same x at y=2270 vs y=2398 (flat interior rows), diff=0 in RGB at x=200/400/600/800/1000. |
| 7 | Gradient stops — full stop-level table (position / reference hex / reference luminance / our interpolated hex / our luminance) | See table below | See table below | Sampled every 10% of button interior width (x 49→1129, y=2333 mid-line; y=2380 used for the 3 stops that fall under the "Continue" glyph to dodge text pixels — confirmed gradient is x-only so y swap is valid). |
| 7a | 0% | `#D6FFA2` (214,255,162), lum 239.6 | `#CFFAFB` = **ACCENT_HOT**, lum 240.9 | direct pixel sample |
| 7b | 10% | `#D0FFAB` (208,255,171), lum 238.9 | `#B8F7F8`, lum 233.3 (interp HOT→CORE, t=0.2) | direct pixel sample |
| 7c | 20% | `#CCFFB9` (204,255,185), lum 239.1 | `#A1F3F5`, lum 225.8 | direct pixel sample |
| 7d | 30% | `#C5FEC1` (197,254,193), lum 237.5 | `#89F0F2`, lum 218.2 | direct pixel sample |
| 7e | 40% | `#C1FECB` (193,254,203), lum 237.3 | `#72ECEF`, lum 210.6 | direct pixel sample (y=2380, text-dodge) |
| 7f | 50% | `#BCFED7` (188,254,215), lum 237.2 | `#5BE9EC` = **ACCENT_CORE**, lum 203.0 | direct pixel sample (y=2380, text-dodge) |
| 7g | 60% | `#B8FEDC` (184,254,220), lum 236.7 | `#53E4E8`, lum 197.7 (interp CORE→ACCENT, t=0.2) | direct pixel sample (y=2380, text-dodge) |
| 7h | 70% | `#B2FDE6` (178,253,230), lum 235.4 | `#4BE0E3`, lum 192.4 | direct pixel sample |
| 7i | 80% | `#ACFCF1` (172,252,241), lum 234.2 | `#43DBDF`, lum 187.1 | direct pixel sample |
| 7j | 90% | `#A8FBF7` (168,251,247), lum 233.1 | `#3BD7DA`, lum 181.8 | direct pixel sample |
| 7k | 100% | `#A3FBFD` (163,251,253), lum 232.4 | `#33D2D6` = **ACCENT** , lum 176.5 | direct pixel sample, verified stable x=1126–1129 (x=1130-1131 are 1-2px AA edge, excluded) |
| 8 | **Luminance-delta fidelity flag** | Reference ramp is near-isoluminant: lum drops only 239.6→232.4 end-to-end (**−3.0%**), i.e. this is chiefly a hue-rotation (lime→mint→cyan) at ~constant lightness, not a light-to-dark ramp. | Our fixed ladder HOT→CORE→ACCENT drops 240.9→176.5 (**−26.7%**), ~9× steeper than reference. | Computed via `0.2126R+0.7152G+0.0722B` on both stop sets. Reported per target.md's explicit Phase-2 instruction to map 1:1 onto HOT→CORE→ACCENT regardless — implementer should know this trades stop-level hue fidelity for a punchier contrast than the source photo actually has. Not a defect, a declared carve-out; flagging so it isn't mistaken for a measurement error. |
| 9 | Label color (enabled) | Darkest sampled text pixel `#010001` (≈ pure black) | **text.inverse `#08161A`** | Min-luminance pixel search inside text bbox (x 485–700, y 2295–2375). |

**MATERIAL / GLOW**
| 10 | Ambient glow — color/opacity/blur/offset | **Could not isolate a distinct button-local glow.** Sampled background at 10/20/…/150px above and below the pill edge at 5 x-positions (lime/mint/cyan zones): values plateau immediately (e.g. below-edge: 44,52,34 → 41,50,33 flat from 20px to 80px, only a slow drift after that) rather than showing a peak-then-exponential-decay bloom signature. The apparent brightness near the button is consistent with the screen's own large-radius ambient vignette (which is off-center and varies independently of the button's position), not a localized emissive halo baked around the pill. | **ACCENT_GLOW `rgba(51,210,214,0.30)`** used as a low, flat ambient bloom behind the button (per target.md: "echoes our celestial bloom language") — this is a design decision carried from Phase 2, not a reverse-engineered value. Recommend rendering at reduced opacity (~0.15–0.20) given the reference shows only a faint, inconclusive effect. blur ≈ 24–32pt (visual estimate only), offset = centered/0,0. | **FLAG: unmeasurable from this PNG** — no clean peak-to-baseline falloff detected; reported best-effort estimate, not a hard measurement. |

**TYPE**
| 11 | Label font size | Cap-height 38px (2316→2353, letter "C") = 12.67pt. Est. font-size via SF-Pro cap-height ratio (≈0.714) → **≈17.8pt** | Nearest token: **type.heading (fontSize 20, lineHeight 26)**, delta **−2.2pt** | Cropped+upscaled 4× text region, cap-height pixel bbox of "C" via min-luminance threshold scan. |
| 12 | Label weight | Stroke width ≈4–5px on 38px cap-height (≈8.3% of estimated em) — consistent with Regular/Medium, well below Semibold/Bold stroke ratios (~12%+) | Nearest token: **fontFamily.medium** | Horizontal scanline through "n" stem run-length count at y=2345; visual crop confirms moderate (not bold) stroke weight. |
| 13 | Label letter-spacing | No visible extra tracking; default/tight | **0** (matches type.body/bodyStrong letterSpacing:0) — not reliably distinguishable at this resolution to ±0.1pt | Visual inspection of upscaled crop; inter-glyph gaps read as default proportional spacing, no wide tracking. |
| 14 | Label color | see row 9 | text.inverse | — |

**STATES**
| 15 | Enabled — fill opacity | 100% opaque (background never shows through fill anywhere across the gradient) | **100% (opaque gradient fill, rows 6–8)** | Confirmed zero background bleed at every sampled gradient stop. |
| 16 | Enabled — label opacity | 100% (near-black `#010001` at full contrast against light fill) | **100%, text.inverse** | Row 9. |
| 17 | Disabled — fill opacity (secondary source: candidate-4 'Next') | Fill = translucent light overlay over the scene background; solving `fill = a·white + (1−a)·local_bg` at 4 x-positions gives α ≈ 0.04–0.14 (mean ≈ 0.09) | **fill at ≈10% opacity** vs enabled 100% → **−90% opacity delta** | Sampled fill pixel vs local background directly above the pill at the same x (to cancel the scene's own radial gradient), 4 locations, alpha-blend inversion assuming white overlay. |
| 18 | Disabled — label opacity (candidate-4 'Next') | Letter-stroke pixel `(109,133,252)` vs adjacent gap/fill baseline `(80,106,244)` at the same row → α ≈ 0.17–0.18 (R,G channels; B channel saturated/unreliable, excluded) | **label at ≈35–40% opacity** (text.inverse-family swapped for a light/on-accent token at reduced alpha, proportionally scaled from the ~17–18% raw overlay reading against an already-bright disabled fill) → **−60 to −65% opacity delta** vs enabled 100% | Local scanline through "Next" at y=2320, alternating letter-stroke/gap pixel pairs (x 515–650), alpha-blend inversion. Crop screenshot confirms low-contrast "ghost" label visually. |
| 19 | Disabled — shape/geometry | Same pill silhouette retained, thin hairline stroke visible at edge (not separately measured — out of scope per task) | unchanged geometry, fill/label opacity only | Visual confirmation only, not pixel-measured (out of requested scope). |

**MOTION**
| 20 | Press scale / spring | not measurable from a static PNG | **ORCHESTRATOR-SETS** | n/a |
| 21 | Enabled↔disabled transition timing | not measurable from a static PNG | **ORCHESTRATOR-SETS** | n/a |
