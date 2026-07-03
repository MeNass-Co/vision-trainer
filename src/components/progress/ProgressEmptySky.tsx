import { type Href, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { CelestialGabor } from '@/components/home/CelestialGabor';
import { AppText, ContextChip, FadeIn, PrimaryButton } from '@/components/ui';
import { TAB_BAR_CLEARANCE } from '@/components/ui/CustomTabBar';
import {
  ACCENT,
  ACCENT_CORE,
  ACCENT_GLOW,
  ACCENT_HOT,
  ACCENT_MUTED,
  ACCENT_SOFT,
  fontWeight,
  radius,
  space,
} from '@/theme/tokens';

const STAR_POINTS = [
  { x: 18, y: 104 },
  { x: 64, y: 74 },
  { x: 110, y: 44 },
  { x: 150, y: 30 },
  { x: 196, y: 42 },
  { x: 242, y: 72 },
  { x: 282, y: 100 },
] as const;

const PEAK_INDEX = 3;
const ARC_PATH = STAR_POINTS.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(
  ' ',
);

// empty-state spec (design/references/empty-state/spec.md) rows 1-2: the Shake
// Shack reference's visual cluster sits at a 20.7% top-offset and spans 35.4%
// of screen height. VALIDATION.md's empty-state verdict is "rhythm only" — our
// own celestial visual (orb + dormant chart) replaces the illustration outright
// (carve-out), so we honor the HEIGHT ratio (it governs how much vertical room
// the visual is given before the text starts) and let width follow naturally:
// the reference's tall-thin bag icon has no equivalent aspect in an orb+chart
// composition, so forcing literal ~119pt width (row 3's estimate) would distort
// our own visual's identity rather than transfer a rhythm.
const VISUAL_TOP_RATIO = 0.207;
const VISUAL_HEIGHT_RATIO = 0.354;
const VISUAL_GAP = space.sm;
const VISUAL_NATIVE_ORB = 300; // CelestialGabor intrinsic SIZE
const VISUAL_NATIVE_ARC_W = 300;
const VISUAL_NATIVE_ARC_H = 132;
const VISUAL_NATIVE_TOTAL = VISUAL_NATIVE_ORB + VISUAL_GAP + VISUAL_NATIVE_ARC_H;

// Row 22: text-block margins run ~50pt (space.xxl) each side vs the CTA's own
// 32pt (CTA law) — a real structural asymmetry to preserve, not noise. Screen
// already pads space.lg on both blocks, so each only adds its own remainder.
const TEXT_BLOCK_EXTRA_MARGIN = space.xxl - space.lg; // 24pt -> 48pt total
const CTA_EXTRA_MARGIN = space.xl - space.lg; // 8pt -> 32pt total, law 1

export type ProgressEmptySkyProps = {
  reduceMotion?: boolean;
};

export function ProgressEmptySky({ reduceMotion }: ProgressEmptySkyProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    setHeaderHeight((previous) => (previous === next ? previous : next));
  }, []);

  // Row 1's offset is measured from the true device top; our header chip plus
  // Screen's own safe-area/space.lg padding already consume part of that
  // budget before this component's root even starts, so subtract it back out.
  const consumedAboveScene = insets.top + space.lg + headerHeight;
  const sceneHeight = windowHeight * VISUAL_HEIGHT_RATIO;
  const sceneMarginTop = Math.max(
    space.md,
    windowHeight * VISUAL_TOP_RATIO - consumedAboveScene,
  );
  const visualScale = Math.min(1, Math.max(0.5, sceneHeight / VISUAL_NATIVE_TOTAL));
  const orbSize = VISUAL_NATIVE_ORB * visualScale;
  const arcWidth = VISUAL_NATIVE_ARC_W * visualScale;
  const arcHeight = VISUAL_NATIVE_ARC_H * visualScale;

  return (
    <View style={styles.root}>
      <FadeIn>
        <View onLayout={handleHeaderLayout} style={styles.screenLabelPlate}>
          <ContextChip label="Progress" />
        </View>
      </FadeIn>
      <View style={[styles.scene, { height: sceneHeight, marginTop: sceneMarginTop }]}>
        <FadeIn>
          <View
            style={[
              styles.orbScale,
              {
                height: orbSize,
                transform: [{ scale: orbSize / VISUAL_NATIVE_ORB }],
                width: orbSize,
              },
            ]}>
            <CelestialGabor
              contrast={0.32}
              progress={0.08}
              reduceMotion={reduceMotion}
              resolveOnMount
            />
          </View>
        </FadeIn>
        <FadeIn delay={120}>
          <Svg height={arcHeight} viewBox="0 0 300 132" width={arcWidth}>
            {/* dormant axis — the chart that will fill in */}
            <Line x1={12} y1={122} x2={288} y2={122} stroke={ACCENT_MUTED} strokeOpacity={0.14} strokeWidth={1} />
            {STAR_POINTS.map(({ x }) => (
              <Line key={`tick-${x}`} x1={x} y1={122} x2={x} y2={126} stroke={ACCENT_MUTED} strokeOpacity={0.22} strokeWidth={1} />
            ))}
            <Path
              d={ARC_PATH}
              fill="none"
              stroke={ACCENT_MUTED}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.18}
              strokeWidth={1}
            />
            <Circle cx={150} cy={30} fill={ACCENT_GLOW} r={9} />
            <Circle cx={150} cy={30} fill={ACCENT} fillOpacity={0.12} r={5} />
            {STAR_POINTS.map(({ x, y }, index) => (
              <Circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                fill={index === PEAK_INDEX ? ACCENT_CORE : ACCENT_SOFT}
                fillOpacity={index === PEAK_INDEX ? 0.85 : 0.16}
                r={index === PEAK_INDEX ? 3 : 2}
              />
            ))}
          </Svg>
        </FadeIn>
      </View>
      <View style={styles.textBlock}>
        <FadeIn delay={180}>
          <AppText color="primary" style={styles.title} variant="title">
            {'Your sky\nis dark'}
          </AppText>
        </FadeIn>
        <FadeIn delay={200}>
          <AppText color="secondary" style={styles.caption} variant="body">
            Train once to light your first star.
          </AppText>
        </FadeIn>
      </View>
      <View style={styles.spacer} />
      <FadeIn delay={220} style={styles.ctaWrap}>
        <PrimaryButton
          label="Start a session"
          onPress={() => router.push('/session' as Href)}
        />
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  // CTA law (VALIDATION.md #1) + Today/paywall's local-margin technique: Screen
  // already pads space.lg (24pt); add the remaining space.xl - space.lg to
  // reach the law's 32pt total. Row 7's bottom offset (safeAreaBottom + 16) is
  // Screen's own insets.bottom padding (34pt) plus this paddingBottom (16pt) —
  // NOT Shake Shack's 166.7pt dead zone, which VALIDATION explicitly voids.
  // Taste-iteration-3 empty-state fix: unlike Today/paywall, this screen sits
  // UNDER the floating glass tab bar (Progress tab) — but `Screen`'s
  // `tabBarClearance` prop only reserves room on its `scroll` branch, and this
  // screen renders with `scroll={false}` while empty, so no clearance was
  // ever reserved and the CTA rendered flush behind the tab bar's glass. Add
  // `TAB_BAR_CLEARANCE` locally (same constant `index.tsx`'s Today screen adds
  // at its own Screen-prop level) so the button clears the bar.
  ctaWrap: {
    marginHorizontal: CTA_EXTRA_MARGIN,
    paddingBottom: space.base + TAB_BAR_CLEARANCE,
  },
  orbScale: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  root: {
    flex: 1,
  },
  scene: {
    alignItems: 'center',
    gap: VISUAL_GAP,
    justifyContent: 'center',
  },
  screenLabelPlate: {
    alignSelf: 'flex-start',
  },
  // Row 21: caption->CTA is a MINIMUM of space.xl (32pt) — our CTA's own
  // bottom offset (row 7, law 1) is anchored near the screen edge rather than
  // Shake Shack's contiguous stack + 166.7pt dead zone, so on most devices
  // this spacer absorbs far more than 32pt; it never shows less.
  spacer: {
    flexGrow: 1,
    minHeight: space.xl,
  },
  // Row 18/17: caption ~ type.body size/line-height, weight bumped to medium
  // (nearest to the reference's bold-for-a-caption stroke ratio).
  caption: {
    fontWeight: fontWeight.medium,
    marginTop: 4,
    textAlign: 'center',
  },
  // Row 22: text block (title + caption) inset ~50pt (space.xxl) each side —
  // visibly more inset than the CTA's own 32pt margin; a real asymmetry.
  textBlock: {
    alignItems: 'center',
    // row 20: target ink-to-ink gap ~10.3pt. RN's flex `gap` clamps at 0, and
    // Inter's line-height leading alone already produces ~14.3pt between
    // these two type sizes at gap:0 — the extra pull is a negative marginTop
    // on the caption itself (calibrated against a live capture, same
    // technique as index.tsx's dotSlot marginTop).
    gap: 0,
    marginHorizontal: TEXT_BLOCK_EXTRA_MARGIN,
    marginTop: space.base, // row 19: visual->title gap
  },
  // Row 16: nearest token is type.title, but the reference runs a
  // "display-size" title (~32.6pt / 38.7pt line rhythm) — sized up from the
  // 28/34 token default rather than clamped to it, weight bumped to bold
  // (the reference's stroke ratio is too heavy for semibold).
  title: {
    fontWeight: fontWeight.bold,
    fontSize: 32.6,
    letterSpacing: 0,
    lineHeight: 38.7,
    textAlign: 'center',
  },
});
