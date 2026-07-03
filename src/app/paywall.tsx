import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { AppText, FadeIn, PrimaryButton, Screen, SecondaryButton } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { accent, fontWeight, hairline, radius, space } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const BENEFITS = [
  'Adaptive sessions adjusted to your readings',
  'Progress graphs with confidence and retest states',
  'Private by design. Your readings stay on this device.',
] as const;

const CHECK_WIDTH = 14;
const CHECK_HEIGHT = 10;

/**
 * paywall spec rows 1-2, 10, 14, 17, 25 — the "Most Popular"-chip primitive:
 * flat `accent.core` fill (the reference's shared light-accent tint), `text.inverse`
 * ink (the reference's dark-on-accent text, re-verified ruler-gridded), fully-rounded
 * pill, bold caption type. Does NOT match ContextChip's family (that's the outline
 * chip from screen-header law 6 — hairline border, `surface.raised` fill, no accent).
 * Reused verbatim for both chip slots the spec measured: the top eyebrow (row 1,
 * "re-use the Chip primitive measured in row 2") and the plan-badge (row 2 itself).
 */
function FilledChip({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.filledChip, style]}>
      <AppText color="inverse" style={styles.filledChipText} uppercase variant="caption">
        {label}
      </AppText>
    </View>
  );
}

