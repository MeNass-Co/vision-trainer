import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { hairline, icon, material, motion, radius, space, surface, text, type as typo } from '@/theme/tokens';

import { PressableScale } from './PressableScale';

// Law 5 (VALIDATION.md): icons + labels are WHITE in BOTH states — the only
// active/inactive distinction is the frosted pill + filled-vs-outline glyph swap.
// No cyan on the tab bar.
const GLYPH_COLOR = text.primary;

// Spec rows 1/3-4/6: 61pt fixed bar height, ~60pt symmetric screen-edge margins
// (no existing token this large — between space.xxl=48 and space.xxxl=64), radius
// via the dedicated radius.floatingBar token.
const BAR_HEIGHT = 61;
const BAR_MARGIN = 60;
// Spec rows 10/34: pill inset from bar edge on all sides = space.xs (4pt).
const PILL_INSET = space.xs;
const PILL_HEIGHT = BAR_HEIGHT - PILL_INSET * 2;
// Spec rows 15/35: icon-to-label gap ~6.7pt avg, proposed token never finalized
// in the VALIDATION.md addendum — used as a literal per that precedent (space.2xs).
const ICON_LABEL_GAP = 6;

type TabIconProps = {
  focused: boolean;
  routeName: string;
};

type RouteItem = BottomTabBarProps['state']['routes'][number];

// Glyphs are drawn to FILL the 24-unit viewBox (drawn extent ≈21-22 units incl.
// stroke → ≈20-21pt visible in the 23pt box), matching the reference's chunky
// ~90% optical fill. Stroke 2.4 units → ≈2.3pt displayed — inactive ≠ thin.
function TabIcon({ focused, routeName }: TabIconProps) {
  const dotFill = focused ? GLYPH_COLOR : 'none';

  const content = (() => {
    switch (routeName) {
      case 'progress':
        return (
          <>
            <Path d="M4 19 C 7.7 19, 9.4 10.1, 12.75 10.1 S 17.2 5.9, 20 5" fill="none" />
            <Circle cx={4} cy={19} fill={dotFill} r={2.4} />
            <Circle cx={20} cy={5} fill={dotFill} r={2.4} />
          </>
        );
      case 'settings':
        return (
          <>
            <Line x1={2.8} x2={21.2} y1={5} y2={5} />
            <Circle cx={16.5} cy={5} fill={dotFill} r={2.6} />
            <Line x1={2.8} x2={21.2} y1={12} y2={12} />
            <Circle cx={8.3} cy={12} fill={dotFill} r={2.6} />
            <Line x1={2.8} x2={21.2} y1={19} y2={19} />
            <Circle cx={14.2} cy={19} fill={dotFill} r={2.6} />
          </>
        );
      case 'index':
      default:
        return focused ? (
          <Path
            d="M1.4 10.84 12 1.56l10.6 9.28v11.75h-7.25v-6.82H8.67v6.82H1.4z"
            fill={GLYPH_COLOR}
            stroke="none"
          />
        ) : (
          <>
            <Path d="M2.06 11.33 12 2.39l9.94 8.94" fill="none" />
            <Path d="M5.18 9.91v11.5h13.64v-11.5" fill="none" />
            <Path d="M9.44 21.41v-6.67h5.11v6.67" fill="none" />
          </>
        );
    }
  })();

  return (
    <Svg
      fill="none"
      height={icon.tab}
      stroke={GLYPH_COLOR}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.4}
      viewBox="0 0 24 24"
      width={icon.tab}>
      {content}
    </Svg>
  );
}

type TabButtonProps = {
  focused: boolean;
  label: string;
  onPress: () => void;
  routeName: string;
};

function TabButton({ focused, label, onPress, routeName }: TabButtonProps) {
  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      haptic="selection"
      onPress={onPress}
      style={styles.tabButton}>
      <TabIcon focused={focused} routeName={routeName} />
      {/* Plain RN Text (not AppText) so the exact spec type row (type.tabLabel)
          applies without fighting AppText's Variant union — AppText is a shared
          file out of this element's blast radius. */}
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </PressableScale>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const translateX = useSharedValue(0);
  const hasMounted = useRef(false);
  const columnWidth = barWidth / state.routes.length;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    if (columnWidth <= 0) return;
    const target = state.index * columnWidth;
    if (!hasMounted.current) {
      translateX.value = target;
      hasMounted.current = true;
    } else {
      translateX.value = withSpring(target, motion.spring.liquid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, columnWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderTab = (route: RouteItem) => {
    const index = state.routes.findIndex((item) => item.key === route.key);
    const focused = state.index === index;
    const label = descriptors[route.key].options.title ?? route.name;
    const handlePress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TabButton
        focused={focused}
        key={route.key}
        label={label}
        onPress={handlePress}
        routeName={route.name}
      />
    );
  };

  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom + space.sm }]}>
      {/* Neutral dark scrim behind the floating bar so it reads over any content —
          no accent hue, unrelated to the bar's own material. */}
      <LinearGradient
        colors={['rgba(5,8,10,0)', 'rgba(5,8,10,0.34)', surface.base]}
        pointerEvents="none"
        style={styles.bottomField}
      />
      <View style={styles.barShadow}>
        <BlurView
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          intensity={Platform.OS === 'ios' ? 55 : 62}
          style={styles.bar}
          tint="dark">
          <View style={styles.barTint} />
          {/* Hairline drawn as overlays, not borderWidth — a border would eat into
              the content box and throw off the pill's symmetric top/bottom inset. */}
          <View style={styles.hairlineTop} />
          <View style={styles.hairlineBottom} />
          <View onLayout={handleLayout} style={styles.primaryRow}>
            {barWidth > 0 ? (
              <Animated.View
                style={[
                  styles.pill,
                  pillStyle,
                  { width: columnWidth - PILL_INSET * 2 },
                ]}
              />
            ) : null}
            {state.routes.map((route) => renderTab(route))}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.floatingBar,
    height: BAR_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  barShadow: {
    borderRadius: radius.floatingBar,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    width: '100%',
  },
  barTint: {
    backgroundColor: surface.overlay,
    bottom: 0,
    left: 0,
    opacity: 0.45,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bottomField: {
    bottom: 0,
    height: 132,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  hairlineBottom: {
    backgroundColor: material.hairlineOnGlass,
    bottom: 0,
    height: hairline.px1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  hairlineTop: {
    backgroundColor: material.hairlineOnGlass,
    height: hairline.px1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  label: {
    color: GLYPH_COLOR,
    fontFamily: typo.tabLabel.fontFamily,
    fontSize: typo.tabLabel.fontSize,
    letterSpacing: typo.tabLabel.letterSpacing,
    lineHeight: typo.tabLabel.lineHeight,
  },
  outer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: BAR_MARGIN,
    paddingTop: space.sm,
    position: 'relative',
    width: '100%',
  },
  pill: {
    backgroundColor: material.pillOnGlass,
    borderRadius: radius.pill,
    height: PILL_HEIGHT,
    left: PILL_INSET,
    position: 'absolute',
    top: PILL_INSET,
  },
  primaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: ICON_LABEL_GAP,
    height: '100%',
    justifyContent: 'center',
  },
});
