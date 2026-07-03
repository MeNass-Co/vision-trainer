import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { ContributorRows } from '@/components/progress/ContributorRows';
import { CountUpNumber } from '@/components/progress/CountUpNumber';
import { CsfGraph } from '@/components/progress/CsfGraph';
import { LayersIcon, MetricRow, ShieldCheckIcon, TargetIcon, verdictFromRatio } from '@/components/progress/MetricRow';
import { ProgressEmptySky } from '@/components/progress/ProgressEmptySky';
import { Sparkline } from '@/components/progress/Sparkline';
import { VerdictBand } from '@/components/progress/VerdictBand';
import { AppText, Bloom, Card, ContextChip, FadeIn, Screen, Shimmer } from '@/components/ui';
import { useProgressData } from '@/presenters';
import { haptics } from '@/theme/haptics';
import { data as tokenData, motion, radius, space, surface } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const SPARKLINE_HEIGHT = 112;
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
  const isStaticMotion = reduceMotion || Platform.OS === 'web';
  const strongest = strongestContributor(data);

  return (
    <Screen
      scroll={!isEmpty}
      background={<AmbientGradient constellation reduceMotion={reduceMotion} />}
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
              <Bloom color={tokenData.heroGlow} opacity={0.7} rx="62%" ry="48%" />
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
              <AppText color="secondary" variant="caption">
                Vision profile
              </AppText>
              <AppText color="primary" variant="body">
                {visionProfileSummary(data)}
              </AppText>
            </Card>
          </FadeIn>
          {/* metric-rows spec: discrete flat cards (row 15, no blur/glass) flush
              to the screen margin (row 1) — pulled out of the "Vision profile"
              glass Card above so these three rows aren't double-materialed
              inside another card; the narrative header/summary stays in the
              Card where it already reads naturally. */}
          <View style={styles.metricRowsSection}>
            <MetricRow
              baseline={`${data.measurementConfidence.baselineStep}/${data.measurementConfidence.baselineTarget} sessions`}
              delay={100}
              icon={<ShieldCheckIcon />}
              isStatic={isStaticMotion}
              label="Reading confidence"
              value={confidenceValueLabel(data)}
            />
            <MetricRow
              decimals={0}
              delay={100 + motion.timing.staggerMs}
              icon={<LayersIcon />}
              isStatic={isStaticMotion}
              label="Bands measured"
              value={data.csf.length}
            />
            <MetricRow
              baseline={strongest ? strongest.sensitivity.toFixed(1) : undefined}
              delay={100 + motion.timing.staggerMs * 2}
              delta={
                strongest
                  ? {
                      direction: strongest.sensitivity >= strongest.norm ? 'up' : 'down',
                      verdict: verdictFromRatio(strongest.sensitivity, strongest.norm),
                    }
                  : undefined
              }
              icon={<TargetIcon />}
              isStatic={isStaticMotion}
              label="Strongest band"
              value={strongest ? strongest.label : 'Captured'}
            />
          </View>
          <FadeIn delay={120}>
            <Card style={styles.card}>
              <AppText color="secondary" variant="caption">
                Last 7 days
              </AppText>
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
            </Card>
          </FadeIn>
          <FadeIn delay={180}>
            <Card style={styles.card}>
              <View style={styles.cardHeading}>
                <AppText color="secondary" variant="caption">
                  Contrast sensitivity estimate
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
          <FadeIn delay={240} style={styles.metricRowsSection}>
            {/* metric-rows spec: discrete flat cards (row 15, no blur/glass)
                flush to the screen margin (row 1) — this section deliberately
                is NOT wrapped in the glass `Card` the other sections use, so
                the rows below aren't double-materialed inside another card. */}
            <AppText color="secondary" variant="caption">
              By spatial frequency
            </AppText>
            <ContributorRows rows={data.contributors} />
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

function strongestContributor(data: ProgressViewData): ProgressViewData['contributors'][number] | null {
  if (data.contributors.length === 0) return null;

  return data.contributors.reduce(
    (best, candidate) => (candidate.sensitivity > best.sensitivity ? candidate : best),
    data.contributors[0]
  );
}

// metric-rows row 12 wants a short, numeral-ish value; the full confidence
// sentence (`measurementConfidence.label`) lives as the muted baseline instead.
function confidenceValueLabel(data: ProgressViewData): string {
  if (data.measurementConfidence.tier === 'reliable') return 'Reliable';
  if (data.measurementConfidence.tier === 'needs-retest') return 'Retest';
  return 'Building';
}

function visionProfileSummary(data: ProgressViewData): string {
  if (data.contributors.length === 0) {
    return 'Baseline captured. Future sessions will turn this into a trend.';
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
    return `Baseline captured at ${strongest.bandLabel.toLowerCase()} (${strongest.label}). Future sessions will show whether this band is improving.`;
  }

  return `Baseline captured across ${data.csf.length} bands. Your strongest read today is ${strongest.bandLabel.toLowerCase()}; ${weakest.bandLabel.toLowerCase()} is the band to watch next.`;
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
  },
  cardHeading: {
    gap: space.xs,
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
  metricRowsSection: {
    gap: space.md,
  },
  screen: {
    gap: space.md,
    paddingBottom: space.lg,
  },
  screenLabelPlate: {
    alignSelf: 'flex-start',
  },
});
