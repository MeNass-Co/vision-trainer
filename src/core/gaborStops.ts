import type { CalibrationProfile } from '../types';
import { pixelsPerDegree } from './displayCalibration';

/**
 * Pure stimulus math for the live SVG Gabor approximation (GaborCanvas.tsx).
 *
 * The SVG approximates a Gabor as (1) an oriented LinearGradient sampling a
 * gamma-corrected sinusoid and (2) a background-colored RadialGradient
 * occluder whose opacity follows 1 - exp(-r²/2σ²), so the transmitted
 * carrier amplitude follows the Gaussian envelope.
 *
 * Unit chain (deg → physical px → dp), verified against displayCalibration:
 * - `pixelsPerDegree(profile)` returns PHYSICAL device pixels per degree:
 *   dpi (nominal 160 dp/inch) / 2.54 × cm-per-degree × devicePixelRatio —
 *   the DPR multiply lives inside pixelsPerDegree.
 * - SVG/layout coordinates are dp (density-independent points), so every
 *   physical-px quantity is divided by devicePixelRatio exactly once, here,
 *   to produce `diameterDp`. Nothing downstream multiplies or divides by
 *   DPR again.
 *
 * NOTE: `displayCalibration.luminanceToLinearGray` is misnamed — it
 * gamma-ENCODES a normalized linear luminance into a display gray value.
 * This module keeps linear-luminance and encoded ("cv", color value)
 * quantities explicitly separate.
 */

/**
 * Version of the stimulus engine, stamped onto every stored session so
 * threshold histories stay comparable across engine changes:
 * 1 = legacy uncalibrated SVG stripe stimulus (nominal spatial frequency,
 *     no Gaussian envelope, contrast applied as sRGB opacity);
 * 2 = calibrated Gaussian Gabor (real spatial frequency, Gaussian envelope,
 *     gamma-symmetric Michelson contrast).
 */
export const STIMULUS_VERSION = 2;

/** Mirrors the max-luminance normalization in displayCalibration (Lmax = 80 cd/m² → 1). */
const MAX_LUMINANCE_CDM2 = 80;

/** Below this carrier period (physical px) the display cannot resolve the grating. */
export const MIN_CYCLE_PX = 4;

/** Matches the sigmaPixels() fallback so an unspecified size stays consistent. */
export const DEFAULT_GABOR_SIZE_DEG = 4;

/** The patch spans ±3σ: envelope amplitude at the rim is exp(-4.5) ≈ 1.1%. */
export const ENVELOPE_RADIUS_SIGMA = 3;

/** ≥ 12 required for a faithful piecewise-linear Gaussian; 16 keeps max error small. */
export const ENVELOPE_STOP_COUNT = 16;

/** Sinusoid sampling density for the stripe gradient (≥ 8 stops per cycle). */
export const STOPS_PER_CYCLE = 8;

export type GaborGeometry = {
  /** Patch bounding box (= 6σ) in physical device px. */
  diameterPx: number;
  /** Patch bounding box in dp — the unit react-native-svg draws in. */
  diameterDp: number;
  /** Gaussian envelope σ in physical device px (= diameterPx / 6). */
  sigmaPx: number;
  /** Real carrier cycle count across the patch: gaborSizeDeg × cpd (unless clamped). */
  cyclesAcrossPatch: number;
  /** True when the requested cycle width fell below MIN_CYCLE_PX and was clamped. */
  cycleWidthClamped: boolean;
};

