import { describe, expect, it } from 'vitest';

import { pixelsPerDegree } from './displayCalibration';
import {
  computeEnvelopeStops,
  computeGaborGeometry,
  computeStripeStops,
  ENVELOPE_RADIUS_SIGMA,
  MIN_CYCLE_PX,
  STOPS_PER_CYCLE,
} from './gaborStops';
import type { CalibrationProfile } from '../types';

const deviceProfile: CalibrationProfile = {
  id: 'test-device',
  createdAt: new Date(0).toISOString(),
  devicePixelRatio: 3,
  screenWidthPx: 1179,
  screenHeightPx: 2556,
  dpi: 160,
  viewingDistanceCm: 33,
  gamma: 2.2,
  refreshRateHz: 60,
  backgroundLuminanceCdM2: 40,
};

function decodeLinear(hex: string, gamma: number): number {
  const cv = parseInt(hex.slice(1, 3), 16) / 255;
  return Math.pow(cv, gamma);
}

describe('computeGaborGeometry', () => {
  it('derives the patch from calibration: diameter = gaborSizeDeg × ppd, dp = px / DPR, σ = diameter/6', () => {
    const ppd = pixelsPerDegree(deviceProfile);
    const geometry = computeGaborGeometry(deviceProfile, 2, 6);

    // Known profile: dpi 160 (dp/inch) × DPR 3 at 33 cm → ppd ≈ 108.85 physical px/deg.
    expect(ppd).toBeCloseTo(108.85, 1);
    expect(geometry.diameterPx).toBeCloseTo(6 * ppd, 6);
    expect(geometry.diameterDp).toBeCloseTo(geometry.diameterPx / 3, 6);
    expect(geometry.sigmaPx).toBeCloseTo(geometry.diameterPx / 6, 6);
  });

  it('produces the REAL cycle count: patchDeg × cpd when the display resolves the carrier', () => {
    const geometry = computeGaborGeometry(deviceProfile, 2, 6);

    expect(geometry.cyclesAcrossPatch).toBeCloseTo(12, 6);
    expect(geometry.cycleWidthClamped).toBe(false);

    const fine = computeGaborGeometry(deviceProfile, 12, 4);
    expect(fine.cyclesAcrossPatch).toBeCloseTo(48, 6);
    expect(fine.cycleWidthClamped).toBe(false);
  });

  it('clamps unresolvable frequencies (cycle < MIN_CYCLE_PX) and flags it instead of fabricating', () => {
    const ppd = pixelsPerDegree(deviceProfile);
    const geometry = computeGaborGeometry(deviceProfile, 40, 4);

    expect(ppd / 40).toBeLessThan(MIN_CYCLE_PX);
    expect(geometry.cycleWidthClamped).toBe(true);
    expect(geometry.cyclesAcrossPatch).toBeCloseTo(geometry.diameterPx / MIN_CYCLE_PX, 6);
  });

  it('falls back to the default 4° patch when gaborSizeDeg is absent', () => {
    const ppd = pixelsPerDegree(deviceProfile);

    expect(computeGaborGeometry(deviceProfile, 2).diameterPx).toBeCloseTo(4 * ppd, 6);
  });
});

describe('computeEnvelopeStops', () => {
  it('is monotone increasing occlusion whose transmission follows exp(-r²/2σ²) out to 3σ', () => {
    const stops = computeEnvelopeStops();

    expect(stops.length).toBeGreaterThanOrEqual(13);
    for (let i = 0; i < stops.length - 1; i += 1) {
      const rSigma = stops[i].offset * ENVELOPE_RADIUS_SIGMA;
      expect(1 - stops[i].opacity).toBeCloseTo(Math.exp(-(rSigma * rSigma) / 2), 10);
      expect(stops[i + 1].opacity).toBeGreaterThanOrEqual(stops[i].opacity);
    }
    expect(stops[0].opacity).toBe(0);
    expect(stops.at(-1)?.opacity).toBe(1);
  });
});

describe('computeStripeStops', () => {
  const base = {
    cyclesAcrossPatch: 4,
    contrast: 0.4,
    phaseRad: 0,
    backgroundLuminanceCdM2: 40,
    gamma: 2.2,
  };

  it('samples at least 8 stops per cycle', () => {
    expect(computeStripeStops(base).length).toBeGreaterThanOrEqual(4 * STOPS_PER_CYCLE + 1);
  });

  it('is symmetric around the background in LINEAR luminance and recovers the Michelson contrast', () => {
    const stops = computeStripeStops(base);
    const luminances = stops.map((stop) => decodeLinear(stop.color, base.gamma));
    const lMax = Math.max(...luminances);
    const lMin = Math.min(...luminances);

    // Lbg = 40/80 = 0.5 linear; L = Lbg(1 ± C) → symmetric excursion.
    expect(lMax + lMin).toBeCloseTo(2 * 0.5, 2);
    // Michelson: (Lmax − Lmin) / (Lmax + Lmin) = C (8-bit quantization tolerance).
    expect((lMax - lMin) / (lMax + lMin)).toBeCloseTo(base.contrast, 2);
  });

  it('renders the pure background at zero contrast', () => {
    const stops = computeStripeStops({ ...base, contrast: 0 });
    // cv = 0.5^(1/2.2) ≈ 0.7297 → 186 → #BABABA, the session-field gray.
    for (const stop of stops) {
      expect(stop.color.toUpperCase()).toBe('#BABABA');
    }
  });

  it('scales the linear-luminance amplitude linearly with contrast', () => {
    const amplitude = (contrast: number) => {
      const stops = computeStripeStops({ ...base, contrast });
      const luminances = stops.map((stop) => decodeLinear(stop.color, base.gamma));
      return (Math.max(...luminances) - Math.min(...luminances)) / 2;
    };

    expect(amplitude(0.8)).toBeCloseTo(2 * amplitude(0.4), 2);
  });
});
