import { beforeAll, describe, expect, it } from 'vitest';

import enProgress from '@/i18n/locales/en/progress.json';
import { __setLocaleForTests } from '@/i18n';

import { formatDelta } from './verdictFormatting';

// formatDelta now resolves its baseline word through i18n; pin the locale to
// English and assert against the English resource itself, so the intent
// (flat progress reads as a named baseline, never "0.00") is verified without
// duplicating the literal copy in the test.
describe('formatDelta', () => {
  beforeAll(() => {
    __setLocaleForTests('en');
  });

  it('labels flat progress as a baseline instead of 0.00', () => {
    expect(formatDelta(0)).toBe(enProgress.verdict.baseline);
    expect(formatDelta(-0)).toBe(enProgress.verdict.baseline);
    expect(formatDelta(0.004)).toBe(enProgress.verdict.baseline);
  });

  it('formats meaningful movement with direction', () => {
    expect(formatDelta(0.02)).toBe('+0.02');
    expect(formatDelta(-0.02)).toBe('−0.02');
  });
});
