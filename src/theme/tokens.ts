/**
 * Design-token sources: Linear ladder, Ultrahuman near-black, Claude warm ground,
 * Robinhood/Monzo one-accent restraint, and WHOOP verdict bands.
 */
import { StyleSheet } from 'react-native';

export const surface = {
  base: '#080A0D',
  raised: '#0E1316',
  card: '#12181C',
  cardPressed: '#161D21',
  overlay: '#141F22',
  warm: '#0C1417',
  hairline: '#1E2A2D',
  hairlineStrong: '#28363A',
  // Token addendum (VALIDATION.md) — additive.
  controlTrackOff: '#33383D',
  sheet: '#1B2225'
} as const;

export const text = {
  primary: '#EFF3F4',
  secondary: '#A7B2B4',
  // muted: cool cyan-grey (moonlight, not firelight). ≈4.87:1 on surface.base #080A0D — clears WCAG AA 4.5:1.
  muted: '#6E827F',
  inverse: '#08161A',
  // Token addendum (VALIDATION.md) — additive.
  faint: '#2B3231',
  tertiary: '#6B7477',
  secondaryBright: '#C9D6D7'
} as const;

// SIGNATURE ACCENT - single living hue, run as a luminance LADDER, never one flat value.
// Assign by ROLE: core = the one live element on a screen; default = primary CTA;
// soft = decorative/structural cyan (gratings, arcs); muted = dim rims; glow = passive/idle states.
export const ACCENT_CORE = '#5BE9EC' as const;
export const ACCENT = '#33D2D6' as const;
export const ACCENT_SOFT = '#1E8C8F' as const;
export const ACCENT_GLOW = 'rgba(51,210,214,0.30)' as const;
export const ACCENT_MUTED = '#2B6166' as const;
// near-white hot core for believable light emission (3-stop glow temperature).
export const ACCENT_HOT = '#CFFAFB' as const;

export const accent = {
  core: ACCENT_CORE,
  default: ACCENT,
  soft: ACCENT_SOFT,
  glow: ACCENT_GLOW,
  muted: ACCENT_MUTED,
  hot: ACCENT_HOT,
  idle: ACCENT_GLOW,
  amber: '#6FE3E6',
  ember: '#26C3C8',
  // Token addendum (VALIDATION.md, law 3) — isoluminant CTA fill, horizontal 5-stop ramp.
  ctaRamp: ['#A7F6E4', '#98F3EC', '#8BEFF2', '#79ECF4', '#6FE9F6'],
  trackTint: 'rgba(51,210,214,0.15)',
  onLight: '#0B6A6D'
} as const;

export const verdict = {
  improving: '#5FD0B0',
  holding: '#8A9099',
  regressing: '#E0607A'
} as const;

export const data = {
  track: '#16201F',
  canvas: '#080C0E',
  heroGlow: 'rgba(51,200,214,0.10)',
  heroGlowStrong: 'rgba(51,200,214,0.16)'
} as const;

export const material = {
  blurIntensity: 40,
  blurTint: 'dark',
  radius: 22,
  hairlineOnGlass: 'rgba(255,255,255,0.12)',
  // Token addendum (VALIDATION.md) — additive.
  hairlineOutline: 'rgba(255,255,255,0.34)',
  fillChip: 'rgba(255,255,255,0.05)',
  fillCard: 'rgba(255,255,255,0.07)',
  pillOnGlass: 'rgba(255,255,255,0.10)',
  // ONE-material pass (native-revamp, Phase 4 final wave): every card/pill
  // becomes real Liquid Glass (GlassCard, CustomTabBar's GlassView pattern)
  // with a shared cyan-tinged hairline and a THREE-TIER tint hierarchy — same
  // hue family, graded transparency, never forked per-card:
  //   Tier 1 · chrome  — tab bar + SheetCloseButton chip (bespoke, no token; barely tinted).
  //   Tier 2 · surface — settings section cards, calibration slider card (glassSurface).
  //   Tier 3 · content — Vision profile / spatial-frequency / trend / science / paywall plan cards (glassContent).
  hairlineGlassAccent: 'rgba(91,233,236,0.10)',
  glassSurface: 'rgba(18,42,46,0.35)',
  glassContent: 'rgba(16,36,40,0.55)'
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  // progress-chart spec row 4 (card top padding, 20.3pt measured) — sits between
  // base/lg with no exact sibling; promoted to a named token per the "tokens,
  // never magic numbers" rule.
  cardTop: 20
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  pill: 999,
  // Token addendum (VALIDATION.md) — additive.
  xs: 4,
  xl: 25,
  sheet: 36,
  floatingBar: 27
} as const;

