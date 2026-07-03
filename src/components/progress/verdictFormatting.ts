export function formatDelta(delta: number) {
  if (Math.abs(delta) < 0.005) return 'Baseline';

  const sign = delta < 0 ? '−' : delta > 0 ? '+' : '';

  return `${sign}${Math.abs(delta).toFixed(2)}`;
}

export type Verdict = 'improving' | 'holding' | 'regressing';

// verdict-band spec — the score→verdict lockup names the trend directly
// (Oura "Optimal" anatomy); color alone never carries the meaning.
const VERDICT_WORDS: Record<Verdict, string> = {
  improving: 'Improving',
  holding: 'Holding',
  regressing: 'Regressing',
};

export function formatVerdictWord(verdict: Verdict) {
  return VERDICT_WORDS[verdict];
}
