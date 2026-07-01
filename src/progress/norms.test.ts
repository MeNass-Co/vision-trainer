import { describe, expect, it } from 'vitest';

import { populationNormContrast } from './norms';

describe('populationNormContrast', () => {
  it('returns the anchor values exactly on the CSF grid', () => {
    expect(populationNormContrast(1.5, 'contrast-detection')).toBeCloseTo(0.018, 10);
    expect(populationNormContrast(3, 'contrast-detection')).toBeCloseTo(0.012, 10);
    expect(populationNormContrast(6, 'contrast-detection')).toBeCloseTo(0.016, 10);
    expect(populationNormContrast(12, 'contrast-detection')).toBeCloseTo(0.04, 10);
  });

  it('log-log interpolates off-grid frequencies between their neighbors', () => {
    // Geometric midpoint of 3 and 6 cpd → geometric mean of the anchors.
    expect(populationNormContrast(Math.sqrt(3 * 6), 'contrast-detection')).toBeCloseTo(
      Math.sqrt(0.012 * 0.016),
      10
    );

    const between = populationNormContrast(2, 'contrast-detection');
    expect(between).toBeGreaterThan(0.012);
    expect(between).toBeLessThan(0.018);

    const upper = populationNormContrast(9, 'contrast-detection');
    expect(upper).toBeGreaterThan(0.016);
    expect(upper).toBeLessThan(0.04);
  });

  it('clamps to the edge anchors outside the grid instead of a flat fallback', () => {
    expect(populationNormContrast(0.5, 'contrast-detection')).toBeCloseTo(0.018, 10);
    expect(populationNormContrast(24, 'contrast-detection')).toBeCloseTo(0.04, 10);
  });

  it('applies the paradigm multiplier on top of the interpolated baseline', () => {
    expect(populationNormContrast(3, 'backward-masking')).toBeCloseTo(0.012 * 8, 10);
    expect(populationNormContrast(Math.sqrt(3 * 6), 'pedestal-discrimination')).toBeCloseTo(
      Math.sqrt(0.012 * 0.016) * 0.6,
      10
    );
  });
});