export function computeGaborGeometry(
  profile: CalibrationProfile,
  spatialFrequencyCpd: number,
  gaborSizeDeg?: number
): GaborGeometry {
  const sizeDeg =
    Number.isFinite(gaborSizeDeg) && (gaborSizeDeg as number) > 0
      ? (gaborSizeDeg as number)
      : DEFAULT_GABOR_SIZE_DEG;
  const ppd = pixelsPerDegree(profile);
  const diameterPx = sizeDeg * ppd;
  // Carrier period in physical px; clamping (with a caller-side warn) keeps an
  // unresolvable frequency visible instead of silently fabricating a finer one.
  const requestedCyclePx = ppd / spatialFrequencyCpd;
  const cycleWidthClamped = requestedCyclePx < MIN_CYCLE_PX;
  const cyclePx = Math.max(MIN_CYCLE_PX, requestedCyclePx);

  return {
    diameterPx,
    diameterDp: diameterPx / profile.devicePixelRatio,
    sigmaPx: diameterPx / (2 * ENVELOPE_RADIUS_SIGMA),
    cyclesAcrossPatch: diameterPx / cyclePx,
    cycleWidthClamped,
  };
}

/** Normalized linear luminance (Lmax = 1) from cd/m² — NOT gamma encoded. */
export function linearLuminance(luminanceCdM2: number): number {
  return Math.max(0, Math.min(1, luminanceCdM2 / MAX_LUMINANCE_CDM2));
}

/** Gamma-encode a normalized linear luminance into an 8-bit gray hex color. */
export function grayHexFromLinear(luminance: number, gamma: number): string {
  const cv = Math.pow(Math.max(0, Math.min(1, luminance)), 1 / gamma);
  const channel = Math.max(0, Math.min(255, Math.round(cv * 255)))
    .toString(16)
    .padStart(2, '0');

  return `#${channel}${channel}${channel}`;
}

export type StripeStop = { offset: number; color: string };

/**
 * Full-opacity gradient stops sampling L = Lbg·(1 + C·s), s = cos(2π·f·t + φ),
 * gamma-encoded per stop — so the grating is SYMMETRIC around the background
 * in LINEAR luminance and its Michelson contrast is exactly C:
 * (Lmax − Lmin) / (Lmax + Lmin) = C. (The old path applied contrast as sRGB
 * opacity, which skewed the excursion ~3:1 dark/light.)
 */
export function computeStripeStops(input: {
  cyclesAcrossPatch: number;
  contrast: number;
  phaseRad: number;
  backgroundLuminanceCdM2: number;
  gamma: number;
}): StripeStop[] {
  const contrast = Math.max(0, Math.min(1, input.contrast));
  const lBg = linearLuminance(input.backgroundLuminanceCdM2);
  const stopCount = Math.max(
    STOPS_PER_CYCLE,
    Math.ceil(input.cyclesAcrossPatch * STOPS_PER_CYCLE)
  );

  return Array.from({ length: stopCount + 1 }, (_, index) => {
    const t = index / stopCount;
    const s = Math.cos(2 * Math.PI * input.cyclesAcrossPatch * t + input.phaseRad);
    const luminance = Math.max(0, Math.min(1, lBg * (1 + contrast * s)));

    return { offset: t, color: grayHexFromLinear(luminance, input.gamma) };
  });
}

export type EnvelopeStop = { offset: number; opacity: number };

/**
 * Radial occluder stops for the Gaussian envelope: a background-colored
 * overlay with opacity 1 − exp(-r²/2σ²), where offset t spans the patch
 * radius (3σ), so transmitted amplitude ≈ exp(-r²/2σ²). The final stop is
 * forced fully opaque: truncating at 3σ hides a ≤ 1.1% amplitude step, below
 * display quantization at threshold contrasts. The overlay composites in
 * gamma-encoded space, which matches the linear-luminance envelope to first
 * order in C — the residual error is O(C²), negligible near threshold.
 */
export function computeEnvelopeStops(stopCount = ENVELOPE_STOP_COUNT): EnvelopeStop[] {
  return Array.from({ length: stopCount + 1 }, (_, index) => {
    const t = index / stopCount;
    const rSigma = t * ENVELOPE_RADIUS_SIGMA;
    const envelope = Math.exp(-(rSigma * rSigma) / 2);

    return { offset: t, opacity: index === stopCount ? 1 : 1 - envelope };
  });
}
