import { type Href, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { AppText, FadeIn, GaborMark, GlassCard, PrimaryButton, Screen, SecondaryButton } from '@/components/ui';
import { t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { accent, fontWeight, hairline, material, radius, space } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

function useBenefits(): readonly { text: string; icon: SFSymbol }[] {
  return [
    { text: t('paywall.benefits.adaptive'), icon: 'waveform.path.ecg' },
    { text: t('paywall.benefits.progress'), icon: 'chart.line.uptrend.xyaxis' },
    { text: t('paywall.benefits.privacy'), icon: 'lock' },
  ] as const;
}

const CHECK_GLYPH_SIZE = 14;
const GABOR_HERO_SIZE = 72;

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

/**
 * One-accent-voice fix: EARLY ACCESS was a second `FilledChip` (accent fill)
 * competing with the FREE badge, the plan card's accent border, and the
 * accent CTA below — three accent moments becomes four and nothing reads as
 * the one live element. This borrows ContextChip's quiet editorial
 * language (transparent, `text.secondary`, caps micro) but keeps a real chip
 * box — 1px `material.hairlineOutline` border, `radius.xs` — since this sits
 * as a standalone eyebrow, not inline beside a caption the way ContextChip's
 * boxless text does elsewhere.
 */
function OutlineChip({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.outlineChip, style]}>
      <AppText color="secondary" style={styles.outlineChipText} uppercase variant="micro">
        {label}
      </AppText>
    </View>
  );
}

// Mobbin-conquest fix #4 (SuperGrok/Beside pattern): one SF Symbol per
// benefit instead of three identical checks — same slot/size/tint the check
// glyph had (accent.core, anchored to the FIRST line of a possibly-wrapped
// feature row via the same marginTop nudge), just a distinct icon per row.
function BenefitGlyph({ icon }: { icon: SFSymbol }) {
  return (
    <SymbolView
      name={icon}
      resizeMode="scaleAspectFit"
      size={CHECK_GLYPH_SIZE}
      style={styles.checkGlyph}
      tintColor={accent.core}
      type="monochrome"
      weight="medium"
    />
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const reduceMotion = useEffectiveReducedMotion();
  const benefits = useBenefits();

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
        {/* Mobbin-conquest fix #3 (featured-paywall pattern — Bevel/Outsiders/
            Cosmos all lead with a focal object): the celestial GaborMark
            reinstated as the "app object" moment — centered, sitting ABOVE
            the chip with its own breathing room, so it reads anchored to the
            whole header block rather than orphaned above a left-aligned
            column (the earlier Fable-lock defect). Chip + headline stay
            LEFT-aligned below it, per the reference's column. */}
        <FadeIn duration={360} style={styles.gaborRow}>
          <GaborMark quiet size={GABOR_HERO_SIZE} />
        </FadeIn>

        {/* Everything below follows the reference's LEFT-aligned column and its
            stack order: headline block → checkmark features → plan card → CTA
            pair → legal caption (Fable-lock ruling: layout order is
            bit-identical territory, not a carve-out). */}
        <FadeIn delay={20} duration={360} style={styles.headerBlock}>
          <OutlineChip label={t('paywall.earlyAccessChip')} />
          <AppText style={styles.title} variant="title">
            {t('paywall.title')}
          </AppText>
          <AppText color="secondary" style={styles.subtitle} variant="body">
            {t('paywall.subtitle')}
          </AppText>
        </FadeIn>

        <FadeIn delay={40} style={styles.features}>
          {benefits.map((benefit) => (
            <View key={benefit.text} style={styles.featureRow}>
              <BenefitGlyph icon={benefit.icon} />
              <AppText color="secondary" style={styles.featureText} variant="body">
                {benefit.text}
              </AppText>
            </View>
          ))}
        </FadeIn>

        <FadeIn delay={80} style={styles.planWrap}>
          <FilledChip label={t('paywall.freeBadge')} style={styles.planBadge} />
          {/* ONE-material pass: fill switches to the same Tier 3 'content'
              glass every other content card uses; the accent-border selection
              treatment (law 11) is preserved on top. */}
          <GlassCard style={styles.plan} tier="content">
            <AppText color="primary" variant="bodyStrong">
              {t('paywall.planName')}
            </AppText>
            <AppText color="secondary" style={styles.planPrice} variant="caption">
              {t('paywall.planPrice')}
            </AppText>
            <AppText color="muted" style={styles.planBilled} variant="caption">
              {t('paywall.planBilled')}
            </AppText>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={140} style={styles.actions}>
          <PrimaryButton label={t('paywall.ctaStart')} onPress={startTraining} />
          <SecondaryButton label={t('paywall.ctaMaybeLater')} onPress={maybeLater} />
          <AppText color="muted" style={styles.legalCaption} variant="caption">
            {t('paywall.legalCaption')}
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
  // Mobbin-conquest fix #3: centered hero mark, space.lg of breathing room
  // before the (left-aligned) chip/headline column below it.
  gaborRow: {
    alignItems: 'center',
    marginBottom: space.lg,
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
  // One-accent-voice fix: transparent fill, hairline outline, quiet ink —
  // never competes with the FREE badge's accent fill or the CTA below.
  outlineChip: {
    alignItems: 'center',
    borderColor: material.hairlineOutline,
    borderRadius: radius.xs,
    borderWidth: hairline.px1,
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  outlineChipText: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
  },
  // Body text is 15pt/24pt line-height. Centering the (now 14x14 SF Symbol)
  // glyph on the full 24pt first-line box: (24-14)/2 = 5 — same anchoring
  // technique the plain-stroke check glyph used, recalculated for the new
  // square bbox.
  checkGlyph: {
    height: CHECK_GLYPH_SIZE,
    marginTop: 5,
    width: CHECK_GLYPH_SIZE,
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
    // ONE-material pass: fill is now GlassCard's Tier 3 'content' glass
    // (was material.fillCard) — accent border/badge untouched (law 11).
    borderColor: accent.core,
    borderRadius: radius.lg,
    borderWidth: hairline.px1,
    // spec row 40 measured 21pt; compressed to 16 (still clears the
    // overlapping badge chip) so the card's three rows fit on-screen.
    paddingBottom: space.md,
    paddingHorizontal: space.md,
    paddingTop: 16,
  },
  // spec row 2 bbox, positioned per the reference's badge anatomy: straddling
  // the card's top border, inset from the left edge — not inline beside a title.
  // left inset bumped from space.md(12) to space.base(16) — with the card's
  // corner now at radius.lg(14) (was radius.md/10), a 12pt inset sat inside
  // the rounded corner's cut and the badge's bottom-left tip would clip.
  planBadge: {
    left: space.base,
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
