import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { ACCENT_CORE, material, space, surface } from '@/theme/tokens';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

const BAR_HEIGHT = 50;
const BAR_RADIUS = BAR_HEIGHT / 2;
const ACTION_SIZE = 50;
const OUTER_INSET = 22;

type TabIconProps = {
  color: string;
  focused: boolean;
  routeName: string;
};

type RouteItem = BottomTabBarProps['state']['routes'][number];

function TabIcon({ color, focused, routeName }: TabIconProps) {
  const content = (() => {
    switch (routeName) {
      case 'progress':
        return (
          <>
            <Path d="M3.5 16.8 C 7.4 16.8, 9.2 9, 12.8 9 S 17.5 5.3, 20.5 4.5" />
            <Circle cx={3.5} cy={16.8} r={1.25} />
            <Circle cx={20.5} cy={4.5} r={1.25} />
          </>
        );
      case 'settings':
        return (
          <>
            <Line x1={4.2} x2={19.8} y1={7} y2={7} />
            <Circle cx={15.8} cy={7} r={1.85} />
            <Line x1={4.2} x2={19.8} y1={12} y2={12} />
            <Circle cx={8.9} cy={12} r={1.85} />
            <Line x1={4.2} x2={19.8} y1={17} y2={17} />
            <Circle cx={13.9} cy={17} r={1.85} />
          </>
        );
      case 'index':
      default:
        return focused ? (
          <Path
            d="M4.7 11.2 12 4.8l7.3 6.4v8.1h-5v-4.7H9.7v4.7h-5z"
            fill={color}
            stroke="none"
          />
        ) : (
          <>
            <Path d="M5 11.5 12 5.2l7 6.3" />
            <Path d="M7.2 10.5v8.1h9.6v-8.1" />
            <Path d="M10.2 18.6v-4.7h3.6v4.7" />
          </>
        );
    }
  })();

  return (
    <Svg
      fill="none"
      height={22}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.85}
      viewBox="0 0 24 24"
      width={22}>
      {content}
    </Svg>
  );
}

type TabButtonProps = {
  compact?: boolean;
  focused: boolean;
  label: string;
  onPress: () => void;
  routeName: string;
};

function TabButton({ compact = false, focused, label, onPress, routeName }: TabButtonProps) {
  const color = focused ? ACCENT_CORE : 'rgba(210,249,250,0.70)';

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      haptic="selection"
      onPress={onPress}
      scaleTo={1}
      style={compact ? styles.actionButton : styles.tabButton}>
      {focused ? (
        <LinearGradient
          colors={[
            'rgba(91,233,236,0.32)',
            'rgba(207,250,251,0.18)',
            'rgba(91,233,236,0.09)',
          ]}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={compact ? styles.actionActiveFill : styles.activeFill}
        />
      ) : null}
      <LinearGradient
        colors={['rgba(167,247,249,0.20)', 'rgba(167,247,249,0.06)', 'rgba(167,247,249,0)']}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={compact ? styles.actionSheen : styles.tabSheen}
      />
      <TabIcon color={color} focused={focused} routeName={routeName} />
      {compact ? null : (
        <AppText numberOfLines={1} style={[styles.label, { color }]} variant="micro">
          {label}
        </AppText>
      )}
    </PressableScale>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const liquidGlass =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  const primaryRoutes = state.routes;

  const renderTab = (route: RouteItem, compact = false) => {
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
        compact={compact}
        focused={focused}
        key={route.key}
        label={label}
        onPress={handlePress}
        routeName={route.name}
      />
    );
  };

  const primaryContent = (
    <View style={styles.primaryRow}>{primaryRoutes.map((route) => renderTab(route))}</View>
  );
  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom + space.sm }]}>
      <LinearGradient
        colors={['rgba(5,8,10,0)', 'rgba(5,8,10,0.34)', surface.base]}
        pointerEvents="none"
        style={styles.bottomField}
      />
      <View style={styles.musicRow}>
        <View style={styles.primaryShadow}>
          {liquidGlass ? (
            <GlassView
              colorScheme="light"
              glassEffectStyle={{ style: 'regular', animate: true, animationDuration: 0.2 }}
              style={styles.primaryBar}
              tintColor="rgba(187,249,250,0.26)">
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.30)',
                  'rgba(207,250,251,0.16)',
                  'rgba(91,233,236,0.06)',
                ]}
                pointerEvents="none"
                style={styles.barSheen}
              />
              {primaryContent}
            </GlassView>
          ) : (
            <BlurView
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
              intensity={Platform.OS === 'ios' ? Math.max(material.blurIntensity, 76) : 62}
              style={styles.primaryBar}
              tint="light">
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.30)',
                  'rgba(207,250,251,0.16)',
                  'rgba(91,233,236,0.06)',
                ]}
                pointerEvents="none"
                style={styles.barSheen}
              />
              {primaryContent}
            </BlurView>
          )}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionActiveFill: {
    borderRadius: 19,
    height: 38,
    left: 6,
    position: 'absolute',
    top: 6,
    width: 38,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: ACTION_SIZE / 2,
    height: ACTION_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
    width: ACTION_SIZE,
  },
  actionGlass: {
    backgroundColor: 'rgba(207,250,251,0.20)',
    borderRadius: ACTION_SIZE / 2,
    height: ACTION_SIZE,
    overflow: 'hidden',
    width: ACTION_SIZE,
  },
  actionShadow: {
    borderRadius: ACTION_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
  },
  actionSheen: {
    borderRadius: ACTION_SIZE / 2,
    height: 20,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 3,
  },
  activeFill: {
    borderRadius: 19,
    height: 38,
    left: '50%',
    marginLeft: -29,
    position: 'absolute',
    top: 6,
    width: 58,
  },
  barSheen: {
    height: 22,
    left: 0,
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
  label: {
    fontSize: 9,
    letterSpacing: 0,
    lineHeight: 11,
  },
  musicRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    width: '100%',
  },
  outer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: OUTER_INSET,
    paddingTop: space.sm,
    position: 'relative',
    width: '100%',
  },
  primaryBar: {
    backgroundColor: 'rgba(207,250,251,0.18)',
    borderRadius: BAR_RADIUS,
    height: BAR_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  primaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: 4,
    width: '100%',
  },
  primaryShadow: {
    borderRadius: BAR_RADIUS,
    flex: 1,
    maxWidth: 264,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 25,
    flex: 1,
    gap: 1,
    height: BAR_HEIGHT - 7,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabSheen: {
    borderRadius: 25,
    height: 18,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 2,
  },
});
