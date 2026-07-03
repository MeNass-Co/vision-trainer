import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { ACCENT, fontWeight, text, type as typo, verdict as verdictColors } from '@/theme/tokens';

import { formatDelta, formatVerdictWord, type Verdict } from './verdictFormatting';

export type VerdictBandProps = {
  verdict: Verdict;
  delta: number;
  caption: string;
  // Preserves the existing needs-retest accent signal (functional, not
  // decorative) now that the caption lives inside this lockup.
  captionTone?: 'default' | 'accent';
};

// verdict-band spec (Oura lockup, design/references/verdict-band/spec.md):
// score (rendered by the caller) → named verdict word → supporting caption,
// centered, all text-only (no card/glass material — spec's MATERIAL section
// has zero rows). Three tiers, not four: the delta is merged into the
// verdict line itself ("Improving · +0.18" — verdict word + middot + delta
// value, all in the verdict color at the verdict-word style) rather than a
// separate dot+word tier underneath; "Reliable reading" stays the third tier.
export function VerdictBand({ verdict, delta, caption, captionTone = 'default' }: VerdictBandProps) {
  const verdictColor = verdictColors[verdict];

  return (
    <View style={styles.lockup}>
      <AppText style={[styles.verdictWord, { color: verdictColor }]} tabular>
        {formatVerdictWord(verdict)} · {formatDelta(delta)}
      </AppText>
      <AppText style={[styles.caption, captionTone === 'accent' && styles.captionAccent]}>{caption}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  // spec row 8: caption color measured as text.primary (near-exact match).
  caption: {
    ...typo.bodyStrong,
    // spec row 6: type.bodyStrong with weight override → bold.
    color: text.primary,
    fontWeight: fontWeight.bold,
    // spec row 16: verdict-word bottom → caption top ≈23pt (nearest token
    // space.lg=24). Raw marginTop of 24 overshoots the *visual* gap because
    // RN line-height leading adds space beyond the glyph edges on both
    // sides (word's descender-to-box-bottom + caption's box-top-to-cap);
    // trimmed empirically against a native capture to land on the spec's
    // measured target rather than the token's face value.
    marginTop: 15,
    textAlign: 'center',
  },
  captionAccent: {
    color: ACCENT,
  },
  lockup: {
    alignItems: 'center',
    // spec row 15: score bottom → verdict-word top ≈19pt, measured from the
    // rendered glyph edge, not the score container's box edge. The score's
    // fixed-height box (heroNumber, out of this element's blast radius)
    // reserves generous top/bottom padding for the CountUpNumber glow — this
    // negative margin compensates for that padding so the *optical* gap
    // between the digit glyphs and this word matches the spec, without
    // touching the score block itself. Calibrated against a native capture.
    marginTop: -62,
  },
  verdictWord: {
    ...typo.caption,
    // spec row 3: type.caption with weight override → bold, tracking untouched
    // (already 0, matches the reference's tight/normal kerning — row 4).
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
});
