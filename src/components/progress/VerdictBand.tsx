import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { ACCENT, fontWeight, space, text, type as typo, verdict as verdictColors } from '@/theme/tokens';

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
// has zero rows). The delta chip is demoted to the Eight Sleep dot+word
// secondary treatment: a 4pt state-colored dot + tertiary-grey value, no pill.
export function VerdictBand({ verdict, delta, caption, captionTone = 'default' }: VerdictBandProps) {
  const verdictColor = verdictColors[verdict];

  return (
    <View style={styles.lockup}>
      <AppText style={[styles.verdictWord, { color: verdictColor }]}>{formatVerdictWord(verdict)}</AppText>
      <AppText style={[styles.caption, captionTone === 'accent' && styles.captionAccent]}>{caption}</AppText>
      <View style={styles.deltaChip}>
        <View style={[styles.dot, { backgroundColor: verdictColor }]} />
        <AppText style={styles.deltaWord} tabular>
          {formatDelta(delta)}
        </AppText>
      </View>
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
  deltaChip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xs, // spec row 17: delta-chip word ↔ dot gap (nearest token space.xs).
    // caption → delta-chip position isn't a spec row (the chip is an addition
    // borrowed only for its own dot+word anatomy, not placed by either
    // reference) — space.sm keeps it reading as a footnote beneath the lockup.
    marginTop: space.sm,
  },
  deltaWord: {
    ...typo.caption,
    // spec row 9: type.caption with weight override → regular (matches reference).
    color: text.tertiary,
    fontWeight: fontWeight.regular,
    // "+" has generous inherent left-bearing; without this the space.xs gap
    // (row 17) reads ~1.7pt wider than spec. Calibrated against a native capture.
    marginLeft: -2,
  },
  dot: {
    borderRadius: 2, // spec row 12: 4pt diameter, circular.
    height: 4,
    width: 4,
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
