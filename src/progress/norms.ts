import type { ParadigmId } from '@/types';

// CSF anchor points (cpd → threshold contrast), ascending in frequency.
// Off-grid frequencies are log-log interpolated between neighbors; outside
// the grid the nearest edge value is clamped — never a flat fabricated value.
const CSF_GRID: readonly (readonly [number, number])[] = [
  [1.5, 0.018],
  [3, 0.012],
  [6, 0.016],
  [12, 0.04],
];

const paradigmMultiplier: Record<ParadigmId, number> = {
  'contrast-detection': 1,
  'lateral-masking': 1.25,
  'spatial-masking': 1.7,
  'backward-masking': 8,
  'pedestal-discrimination': 0.6,
};

function baselineNormContrast(spatialFrequencyCpd: number): number {
  const [firstSf, firstContrast] = CSF_GRID[0];
  const [lastSf, lastContrast] = CSF_GRID[CSF_GRID.length - 1];

  if (!Number.isFinite(spatialFrequencyCpd) || spatialFrequencyCpd <= firstSf) {
    return firstContrast;
  }
  if (spatialFrequencyCpd >= lastSf) {
    return lastContrast;
  }

  for (let i = 1; i < CSF_GRID.length; i += 1) {
    const [sfHigh, contrastHigh] = CSF_GRID[i];
    if (spatialFrequencyCpd > sfHigh) {
      continue;
    }
    const [sfLow, contrastLow] = CSF_GRID[i - 1];
    const t =
      (Math.log(spatialFrequencyCpd) - Math.log(sfLow)) / (Math.log(sfHigh) - Math.log(sfLow));

    return Math.exp(Math.log(contrastLow) + t * (Math.log(contrastHigh) - Math.log(contrastLow)));
  }

  return lastContrast;
}

export function populationNormContrast(spatialFrequencyCpd: number, paradigm: ParadigmId): number {
  return baselineNormContrast(spatialFrequencyCpd) * (paradigmMultiplier[paradigm] ?? 1);
}
