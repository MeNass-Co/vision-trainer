import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { SFSymbol, SymbolWeight } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { icon, material, motion, radius, space, text, type as typo } from '@/theme/tokens';

import { PressableScale } from './PressableScale';

// Aesthetic-law rebuild (native-revamp): real Liquid Glass, SF Symbols, Apple
// Music-style stadium bar. Overrides the old hand-drawn-SVG / opaque-slab spec.
// Icons + labels stay WHITE in both states — the only active/inactive signal
// is the frosted pill, the filled-vs-outline glyph, and label opacity.
const GLYPH_COLOR = text.primary;

// Geometry: floating stadium bar close to the home indicator. Radius = height/2
// (true pill), derived from BAR_HEIGHT rather than a separate token so the two
// can never drift out of sync.
const BAR_HEIGHT = 64;
const BAR_RADIUS = BAR_HEIGHT / 2;
const BAR_SIDE_MARGIN = space.lg; // 24pt
const BAR_BOTTOM_GAP = 4; // safe-area bottom inset + 4pt
// The bar now floats via `position: absolute` (real overlay, not a flex row)
// so content genuinely scrolls/sits underneath the glass. Fixed-layout screens
// (Today) need to know how much clearance to reserve above the safe-area inset
// so their bottom-most control never sits under the glyphs. Exported so
// index.tsx (the only other file in this element's blast radius) can consume
// it without duplicating the geometry.
export const TAB_BAR_CLEARANCE = BAR_BOTTOM_GAP + BAR_HEIGHT + space.base;
const PILL_INSET = space.xs; // 4pt inset on all sides
const PILL_HEIGHT = BAR_HEIGHT - PILL_INSET * 2;
const ICON_SIZE = icon.tab; // 23pt, within the 22-24pt law
const ICON_LABEL_GAP = 4;

type TabIconProps = {
  focused: boolean;
  routeName: string;
};

type RouteItem = BottomTabBarProps['state']['routes'][number];

type SymbolSpec = {
  inactive: SFSymbol;
  active: SFSymbol;
  activeWeight?: SymbolWeight;
};

// SF Symbols per tab. Progress reuses the same glyph active/inactive and
// signals state via weight (regular -> semibold) instead of a filled variant,
// since chart.line.uptrend.xyaxis has no distinct .fill counterpart.
const SYMBOLS: Record<string, SymbolSpec> = {
  index: { inactive: 'house', active: 'house.fill' },
  progress: {
    inactive: 'chart.line.uptrend.xyaxis',
    active: 'chart.line.uptrend.xyaxis',
    activeWeight: 'semibold',
  },
  settings: { inactive: 'gearshape', active: 'gearshape.fill' },
};

function TabIcon({ focused, routeName }: TabIconProps) {
  const spec = SYMBOLS[routeName] ?? SYMBOLS.index;
  return (
    <SymbolView
      name={focused ? spec.active : spec.inactive}
      resizeMode="scaleAspectFit"
      size={ICON_SIZE}
      style={styles.icon}
      tintColor={GLYPH_COLOR}
      type="monochrome"
      weight={focused ? (spec.activeWeight ?? 'regular') : 'regular'}
    />
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
          applies without fighting AppText's Variant union. */}
      <Text numberOfLines={1} style={[styles.label, { opacity: focused ? 1 : 0.64 }]}>
        {label}
      </Text>
    </PressableScale>
  );
}

type BarMaterialProps = {
  children: ReactNode;
  liquidGlass: boolean;
};

// Real Liquid Glass on iOS 26 (GlassView, "regular" style — refracts the
// starfield behind it, no manual tint/overlay layers riding on top). Falls
// back to a plain BlurView on platforms where the Liquid Glass API isn't
// available; that fallback is not the target render and is kept minimal.
function BarMaterial({ children, liquidGlass }: BarMaterialProps) {
  if (liquidGlass) {
    return (
      <GlassView colorScheme="dark" glassEffectStyle="regular" style={styles.bar}>
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      intensity={Platform.OS === 'ios' ? 55 : 62}
      style={styles.bar}
      tint="dark">
      {children}
    </BlurView>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const translateX = useSharedValue(0);
  const hasMounted = useRef(false);
  const columnWidth = barWidth / state.routes.length;
  const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

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
    <View style={[styles.outer, { paddingBottom: insets.bottom + BAR_BOTTOM_GAP }]}>
      <View style={styles.barShadow}>
        <BarMaterial liquidGlass={liquidGlass}>
          {/* Hairline kept to a whisper — a single top edge, not a boxed outline,
              so the pill still reads as glass rather than a bordered card. */}
          <View pointerEvents="none" style={styles.hairlineTop} />
          <View onLayout={handleLayout} style={styles.primaryRow}>
            {barWidth > 0 ? (
              <Animated.View
                style={[styles.pill, pillStyle, { width: columnWidth - PILL_INSET * 2 }]}
              />
            ) : null}
            {state.routes.map((route) => renderTab(route))}
          </View>
        </BarMaterial>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'transparent',
    borderRadius: BAR_RADIUS,
    height: BAR_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  barShadow: {
    borderRadius: BAR_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    width: '100%',
  },
  hairlineTop: {
    backgroundColor: material.hairlineOnGlass,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  icon: {
    height: ICON_SIZE,
    width: ICON_SIZE,
  },
  label: {
    color: GLYPH_COLOR,
    fontWeight: typo.tabLabel.fontWeight,
    fontSize: typo.tabLabel.fontSize,
    letterSpacing: typo.tabLabel.letterSpacing,
    lineHeight: typo.tabLabel.lineHeight,
  },
  outer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    paddingHorizontal: BAR_SIDE_MARGIN,
    position: 'absolute',
    right: 0,
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
