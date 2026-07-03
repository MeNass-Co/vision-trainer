import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { TrajectoryPointLight } from '@/components/progress/TrajectoryPointLight';
import {
  ACCENT_CORE,
  ACCENT_SOFT,
  data,
  fontWeight,
  motion,
  space,
  surface,
  text,
  type as typo,
} from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

// progress-chart spec (design/references/progress-chart/spec.md) — WHOOP trend
// card anatomy (VALIDATION.md law 8). This renders the chart body only: the
// icon+label+chevron title row and the card shell live in progress.tsx's
// "Last 7 days" wiring. Stale note (glass-unification pass 2): that shell was
// a flat opaque `surface.card` fill pre-ONE-material-pass; it now runs through
// GlassCard (Tier 3 'content', see progress.tsx) like every other card — only
// the SVG chart canvas itself (this file) stays a plain drawing surface.

// Row 7 — title-row icon glyph, 18pt square (nearest standard scale to the
// reference's nonstandard 23.3×14.7pt "heart+arrow" glyph, which is carved out
// for our own content: a trend glyph, not a heart-rate one). Row 9/10 —
// chevron glyph, 16×16pt, sitting in a 24pt tap target inset to the card's own
// `space.base` side padding.
export const CHART_TITLE_ICON_SIZE = 18;
export const CHART_CHEVRON_TAP_SIZE = 24;
const CHEVRON_GLYPH_SIZE = 16;

// Taste-iteration-3 (SF Symbols everywhere): one icon language app-wide, same
// SymbolView primitive the tab bar already uses.
export function TrendIcon() {
  return (
    <SymbolView
      name="chart.line.uptrend.xyaxis"
      resizeMode="scaleAspectFit"
      size={CHART_TITLE_ICON_SIZE}
      style={styles.trendGlyph}
      tintColor={text.secondary}
      type="monochrome"
    />
  );
}

export function ChevronIcon() {
  return (
    <View style={styles.chevronTap}>
      <SymbolView
        name="chevron.right"
        resizeMode="scaleAspectFit"
        size={CHEVRON_GLYPH_SIZE}
        style={styles.chevronGlyph}
        tintColor={text.primary}
        type="monochrome"
        weight="medium"
      />
    </View>
  );
}

export type SparklinePoint = { day: string; date: number; value: number };

export type SparklineProps = {
  points: SparklinePoint[];
  width: number;
  /** Height of the plot area only (line + points + value labels). Day-of-week
   * labels render below this in their own reserved block (see DAY_LABEL_BLOCK_HEIGHT). */
  height: number;
};

