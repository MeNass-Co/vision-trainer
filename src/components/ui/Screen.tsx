import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, surface } from '@/theme/tokens';

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
   * positioned sibling BEHIND the content — outside the safe-area padding and
   * outside the safe-area padding. Scroll screens mount it inside the scroll
   * content so the sky travels with long pages instead of revealing flat gutters.
   */
  background?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Forwarded ref exposes the underlying `ScrollView` (when `scroll` is true) —
// sanctioned capture tooling only: lets a __DEV__-guarded screen imperatively
// `scrollTo` a card into frame for the reference-match screenshot rig (same
// doctrine as the seeded Progress DB). Not used by any production UI path.
export const Screen = forwardRef<ScrollView, ScreenProps>(function Screen(
  { children, scroll = false, warm = false, sheet = false, padded = true, background, style },
  ref
) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
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

  return (
    <View style={[styles.background, sheet && styles.sheetCorners, { backgroundColor }]}>
      {!scroll && background ? (
        <View pointerEvents="none" style={styles.backgroundLayer}>
          {background}
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={ref}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.scrollBackdrop, { minHeight: height }]}>
            {background ? (
              <View pointerEvents="none" style={styles.backgroundLayer}>
                {background}
              </View>
            ) : null}
            <View style={contentStyle}>{children}</View>
          </View>
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
  scrollBackdrop: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