// spec row 3: checkmark glyph bbox 14.0x9.7pt — plain stroke glyph, no circular
// backing chip (the reference's checks sit directly on the flat background).
// Anchored to the FIRST line of a (possibly wrapped) feature row: featureRow
// is flex-start (not center, which would center on the whole wrapped-text
// block height), and this glyph's own marginTop nudges its optical center to
// the first line's cap-height center rather than the row's top edge.
// Calibrated against a native capture of the two-line "Progress graphs…" row.
function CheckGlyph() {
  return (
    <Svg height={CHECK_HEIGHT} style={styles.checkGlyph} width={CHECK_WIDTH} viewBox="0 0 14 10">
      <Path
        d="M1.4 5.3L5.2 9L12.6 1"
        fill="none"
        stroke={accent.core}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const reduceMotion = useEffectiveReducedMotion();

  // Onboarding completion is persisted here, once the paywall has actually
  // mounted: flipping it inside onboarding's completion handler raced the root
  // route gate (segments still read 'onboarding' when the flag flips, so the
  // gate's replace toward the tabs stomped the in-flight replace to this
  // screen). Re-entry from Settings makes this a no-op rewrite.
  useEffect(() => {
    useAppStore.getState().updateSetting('onboardingComplete', true);
  }, []);

  // Early access: no purchase can occur yet, so no prices and no subscription
  // claims are shown. Membership state is still recorded for the future gate.
  const startTraining = () => {
    const store = useAppStore.getState();
    store.updateSetting('subscriptionStatus', 'trialing');
    store.updateSetting('trialStartedAt', new Date().toISOString());
    router.replace('/(tabs)' as Href);
  };

  const maybeLater = () => {
    useAppStore.getState().updateSetting('subscriptionStatus', 'free');
    router.replace('/(tabs)' as Href);
  };

  return (
    <Screen scroll padded background={<AmbientGradient constellation reduceMotion={reduceMotion} />}>
      <View style={styles.screen}>
        {/* Everything below follows the reference's LEFT-aligned column and its
            stack order: headline block → checkmark features → plan card → CTA
            pair → legal caption (Fable-lock ruling: layout order is
            bit-identical territory, not a carve-out). The decorative orb that
            used to open this stack is gone — Screen's shared top inset
            (insets.top + space.xxl, identical to Settings' title offset)
            now gives the EARLY ACCESS chip its own breathing room. */}
        <FadeIn duration={360} style={styles.headerBlock}>
          <FilledChip label="Early access" />
          <AppText style={styles.title} variant="title">
            Free while we finish the instrument.
          </AppText>
          <AppText color="secondary" style={styles.subtitle} variant="body">
            Build a baseline, test the routine, and keep your readings private on this device.
          </AppText>
        </FadeIn>

        <FadeIn delay={40} style={styles.features}>
          {BENEFITS.map((benefit) => (
            <View key={benefit} style={styles.featureRow}>
              <CheckGlyph />
              <AppText color="secondary" style={styles.featureText} variant="body">
                {benefit}
              </AppText>
            </View>
          ))}
        </FadeIn>

        <FadeIn delay={80} style={styles.planWrap}>
          <FilledChip label="Free" style={styles.planBadge} />
          <View style={styles.plan}>
            <AppText color="primary" variant="bodyStrong">
              Vision Trainer
            </AppText>
            <AppText color="secondary" style={styles.planPrice} variant="caption">
              Early builds. No payment today.
            </AppText>
            <AppText color="muted" style={styles.planBilled} variant="caption">
              Built for practice, not promises. Readings only track this routine.
            </AppText>
          </View>
        </FadeIn>

        <FadeIn delay={140} style={styles.actions}>
          <PrimaryButton label="Start training" onPress={startTraining} />
          <SecondaryButton label="Maybe later" onPress={maybeLater} />
          <AppText color="muted" style={styles.legalCaption} variant="caption">
            Free while in Early Access. No subscription is active.
          </AppText>
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // CTA law (VALIDATION.md #1) + Today's local-margin technique: Screen already
  // pads space.lg (24pt); add the remaining space.xl − space.lg to reach the
  // spec's 32pt total edge-to-button margin (handoff: this block used to sit
  // flush with the Screen's 24pt).
  actions: {
    // primary→secondary gap is law #2 (space.md), binding — not adjustable
    // for layout-fit purposes.
    gap: space.md,
    marginHorizontal: space.xl - space.lg,
    // spec row 37: plan-card bottom → CTA top ≈25.3pt → space.lg(24) Δ+1.3.
    // With the reference stack order restored (card above the CTA) this row is
    // now directionally 1:1, no longer an adapted reversal.
    marginTop: space.lg,
  },
  // flex-start (not center): center would anchor the glyph to the whole
  // wrapped-text block's height on a 2-line row. Anchoring to the first line
  // is done by CheckGlyph's own marginTop (see checkGlyph below).
  featureRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    // spec row 5: checkmark→text gap measured 10.7pt; nearest token space.md(12) Δ+1.3.
    gap: space.md,
  },
  featureText: {
    flex: 1,
  },
  // spec row 4: 32.1pt avg top-to-top row pitch. Row content is a single
  // type.body line (24pt line-height); an 8pt (space.sm) gap between rows
  // reproduces the measured pitch without a dedicated token.
  features: {
    gap: space.xs,
    // Spec row 31: checkmark rows share the 32pt left content margin
    // (Screen's 24 + this 8), same technique as headerBlock/actions.
    marginHorizontal: space.xl - space.lg,
    // spec row 35: headline-bottom → first checkmark row ≈61.3pt in the
    // reference's sparser layout (space.xxl+space.md≈60). Our extra subtitle
    // line, secondary button and legal caption (none exist in the reference)
    // already carry the visual separation, and the reordered stack has to fit
    // one 844pt viewport — compressed to space.base(16); the headline→features
    // relationship is preserved, just not at the reference's absolute pt value.
    marginTop: space.base,
  },
  filledChip: {
    alignItems: 'center',
    backgroundColor: accent.core,
    borderRadius: radius.pill,
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  filledChipText: {
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
  },
  // Body text is 15pt/24pt line-height (SF Pro cap-height ≈15*0.71≈10.7pt,
  // near-identical to this glyph's own 10pt bbox). Centering the glyph on the
  // full 24pt first-line box lands almost exactly on the cap-height center
  // (the descender-side leading below the cap outweighs the ascender-side
  // leading above it by roughly the same margin this token adds) —
  // calibrated against a native capture of the wrapped second row.
  checkGlyph: {
    marginTop: 7,
  },
  // Spec row 31: left content margin 32pt for the badge/headline/caption column.
  // Screen pads space.lg(24); this block adds the remaining 8pt — same local-
  // margin technique as `actions`. LEFT-aligned per the reference (Fable lock
  // defect 2: Mimo's headline + caption are left-aligned, only the orb visual
  // keeps our centered treatment).
  headerBlock: {
    alignItems: 'flex-start',
    marginHorizontal: space.xl - space.lg,
  },
  // spec row 38: CTA-bottom → legal-caption-top ≈17pt. The `actions` gap
  // (space.md=12, shared with the primary→secondary law #2 rhythm) covers part
  // of it; this literal remainder tops it up to the measured 17pt.
  // Sentence-case regular caption grammar (Mimo's quiet captions), not
  // tracked caps: caps belong on the FREE badge / EARLY ACCESS chip only.
  legalCaption: {
    marginTop: 5,
    textAlign: 'center',
  },
  // Law 11: single full-width card, flat fill (spec row 13 — card fill is
  // IDENTICAL to the page bg, zero elevation: no glass/blur, per spec row 22),
  // radius.md, 1pt selected-state border in accent.core (the only state this
  // single card ships with).
  plan: {
    borderColor: accent.core,
    borderRadius: radius.md,
    borderWidth: hairline.px1,
    // spec row 40 measured 21pt; compressed to 16 (still clears the
    // overlapping badge chip) so the card's three rows fit on-screen.
    paddingBottom: space.md,
    paddingHorizontal: space.md,
    paddingTop: 16,
  },
  // spec row 2 bbox, positioned per the reference's badge anatomy: straddling
  // the card's top border, inset from the left edge — not inline beside a title.
  planBadge: {
    left: space.md,
    position: 'absolute',
    top: -10,
    zIndex: 1,
  },
  // spec row 42 measured 26.3pt; compressed to 16 to keep the card on-screen
  // alongside our extra pre-card blocks (VALIDATION's addendum does not carry
  // a `cardPriceGap` token, so this stays a literal, commented value).
  // Sentence-case regular caption grammar (Mimo's quiet captions), not
  // tracked caps: caps belong on the FREE badge / EARLY ACCESS chip only.
  planBilled: {
    marginTop: 16,
  },
  // spec row 41: title → price gap ≈6.3pt (space.sm=8 Δ−1.7, kept literal).
  planPrice: {
    marginTop: 6,
  },
  planWrap: {
    // spec row 36: last checkmark row → next block ≈36.7pt in the reference
    // (where the next block is the "Plus full access…" caption we don't carry).
    // Compressed to space.lg(24) for viewport fit; must stay ≥ the badge chip's
    // 10pt overhang so the absolutely-positioned FREE chip never clips into
    // the features block above.
    marginTop: space.lg,
    position: 'relative',
  },
  screen: {
    flex: 1,
    paddingBottom: space.xl,
  },
  subtitle: {
    lineHeight: 24,
    marginTop: space.sm,
  },
  title: {
    // spec row 34: badge-bottom → headline-top ≈22.7pt; compressed to
    // space.base(16) — our stack carries a subtitle + secondary button the
    // reference doesn't have, and the reordered full stack must still fit the
    // 844pt viewport (compression documented per the Fable-lock space-math ask).
    marginTop: space.base,
  },
});
