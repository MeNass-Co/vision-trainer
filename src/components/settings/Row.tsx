import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { SFSymbol } from 'sf-symbols-typescript';

import { AppText } from '@/components/ui';
import { haptics } from '@/theme/haptics';
import { accent, material, motion, radius, space, surface } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ICON_CHIP_SIZE = 28;
const ICON_GLYPH_SIZE = 15;

export type RowProps = {
  label: string;
  description?: string;
  right: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  chevron?: boolean;
  /** Leading SF Symbol, wrapped in a 28pt rounded-square accent chip (Mobbin-conquest gap #1). */
  icon?: SFSymbol;
  /** Rendered by expo-symbols when `icon` has no definition on the running OS. */
  iconFallback?: SFSymbol;
};

type RowBodyProps = Pick<RowProps, 'label' | 'description' | 'right' | 'chevron' | 'icon' | 'iconFallback'> & {
  rightStyle?: ReturnType<typeof useAnimatedStyle<ViewStyle>>;
};

function IconChip({
  icon,
  iconFallback,
  twoLine,
}: {
  icon: SFSymbol;
  iconFallback?: SFSymbol;
  twoLine: boolean;
}) {
  return (
    // Two-line rows (description present): the chip anchors to the title's
    // vertical center, not the whole row's — otherwise it optically drifts
    // toward the description line. alignSelf 'flex-start' + a small offset
    // approximates the title-line center inside the double-height row.
    <View style={[styles.iconChip, twoLine && styles.iconChipTwoLine]}>
      <SymbolView
        fallback={
          iconFallback ? (
            <SymbolView
              name={iconFallback}
              resizeMode="scaleAspectFit"
              size={ICON_GLYPH_SIZE}
              style={styles.iconGlyph}
              tintColor={accent.default}
              type="monochrome"
              weight="medium"
            />
          ) : undefined
        }
        name={icon}
        resizeMode="scaleAspectFit"
        size={ICON_GLYPH_SIZE}
        style={styles.iconGlyph}
        tintColor={accent.default}
        type="monochrome"
        weight="medium"
      />
    </View>
  );
}

function RowBody({ label, description, right, chevron, icon, iconFallback, rightStyle }: RowBodyProps) {
  return (
    <>
      {icon ? <IconChip icon={icon} iconFallback={iconFallback} twoLine={Boolean(description)} /> : null}
      <View style={styles.copy}>
        {/* spec row 33: row title ~17pt/22 lineHeight, Regular (link/destructive-style weight — the identity-row-only Medium doesn't apply to our plain rows) */}
        <AppText style={styles.title}>{label}</AppText>
        {description ? (
          <AppText color="muted" variant="caption">
            {description}
          </AppText>
        ) : null}
      </View>
      {chevron ? (
        <Animated.View style={[styles.right, rightStyle]}>{right}</Animated.View>
      ) : (
        <View style={styles.right}>{right}</View>
      )}
    </>
  );
}

export function Row({
  label,
  description,
  right,
  onPress,
  accessibilityLabel,
  chevron = false,
  icon,
  iconFallback,
}: RowProps) {
  const pressed = useSharedValue(0);
  const reduceMotion = useEffectiveReducedMotion();
  const followX = useSharedValue(0);
  const rightStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [{ translateX: followX.value }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(pressed.value, [0, 1], [surface.card, surface.cardPressed]),
  }));

  // spec rows 4-6: single-line rows = rowHeight.single (52); rows with a description are
  // treated as the two-line row = rowHeight.double (73, best-effort per spec note on row 6/44).
  const rowHeightStyle = description ? styles.rowDouble : styles.rowSingle;

  if (!onPress) {
    return (
      <View style={[styles.row, rowHeightStyle]}>
        <RowBody description={description} icon={icon} iconFallback={iconFallback} label={label} right={right} />
      </View>
    );
  }

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => {
        pressed.value = reduceMotion ? 1 : withTiming(1, { duration: 90 });
        if (chevron) {
          followX.value = reduceMotion ? 2 : withSpring(2, motion.spring.press);
        }
        haptics.select();
      }}
      onPressOut={() => {
        pressed.value = reduceMotion ? 0 : withTiming(0, { duration: motion.timing.rangeFadeMs });
        if (chevron) {
          followX.value = reduceMotion ? 0 : withSpring(0, motion.spring.press);
        }
      }}
      style={[styles.row, rowHeightStyle, fillStyle]}>
      <RowBody
        chevron={chevron}
        description={description}
        icon={icon}
        iconFallback={iconFallback}
        label={label}
        right={right}
        rightStyle={rightStyle}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
    // spec rows 7-9: leading/trailing padding ~16-17.3pt -> space.base (16), exact-enough per spec tolerance
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
  },
  rowSingle: {
    minHeight: 52,
  },
  rowDouble: {
    minHeight: 73,
  },
  copy: {
    flex: 1,
    gap: space.xs,
  },
  right: {
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  iconChip: {
    alignItems: 'center',
    backgroundColor: material.fillChip,
    borderRadius: radius.sm,
    flexShrink: 0,
    height: ICON_CHIP_SIZE,
    justifyContent: 'center',
    width: ICON_CHIP_SIZE,
  },
  iconChipTwoLine: {
    alignSelf: 'flex-start',
    // Row is minHeight.double(73) with paddingVertical(space.sm=8) top/bottom;
    // the title's own line-height (22) center sits ~11pt below the copy
    // block's top edge, which itself floats vertically centered inside the
    // row by the row's alignItems:'center'. Net offset from the chip's own
    // (also center-of-row) default position to the title-line center.
    marginTop: 3,
  },
  iconGlyph: {
    height: ICON_GLYPH_SIZE,
    width: ICON_GLYPH_SIZE,
  },
});
