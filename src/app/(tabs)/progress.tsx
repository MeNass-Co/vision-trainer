import { useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { CountUpNumber } from '@/components/progress/CountUpNumber';
import { CsfGraph } from '@/components/progress/CsfGraph';
import { ProgressEmptySky } from '@/components/progress/ProgressEmptySky';
import { ChevronIcon, Sparkline, TrendIcon } from '@/components/progress/Sparkline';
import { VerdictBand } from '@/components/progress/VerdictBand';
import { AppText, Bloom, ContextChip, Card, FadeIn, GlassCard, Screen, Shimmer } from '@/components/ui';
import { useProgressData } from '@/presenters';
import { haptics } from '@/theme/haptics';
import { accent, data as tokenData, fontWeight, motion, radius, space, surface } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const SPARKLINE_HEIGHT = 130;
const CSF_GRAPH_HEIGHT = 220;

export default function ProgressScreen() {
  const reduceMotion = useEffectiveReducedMotion();
  const { data, isLoading } = useProgressData();
  const isEmpty = data.csf.length === 0;
  // One measured width per card: the two cards can legitimately differ, and a
  // shared state would let each onLayout overwrite the other's measurement.
  const [sparklineWidth, setSparklineWidth] = useState(0);
  const [csfGraphWidth, setCsfGraphWidth] = useState(0);
  const handleSparklineLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setSparklineWidth((previous) => (previous === next ? previous : next));
  }, []);
  const handleCsfGraphLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setCsfGraphWidth((previous) => (previous === next ? previous : next));
  }, []);
  // Sanctioned capture tooling (same doctrine as the seeded Progress DB): a
  // __DEV__-only `?scrollTo=` deeplink param lets the reference-match
  // screenshot rig (scripts/shoot-sim.sh) bring below-the-fold cards into
  // frame without a tap/scroll harness. No production path reads this param.
  const scrollRef = useRef<ScrollView>(null);
  const { scrollTo } = useLocalSearchParams<{ scrollTo?: string }>();

  useEffect(() => {
    if (!__DEV__ || scrollTo === undefined) return;
    const y = Number(scrollTo);
    if (!Number.isFinite(y)) return;
    scrollRef.current?.scrollTo({ y, animated: false });
  }, [scrollTo]);

  return (
    <Screen
      background={<AmbientGradient constellation reduceMotion={reduceMotion} />}
      ref={scrollRef}
      scroll={!isEmpty}
      tabBarClearance={!isEmpty}
      style={styles.screen}>
      {isLoading ? (
        <LoadingProgress />
      ) : isEmpty ? (
        <ProgressEmptySky reduceMotion={reduceMotion} />
      ) : (
        <>
          <FadeIn>
            <ContextChip label="Progress" style={styles.screenLabelPlate} />
          </FadeIn>
          <FadeIn delay={60} style={styles.hero}>
            <AppText color="muted" uppercase variant="micro">
              Contrast sensitivity estimate
            </AppText>
            <View
              accessibilityLabel={data.headlineAcuity.toFixed(2)}
              style={styles.heroNumber}>
              {/* Beauty-audit fix: a genuine centered "body of light" halo directly
                  behind the hero digits (3-stop glow temperature: near-white core →
                  heroGlowStrong mid-tone → transparent edge), sized to fully resolve
                  inside heroNumber's box so it never clips the SVG canvas edge. The
                  hot core sits mostly occluded behind the opaque glyphs themselves —
                  only its feathered spill reads, which is what makes the number look
                  lit from within instead of by the app-wide ambient sun bleeding in
                  from the top-left (see psycho-fixes-progress.png). */}
              <Bloom color={tokenData.heroGlowStrong} core={accent.hot} opacity={0.65} rx="65%" ry="90%" />
              <CountUpNumber
                durationMs={motion.timing.countUpProgressMs}
                from={data.previousAcuity}
                onSettle={haptics.numberSettle}
                to={data.headlineAcuity}
              />
            </View>
            <VerdictBand
              captionTone={data.measurementConfidence.tier === 'needs-retest' ? 'accent' : 'default'}
              caption={data.measurementConfidence.label}
              delta={data.delta}
              verdict={data.verdict}
            />
          </FadeIn>
          <FadeIn delay={90}>
            <Card style={styles.card}>
              {/* One section-header grammar app-wide: matches Settings'
                  `Section.tsx` title exactly (sentence case, 15/20 semibold,
                  text.secondary) — not the 13pt `caption` variant. */}
              <AppText color="secondary" style={styles.sectionHeader}>
                Vision profile
              </AppText>
              <View style={styles.insightRow}>
                <SymbolView
                  name="sparkles"
                  resizeMode="scaleAspectFit"
                  size={13}
                  style={styles.insightGlyph}
                  tintColor={accent.default}
                  type="monochrome"
                  weight="medium"
                />
                <AppText color="primary" style={styles.insightText} variant="body">
                  {visionProfileSummary(data)}
                </AppText>
              </View>
            </Card>
          </FadeIn>
          {/* ONE-material pass (native-revamp Phase 4 final wave): the trend
              card now shares the same Tier 3 'content' glass as Vision
              profile / By spatial frequency — the old flat opaque
              `surface.card` fill (no contour against the other cards) is
              gone. Title row = icon + caps `type.micro` label + chevron
              (rows 7-10), the current-day highlight column (row 24) stays
              deliberately omitted. */}
          <FadeIn delay={120}>
            <GlassCard radius={radius.lg} style={styles.trendCard} tier="content">
              <View style={styles.trendCardTitleRow}>
                <View style={styles.trendCardTitleLeading}>
                  <TrendIcon />
                  <AppText color="primary" style={styles.trendCardTitleText} uppercase variant="micro">
                    Last 7 days
                  </AppText>
                </View>
                <ChevronIcon />
              </View>
              {data.sparkline.length === 0 ? (
                <View style={styles.emptyTrend}>
                  <AppText color="secondary" variant="caption">
                    Awaiting first reading
                  </AppText>
                  <View style={styles.emptyTrendBaseline} />
                  <AppText color="muted" uppercase variant="micro">
                    Complete a session to chart your trend
                  </AppText>
                </View>
              ) : (
                <View onLayout={handleSparklineLayout} style={styles.chartMeasure}>
                  {sparklineWidth > 0 ? (
                    <FadeIn duration={motion.timing.rangeDrawMs}>
                      <Sparkline height={SPARKLINE_HEIGHT} points={data.sparkline} width={sparklineWidth} />
                    </FadeIn>
                  ) : null}
                </View>
              )}
            </GlassCard>
          </FadeIn>
          <FadeIn delay={180}>
            <Card style={styles.card}>
              <View style={styles.cardHeading}>
                <AppText color="secondary" variant="caption">
                  By spatial frequency
                </AppText>
                <AppText color="muted" variant="micro">
                  Drag to inspect
                </AppText>
              </View>
              <View onLayout={handleCsfGraphLayout} style={styles.chartMeasure}>
                {csfGraphWidth > 0 ? (
                  <FadeIn duration={motion.timing.rangeDrawMs}>
                    <CsfGraph
                      height={CSF_GRAPH_HEIGHT}
                      points={data.csf}
                      references={data.csfReferences}
                      width={csfGraphWidth}
                    />
                  </FadeIn>
                ) : null}
              </View>
            </Card>
          </FadeIn>
        </>
      )}
    </Screen>
  );
}