export const hairline = {
  width: StyleSheet.hairlineWidth,
  px1: 1
} as const;

// SF Pro (the iOS system font) is picked up automatically by React Native on
// iOS whenever a Text style OMITS `fontFamily` and specifies `fontWeight`
// instead — RN then also auto-selects the correct optical size (SF Pro Text
// under 20pt, SF Pro Display at/above 20pt). Do not reintroduce a fontFamily
// string here; that is what forces the web/Android-reading Inter fallback.
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
} as const;

export const type = {
  hero: {
    fontWeight: fontWeight.bold,
    fontSize: 47,
    lineHeight: 47,
    letterSpacing: -0.5
  },
  display: {
    fontWeight: fontWeight.semibold,
    fontSize: 88,
    lineHeight: 88,
    letterSpacing: -1.0
  },
  title: {
    fontWeight: fontWeight.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0
  },
  heading: {
    fontWeight: fontWeight.medium,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0
  },
  body: {
    fontWeight: fontWeight.regular,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0
  },
  bodyStrong: {
    fontWeight: fontWeight.medium,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0
  },
  caption: {
    fontWeight: fontWeight.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0
  },
  micro: {
    fontWeight: fontWeight.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.3
  },
  // Token addendum (VALIDATION.md) — additions, not replacements.
  tabLabel: {
    fontWeight: fontWeight.medium,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.1
  },
  // Owner override (nassim-fixes): 24/28 read oversized on the Progress rows
  // (both numeric values like "6" and word-values like "Reliable") — dropped
  // to 20/24 across the board, single-token change rather than splitting
  // word-vs-number sizing.
  metricValue: {
    fontWeight: fontWeight.semibold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'] as const
  },
  numeral: {
    fontWeight: fontWeight.bold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0
  }
} as const;

export const tabularFigures = {
  fontVariant: ['tabular-nums'] as const
} as const;

// Token addendum (VALIDATION.md) — additive.
export const icon = {
  tab: 23
} as const;

export const sparkline = {
  width: 26,
  height: 30,
  stroke: 2
} as const;

export const motion = {
  spring: {
    input: { stiffness: 240, damping: 18, mass: 1 },
    press: { stiffness: 300, damping: 20, mass: 1 },
    liquid: { stiffness: 220, damping: 28, mass: 1 },
    reward: { stiffness: 200, damping: 12, mass: 1 },
    snap: { stiffness: 180, damping: 22, mass: 1 },
    response: { stiffness: 240, damping: 22, mass: 1 },
    toggle: { stiffness: 200, damping: 15, mass: 1 }
  },
  timing: {
    entranceMs: 280,
    staggerMs: 32,
    drawOnMs: 900,
    countUpProgressMs: 1000,
    countUpRewardMs: 200,
    shimmerMs: 1200,
    breatheMs: 4000,
    rangeFadeMs: 150,
    rangeDrawMs: 600,
    responseDwellMs: 380
  },
  ambientMs: 20000,
  pressScale: 0.96,
  haptics: {
    tick: 'light',
    select: 'selection',
    correct: 'medium',
    wrong: 'warning',
    milestone: 'success',
    numberSettle: 'medium',
    rewardChord: 'success-light-light',
    success: 'success',
    warning: 'warning'
  }
} as const;

export const tokens = {
  surface,
  text,
  accent,
  verdict,
  data,
  material,
  space,
  radius,
  hairline,
  fontWeight,
  type,
  tabularFigures,
  motion,
  icon,
  sparkline
} as const;