type ChartPoint = SparklinePoint & {
  x: number;
  y: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Row 15/16/17 — plain ring marker: 10pt outer Ø, 2pt stroke, dark hole.
// Circle radius set to (outer - stroke)/2 so the STROKE's outward half-width
// lands exactly on the 10pt outer boundary (SVG strokes straddle the path).
const RING_OUTER_D = 10;
const RING_STROKE = 2;
const RING_OUTER_RADIUS = RING_OUTER_D / 2; // 5 — the marker's true visual edge
const RING_RADIUS = (RING_OUTER_D - RING_STROKE) / 2; // 4 — fill visible to r=3 (6pt hole)
// Row 18 — line weight, muted `accent.soft` (law 8's two-tier hue role).
const LINE_STROKE_WIDTH = 2.3;
// Row 13 — extra data-point inset beyond the plot-rect/gridline edge (which
// itself sits flush with this component's own edges — the card's own
// `space.base` padding already supplies rows 5/11's "16pt from card edge").
const POINT_INSET = space.base;
// Row 19 — value-label bottom → marker-top gap, measured from the ring's
// OUTER edge (its true visual boundary), not the fill radius.
const LABEL_GAP = space.xs;
// Owner override (nassim-fixes): day/value labels read big next to the WHOOP
// reference (design/references/progress-chart/target.png) — both dropped off
// `typo.caption` (13/18) as local literals rather than touching the shared
// caption token used elsewhere in the app.
const VALUE_LABEL_FONT_SIZE = 12;
const VALUE_LABEL_LINE_HEIGHT = 16;
const DAY_LABEL_FONT_SIZE = 11;
const DAY_LABEL_LINE_HEIGHT = 14;
const VALUE_LABEL_WIDTH = 44;
// Top/bottom insets sized so the value label above the highest point and the
// ring's own radius at the lowest point never clip inside the SVG canvas.
const CHART_TOP = RING_OUTER_RADIUS + LABEL_GAP + VALUE_LABEL_LINE_HEIGHT + 1; // 24
const CHART_BOTTOM = RING_OUTER_RADIUS + 4;
// Row 22/23 — day-label internals + row 23's plot-floor→day-row gap. `11` has
// no clean token sibling (between `space.sm`8/`space.md`12, spec's own call);
// same precedent as metric-rows' locally-literal `ROW_HEIGHT`.
const PLOT_TO_DAY_GAP = 11;
const DAY_LABEL_WIDTH = 44;
const DAY_LABEL_BLOCK_HEIGHT = DAY_LABEL_LINE_HEIGHT * 2 + space.xs;
const LABEL_FADE_MS = 220;

function createChartPoints(points: SparklinePoint[], width: number, height: number) {
  const values = points.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const drawableWidth = Math.max(width - POINT_INSET * 2, 0);
  const drawableHeight = Math.max(height - CHART_TOP - CHART_BOTTOM, 0);

  return points.map((point, index) => ({
    ...point,
    x:
      POINT_INSET +
      (points.length === 1 ? drawableWidth / 2 : (index / (points.length - 1)) * drawableWidth),
    y: CHART_TOP + ((maximum - point.value) / range) * drawableHeight,
  }));
}

function createPath(points: ChartPoint[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function getPathLength(points: ChartPoint[]) {
  return points.slice(1).reduce((length, point, index) => {
    const previous = points[index];

    return length + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
}

// Rows 19/30/40 — value label above each marker, `accent.core` bright role,
// bold `type.caption` size with tabular digits. Rows 20-22/36-37/41-42 — the
// two-line day label below the plot; the last (most recent) point is "today"
// and reads `text.primary` + bold per row 51, even with the highlight column
// (row 24) omitted per law 8.
function LabelFade({
  delayMs,
  isStatic,
  style,
  children,
}: {
  delayMs: number;
  isStatic: boolean;
  style?: object;
  children: React.ReactNode;
}) {
  const opacity = useSharedValue(isStatic ? 1 : 0);

  useEffect(() => {
    if (isStatic) {
      opacity.value = 1;
      return;
    }
    opacity.value = 0;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: LABEL_FADE_MS, easing: Easing.out(Easing.cubic) }));

    return () => cancelAnimation(opacity);
  }, [delayMs, isStatic, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export function Sparkline({ points, width, height }: SparklineProps) {
  const chartPoints = createChartPoints(points, width, height);
  const path = createPath(chartPoints);
  const pathLength = getPathLength(chartPoints);
  const reduceMotion = useEffectiveReducedMotion();
  const isStatic = reduceMotion || Platform.OS === 'web';
  const strokeDashoffset = useSharedValue(isStatic ? 0 : pathLength);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));
  const baselineY = height - CHART_BOTTOM;
  const firstPoint = chartPoints[0];
  const lastPoint = chartPoints.at(-1);
  const areaPath =
    path && firstPoint && lastPoint
      ? `${path} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`
      : '';
  // Motion row: line draw-on at `motion.timing.drawOnMs` (900), value/day
  // labels fade in staggered by `motion.timing.staggerMs` AFTER the draw
  // completes (VALIDATION.md motion rows).
  const drawOnMs = motion.timing.drawOnMs;

  useEffect(() => {
    if (isStatic) {
      strokeDashoffset.value = 0;
      return;
    }

    strokeDashoffset.value = pathLength;
    strokeDashoffset.value = withTiming(0, {
      duration: drawOnMs,
      easing: Easing.out(Easing.cubic),
    });

    return () => cancelAnimation(strokeDashoffset);
  }, [drawOnMs, isStatic, pathLength, strokeDashoffset]);

  const totalHeight = height + PLOT_TO_DAY_GAP + DAY_LABEL_BLOCK_HEIGHT;

  return (
    <View style={{ width, height: totalHeight }}>
      <View style={{ width, height }}>
        <Svg height={height} width={width}>
          {/* Row 27 — faint neutral gridlines (no y-axis labels; law 8 keeps
              this an axis-free trend card). */}
          {[0.25, 0.5, 0.75].map((offset) => {
            const y = CHART_TOP + (baselineY - CHART_TOP) * offset;

            return (
              <Line
                key={offset}
                opacity={0.7}
                stroke={surface.hairlineStrong}
                strokeWidth={1}
                x1={0}
                x2={width}
                y1={y}
                y2={y}
              />
            );
          })}
          <Defs>
            <LinearGradient gradientUnits="userSpaceOnUse" id="sparklineArea" x1={0} x2={0} y1={CHART_TOP} y2={baselineY}>
              <Stop offset="0" stopColor={ACCENT_SOFT} stopOpacity={0.16} />
              <Stop offset="1" stopColor={ACCENT_SOFT} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {/* Row 32 (optional, included for reference fidelity) — soft fade
              under the line, muted `accent.soft` hue, never as bright as the
              line/points. */}
          {areaPath ? <Path d={areaPath} fill="url(#sparklineArea)" stroke="none" /> : null}
          {path ? (
            isStatic ? (
              <Path
                d={path}
                fill="none"
                stroke={ACCENT_SOFT}
                strokeDashoffset={0}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={LINE_STROKE_WIDTH}
              />
            ) : (
              <AnimatedPath
                animatedProps={animatedProps}
                d={path}
                fill="none"
                stroke={ACCENT_SOFT}
                strokeDasharray={pathLength}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={LINE_STROKE_WIDTH}
              />
            )
          ) : null}
          {/* Rows 15-17 — plain ring marker on every point (incl. the latest;
              the TrajectoryPointLight glow layers on top of it, not instead
              of it, per target.md). */}
          {chartPoints.map((point, index) => (
            <Circle
              cx={point.x}
              cy={point.y}
              fill={data.canvas}
              key={`${point.day}-${point.date}-${index}`}
              r={RING_RADIUS}
              stroke={ACCENT_CORE}
              strokeWidth={RING_STROKE}
            />
          ))}
          {chartPoints.length > 0 ? (
            <TrajectoryPointLight
              coreR={3}
              isStatic={isStatic}
              pathLength={pathLength}
              points={chartPoints}
              progress={strokeDashoffset}
            />
          ) : null}
        </Svg>
        {chartPoints.map((point, index) => (
          <LabelFade
            delayMs={drawOnMs + index * motion.timing.staggerMs}
            isStatic={isStatic}
            key={`value-${point.day}-${point.date}-${index}`}
            style={[
              styles.valueLabel,
              {
                left: point.x - VALUE_LABEL_WIDTH / 2,
                top: point.y - RING_OUTER_RADIUS - LABEL_GAP - VALUE_LABEL_LINE_HEIGHT,
              },
            ]}>
            <Text style={styles.valueLabelText}>{point.value.toFixed(2)}</Text>
          </LabelFade>
        ))}
      </View>
      <View style={[styles.dayLabelRow, { marginTop: PLOT_TO_DAY_GAP, width }]}>
        {chartPoints.map((point, index) => {
          const isCurrent = index === chartPoints.length - 1;

          return (
            <LabelFade
              delayMs={drawOnMs + index * motion.timing.staggerMs}
              isStatic={isStatic}
              key={`day-${point.day}-${point.date}-${index}`}
              style={[styles.dayLabelColumn, { left: point.x - DAY_LABEL_WIDTH / 2 }]}>
              <Text style={[styles.dayLabelLine, isCurrent && styles.dayLabelCurrent]}>{point.day}</Text>
              <Text style={[styles.dayLabelLine, isCurrent && styles.dayLabelCurrent]}>{point.date}</Text>
            </LabelFade>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Width only (not height): a fixed 24pt-tall box would out-grow the 18pt
  // title icon and inflate the whole title row's cross-axis height (pushing
  // row 4's icon-top padding off-spec by the extra centering slack). The
  // width still buys the tap-target's horizontal presence/inset (row 10); the
  // glyph's own 16pt height sizes the row alongside the icon.
  chevronGlyph: {
    height: CHEVRON_GLYPH_SIZE,
    width: CHEVRON_GLYPH_SIZE,
  },
  chevronTap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: CHART_CHEVRON_TAP_SIZE,
  },
  dayLabelColumn: {
    alignItems: 'center',
    gap: space.xs,
    position: 'absolute',
    top: 0,
    width: DAY_LABEL_WIDTH,
  },
  dayLabelCurrent: {
    color: text.primary,
    fontWeight: fontWeight.bold,
  },
  dayLabelLine: {
    color: text.secondary,
    fontWeight: typo.caption.fontWeight,
    fontSize: DAY_LABEL_FONT_SIZE,
    letterSpacing: typo.caption.letterSpacing,
    lineHeight: DAY_LABEL_LINE_HEIGHT,
    textAlign: 'center',
  },
  dayLabelRow: {
    height: DAY_LABEL_BLOCK_HEIGHT,
    position: 'relative',
  },
  valueLabel: {
    alignItems: 'center',
    position: 'absolute',
    width: VALUE_LABEL_WIDTH,
  },
  valueLabelText: {
    color: ACCENT_CORE,
    fontWeight: fontWeight.bold,
    fontSize: VALUE_LABEL_FONT_SIZE,
    fontVariant: ['tabular-nums'],
    letterSpacing: typo.caption.letterSpacing,
    lineHeight: VALUE_LABEL_LINE_HEIGHT,
  },
  trendGlyph: {
    height: CHART_TITLE_ICON_SIZE,
    width: CHART_TITLE_ICON_SIZE,
  },
});
