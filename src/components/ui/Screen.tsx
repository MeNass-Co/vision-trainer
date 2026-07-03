import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, surface } from '@/theme/tokens';

import { TAB_BAR_CLEARANCE } from './CustomTabBar';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  warm?: boolean;
  padded?: boolean;
  /**
   * Renders as a native modal sheet (design/references/modal-sheet/spec.md):
   * `surface.sheet` fill, `radius.sheet` top corners. Takes precedence over `warm`.
   */
  sheet?: boolean;
  /**
   * Full-bleed backdrop (e.g. the ambient gradient). Rendered as an absolutely
   * positioned sibling BEHIND the ScrollView (or content, when not scrollable)
   * — outside the safe-area padding, fixed to the screen's own bounds. It never
   * scrolls with content: this is what keeps top/bottom rubber-band bounce
   * seamless (the same fixed layer is already there, unmoving, so there is no
   * edge where a scrolling backdrop would run out and reveal flat color).
   */
  background?: ReactNode;
  /**
   * Reserves `TAB_BAR_CLEARANCE` of extra bottom space on the ScrollView's
   * `contentContainerStyle` so the last row/card scrolls clear of the floating
   * glass tab bar. Only meaningful when `scroll` is true. Defaults to `false`
   * — route-safe: modal sheets (science, calibration) and the paywall have no
   * tab bar underneath them and must never opt in, so every screen that
   * doesn't explicitly pass this prop keeps byte-identical layout. Only the
   * scrollable tab screens (Settings, Progress) pass `true`.
   */
  tabBarClearance?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Forwarded ref exposes the underlying `ScrollView` (when `scroll` is true) —
// sanctioned capture tooling only: lets a __DEV__-guarded screen imperatively
// `scrollTo` a card into frame for the reference-match screenshot rig (same
// doctrine as the seeded Progress DB). Not used by any production UI path.
export const Screen = forwardRef<ScrollView, ScreenProps>(function Screen(
  {
    children,
    scroll = false,
    warm = false,
    sheet = false,
    padded = true,
    background,
    tabBarClearance = false,
    style,
  },
  ref
) {
  const insets = useSafeAreaInsets();
  const backgroundColor = sheet ? surface.sheet : warm ? surface.warm : surface.base;
  const contentStyle = [
    styles.content,
    { paddingBottom: insets.bottom },
    padded && styles.padded,
    style,
    // Safe-area top is applied LAST so a screen's own `style` can never clobber it.
    // Every screen's header lands at the same Y, clear of the status bar / Dynamic Island.
    { paddingTop: insets.top + (scroll ? space.xxl : space.lg) },
  ];
  // Content container itself stays transparent (not `backgroundColor`): the
  // fixed `background` layer must show through the gutters between cards
  // during normal scroll, same as before — only the ROOT view below carries
  // the opaque base fill, which is what shows seamlessly during bounce.
  const scrollContentStyle = [
    styles.scrollContent,
    tabBarClearance && { paddingBottom: TAB_BAR_CLEARANCE },
  ];

  return (
    <View style={[styles.background, sheet && styles.sheetCorners, { backgroundColor }]}>
      {background ? (
        <View pointerEvents="none" style={styles.backgroundLayer}>
          {background}
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          ref={ref}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          <View style={contentStyle}>{children}</View>
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  sheetCorners: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: 'hidden',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: space.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
});
