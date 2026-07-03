import { useEffect, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { FadeIn } from '@/components/ui';
import { easings } from '@/theme/motion';
import { fontFamily, motion, radius, space, surface, text, type as typo, verdict } from '@/theme/tokens';

// metric-rows — WHOOP sleep-statistics rows (design/references/metric-rows/spec.md).
// Shared discrete-card primitive: leading icon + caps label, big value right with
// a semantically-colored delta arrow (VALIDATION.md law 9), muted baseline beneath.
// Used by ContributorRows ("by spatial frequency") and the "Vision profile" card's
// three insight rows in progress.tsx.

export type MetricDeltaVerdict = 'improving' | 'regressing' | 'holding';

export type MetricRowProps = {
  icon: ReactNode;
  label: string;
  /** number → animated count-up (row 30); string → static (e.g. "1.5 cpd", "Reliable"). */
  value: number | string;
  /** Decimal places for a numeric `value` (e.g. 0 for a plain count). Default 1. */
  decimals?: number;
  /** Omit entirely when no genuine comparison exists — never fabricate a direction. */
  delta?: { direction: 'up' | 'down'; verdict: MetricDeltaVerdict };
  /** Omit when there is no real secondary datapoint to show. */
  baseline?: string;
  delay?: number;
  isStatic?: boolean;
};

// Rows 3/6/7/18 — VALIDATION.md's token addendum voids `rowHeight.*` /
// `avatarSize.*` as tokens ("inline in spec, no token needed"), so these are
// local literals, not global tokens.
export const METRIC_ICON_SIZE = 24;
const ROW_HEIGHT = 60;
const DELTA_ARROW = { width: 8, height: 5 };
// Row 18: `proposed:metricBaseline` — de-tracked micro sibling, never finalized
// as a token name in the addendum.
const metricBaselineType = {
  fontFamily: fontFamily.medium,
  fontSize: 11,
  lineHeight: 14,
  letterSpacing: 0,
} as const;

const VERDICT_COLOR: Record<MetricDeltaVerdict, string> = {
  improving: verdict.improving,
  regressing: verdict.regressing,
  holding: verdict.holding,
};

// Law 9's shared threshold: any genuine value-vs-reference comparison (a
// population norm, a prior baseline) maps to the same semantic bands. Single
// source of truth so every metric row's delta means the same thing.
export function verdictFromRatio(value: number, reference: number): MetricDeltaVerdict {
  const ratio = value / reference;

  if (ratio >= 1.15) return 'improving';
  if (ratio <= 0.9) return 'regressing';
  return 'holding';
}

// Rows 7/13/27/28 — solid filled triangle, 8x5pt, colored by verdict direction
// (law 9: semantic delta, not the reference's single neutral orange).
function DeltaArrow({ direction, tone }: { direction: 'up' | 'down'; tone: MetricDeltaVerdict }) {
  const d =
    direction === 'up'
      ? `M${DELTA_ARROW.width / 2} 0 L${DELTA_ARROW.width} ${DELTA_ARROW.height} L0 ${DELTA_ARROW.height} Z`
      : `M0 0 L${DELTA_ARROW.width} 0 L${DELTA_ARROW.width / 2} ${DELTA_ARROW.height} Z`;

  return (
    <Svg height={DELTA_ARROW.height} width={DELTA_ARROW.width}>
      <Path d={d} fill={VERDICT_COLOR[tone]} />
    </Svg>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput) as unknown as ComponentType<
  ComponentProps<typeof TextInput> & { animatedProps: Partial<{ text: string }> }
>;

// Row 30 (`ORCHESTRATOR-SETS`): count-up on numeric values. Mirrors
// `CountUpNumber`'s TextInput trick locally (right-aligned, configurable
// decimals, `type.metricValue` sizing) instead of reusing that shared
// component, which is center-aligned/fixed-2-decimal and out of this
// element's blast radius.
function AnimatedNumericValue({
  isStatic,
  value,
  decimals,
}: {
  isStatic: boolean;
  value: number;
  decimals: number;
}) {
  const shared = useSharedValue(isStatic ? value : 0);

  useEffect(() => {
    if (isStatic) {
      shared.value = value;
      return;
    }

    shared.value = 0;
    shared.value = withTiming(value, { duration: motion.timing.countUpProgressMs, easing: easings.out });

    return () => cancelAnimation(shared);
  }, [isStatic, shared, value]);

  const animatedProps = useAnimatedProps(() => ({
    text: shared.value.toFixed(decimals),
  }));

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      defaultValue={value.toFixed(decimals)}
      editable={false}
      style={styles.value}
      underlineColorAndroid="transparent"
    />
  );
}

export function MetricRow({
  icon,
  label,
  value,
  decimals = 1,
  delta,
  baseline,
  delay = 0,
  isStatic = false,
}: MetricRowProps) {
  return (
    <FadeIn delay={delay}>
      <View style={styles.row}>
        <View style={styles.leading}>
          <View style={styles.iconBox}>{icon}</View>
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </View>
        <View style={styles.trailing}>
          <View style={styles.valueRow}>
            {typeof value === 'number' ? (
              <AnimatedNumericValue decimals={decimals} isStatic={isStatic} value={value} />
            ) : (
              <Text style={styles.value}>{value}</Text>
            )}
            {delta ? <DeltaArrow direction={delta.direction} tone={delta.verdict} /> : null}
          </View>
          {baseline ? <Text style={styles.baseline}>{baseline}</Text> : null}
        </View>
      </View>
    </FadeIn>
  );
}

// Rows 6/10 — a small family of neutral `text.secondary`-stroke glyphs (24x24
// viewBox, 1.6 stroke), sharing this app's own rounded-line visual language
// (echoing the tab bar's icon set) rather than literal WHOOP stopwatch/moon
// icons, since none of our metrics are literally sleep timers.
export function WaveIcon() {
  return (
    <Svg
      fill="none"
      height={METRIC_ICON_SIZE}
      stroke={text.secondary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      width={METRIC_ICON_SIZE}>
      <Path d="M2 12 C4 6, 6 6, 8 12 C10 18, 12 18, 14 12 C16 6, 18 6, 20 12" />
    </Svg>
  );
}

export function ShieldCheckIcon() {
  return (
    <Svg
      fill="none"
      height={METRIC_ICON_SIZE}
      stroke={text.secondary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      width={METRIC_ICON_SIZE}>
      <Path d="M12 3 L19 6 V11 C19 16 16 19.5 12 21 C8 19.5 5 16 5 11 V6 Z" />
      <Path d="M8.6 12 L11 14.4 L15.6 9.6" />
    </Svg>
  );
}

export function LayersIcon() {
  return (
    <Svg
      fill="none"
      height={METRIC_ICON_SIZE}
      stroke={text.secondary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      width={METRIC_ICON_SIZE}>
      <Path d="M12 3 L21 8 L12 13 L3 8 Z" />
      <Path d="M3 12 L12 17 L21 12" />
      <Path d="M3 16 L12 21 L21 16" />
    </Svg>
  );
}

export function TargetIcon() {
  return (
    <Svg
      fill="none"
      height={METRIC_ICON_SIZE}
      stroke={text.secondary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      width={METRIC_ICON_SIZE}>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4} />
      <Circle cx={12} cy={12} fill={text.secondary} r={1.2} stroke="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  // Row 18 — plain RN Text (not AppText) so the exact spec type row applies
  // without extending AppText's shared Variant union (out of this element's
  // blast radius; same precedent as CustomTabBar's tab label).
  baseline: {
    color: text.secondary,
    fontFamily: metricBaselineType.fontFamily,
    fontSize: metricBaselineType.fontSize,
    letterSpacing: metricBaselineType.letterSpacing,
    lineHeight: metricBaselineType.lineHeight,
    // Row 24: `type.metricValue`'s own line-height leading (28pt box over a
    // 24pt glyph) already supplies the full measured 9.0pt glyph-to-glyph
    // gap on its own — any explicit marginTop here overshot in testing
    // (`space.xs` measured ~13pt, `space.sm` ~17pt, vs. a 9.0pt target).
    textAlign: 'right',
  },
  iconBox: {
    alignItems: 'center',
    height: METRIC_ICON_SIZE,
    justifyContent: 'center',
    width: METRIC_ICON_SIZE,
  },
  label: {
    color: text.primary,
    flexShrink: 1,
    fontFamily: typo.micro.fontFamily,
    fontSize: typo.micro.fontSize,
    letterSpacing: typo.micro.letterSpacing,
    lineHeight: typo.micro.lineHeight,
    textTransform: 'uppercase',
  },
  leading: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: space.sm,
  },
  row: {
    // `stretch` (not `center`) so `leading` and `trailing` each get the full
    // row height to position themselves within — `leading` still centers
    // itself via its own `alignItems: center` (row 26); `trailing` top-anchors
    // via its own paddingTop (row 23), matching the reference's asymmetric
    // top/bottom insets instead of centering the two-line block as a unit.
    alignItems: 'stretch',
    backgroundColor: surface.card,
    borderRadius: radius.md,
    flexDirection: 'row',
    height: ROW_HEIGHT,
    // Row 19: icon left inset — closest token to the 14.0pt measurement.
    paddingLeft: space.base,
    // Row 22: delta-arrow-to-edge inset — near-exact.
    paddingRight: space.md,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    // Row 23: value-block top inset (target 15.7pt). `space.base` (16pt)
    // measured too generous once the glyph's own line-height leading is
    // added on top; `space.md` measured closer.
    paddingTop: space.md,
  },
  value: {
    color: text.primary,
    fontFamily: typo.metricValue.fontFamily,
    fontSize: typo.metricValue.fontSize,
    fontVariant: [...typo.metricValue.fontVariant],
    letterSpacing: typo.metricValue.letterSpacing,
    lineHeight: typo.metricValue.lineHeight,
    // The animated TextInput's native `text` prop is updated imperatively by
    // Reanimated (bypassing RN's normal auto-size-to-content reflow), so a
    // digit-count change mid count-up (e.g. crossing "9.9" → "10.0") can clip
    // the last glyph if the box isn't pre-sized. A generous fixed minWidth
    // (right-aligned) sidesteps the auto-sizing quirk entirely.
    minWidth: 64,
    padding: 0,
    textAlign: 'right',
  },
  valueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    // Row 21: value-to-arrow gap — near-exact.
    gap: space.sm,
  },
});

export { ROW_HEIGHT as METRIC_ROW_HEIGHT };
