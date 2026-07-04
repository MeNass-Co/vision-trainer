import { t } from '@/i18n';

export function formatDelta(delta: number) {
  if (Math.abs(delta) < 0.005) return t('progress.verdict.baseline');

  const sign = delta < 0 ? '−' : delta > 0 ? '+' : '';

  return `${sign}${Math.abs(delta).toFixed(2)}`;
}

export type Verdict = 'improving' | 'holding' | 'regressing';

// verdict-band spec — the score→verdict lockup names the trend directly
// (Oura "Optimal" anatomy); color alone never carries the meaning.
export function formatVerdictWord(verdict: Verdict) {
  return t(`progress.verdict.${verdict}`);
}