function LoadingProgress() {
  return (
    <>
      <FadeIn>
        <Shimmer height={14} radius={radius.pill} width={64} />
      </FadeIn>
      <FadeIn delay={60} style={styles.loadingHero}>
        <Shimmer height={14} radius={radius.pill} width={172} />
        <Shimmer height={88} radius={radius.md} width={188} />
        <Shimmer height={28} radius={radius.pill} width={142} />
      </FadeIn>
      <FadeIn delay={120}>
        <Shimmer height={178} radius={radius.lg} width="100%" />
      </FadeIn>
      <FadeIn delay={180}>
        <Shimmer height={286} radius={radius.lg} width="100%" />
      </FadeIn>
      <FadeIn delay={240}>
        <Shimmer height={248} radius={radius.lg} width="100%" />
      </FadeIn>
    </>
  );
}

type ProgressViewData = NonNullable<ReturnType<typeof useProgressData>['data']>;

// metric-rows row 12 wants a short, numeral-ish value; the full confidence
// sentence (`measurementConfidence.label`) lives as the muted baseline instead.
// Taste-iteration-3 (vision-profile noise kill): the metric rows below this
// card already carry "Reading confidence" / "Bands measured" / "Strongest
// band" — this line is not allowed to restate them. One sentence of genuine
// insight, derived purely from the same presenter fields the rows use.
function visionProfileSummary(data: ProgressViewData): string {
  if (data.contributors.length === 0) {
    return 'Baseline captured.';
  }

  const strongest = data.contributors.reduce(
    (best, candidate) => (candidate.sensitivity > best.sensitivity ? candidate : best),
    data.contributors[0]
  );
  const weakest = data.contributors.reduce(
    (lowest, candidate) => (candidate.sensitivity < lowest.sensitivity ? candidate : lowest),
    data.contributors[0]
  );

  if (strongest.label === weakest.label) {
    return `Strongest at ${strongest.bandLabel.toLowerCase()} (${strongest.label}).`;
  }

  return `Strongest at ${strongest.bandLabel.toLowerCase()} · watch ${weakest.label}.`;
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
  },
  cardHeading: {
    gap: space.xs,
  },
  // Mobbin-conquest fix #6 (WHOOP pattern): a leading sparkles glyph on the
  // insight line reads "the app is telling you something" without the
  // hairline-border route (kept ONE signal, not both — see dispatch note).
  insightGlyph: {
    height: 13,
    marginTop: 5,
    width: 13,
  },
  insightRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: space.xs,
  },
  insightText: {
    flex: 1,
  },
  chartMeasure: {
    width: '100%',
  },
  emptyTrend: {
    alignItems: 'center',
    gap: space.xs,
    justifyContent: 'center',
    minHeight: SPARKLINE_HEIGHT + 20,
  },
  emptyTrendBaseline: {
    backgroundColor: surface.hairline,
    height: StyleSheet.hairlineWidth,
    width: '70%',
  },
  // ONE-material pass: fill/radius/hairline now come from GlassCard (Tier 3
  // 'content') — this style only carries the card's own internal padding.
  trendCard: {
    paddingBottom: space.base,
    paddingHorizontal: space.base,
    paddingTop: space.cardTop,
  },
  // Row 11: plot-rect top inset is title-row-height-driven, not flat padding —
  // this is that "gap" as a literal (no clean token sibling, same precedent as
  // `PLOT_TO_DAY_GAP` inside Sparkline.tsx).
  trendCardTitleLeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.base,
  },
  trendCardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  trendCardTitleText: {
    flexShrink: 1,
  },
  // screen-header law 6 (gap ramp transfer): chip→title ≈20pt total (spec row 29).
  // `styles.screen.gap` (space.md=12) already separates this block from the chip
  // above at the Screen level, so paddingTop only adds the remainder (8pt) — not
  // the bottom gap into the "Vision profile" card, which stays out of this
  // element's blast radius. Internal gap tightened title→caption ≈10pt (row 30,
  // was space.sm=8).
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: space.xl,
    paddingTop: 4,
  },
  heroNumber: {
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
    width: 260,
  },
  loadingHero: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xxl,
  },
  screen: {
    gap: space.md,
    paddingBottom: space.lg,
  },
  screenLabelPlate: {
    alignSelf: 'flex-start',
  },
  // Matches Settings' `Section.tsx` title style exactly (Mobbin-conquest fix
  // #2: dropped to 15pt semibold so the two-tier hierarchy reads against the
  // hero number above it) — one section-header grammar app-wide.
  sectionHeader: {
    fontWeight: fontWeight.semibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
});
