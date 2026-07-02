import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

import { ACCENT, ACCENT_CORE, ACCENT_HOT, ACCENT_MUTED } from '@/theme/tokens';

export type GaborMarkProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  quiet?: boolean;
};

const STRIPE_STOPS = [
  ['0%', ACCENT_MUTED, 0.18],
  ['12%', ACCENT_CORE, 0.78],
  ['24%', ACCENT, 0.2],
  ['36%', ACCENT_HOT, 0.7],
  ['48%', ACCENT_MUTED, 0.16],
  ['60%', ACCENT_CORE, 0.72],
  ['72%', ACCENT, 0.2],
  ['84%', ACCENT_HOT, 0.62],
  ['100%', ACCENT_MUTED, 0.16],
] as const;

export function GaborMark({ size = 208, style, quiet = false }: GaborMarkProps) {
  const id = useId().replace(/:/g, '');
  const stripeId = `gabor-mark-stripes-${id}`;
  const envelopeId = `gabor-mark-envelope-${id}`;
  const center = size / 2;

  return (
    <View style={[styles.shell, quiet && styles.quiet, { height: size, width: size }, style]}>
      <Svg height={size} width={size}>
        <Defs>
          <LinearGradient id={stripeId} x1="0%" x2="100%" y1="100%" y2="0%">
            {STRIPE_STOPS.map(([offset, color, opacity]) => (
              <Stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
            ))}
          </LinearGradient>
          <RadialGradient cx="50%" cy="50%" id={envelopeId} r="52%">
            <Stop offset="0%" stopColor="#071114" stopOpacity={0} />
            <Stop offset="52%" stopColor="#071114" stopOpacity={0.05} />
            <Stop offset="76%" stopColor="#071114" stopOpacity={0.58} />
            <Stop offset="100%" stopColor="#071114" stopOpacity={0.96} />
          </RadialGradient>
        </Defs>
        <Circle cx={center} cy={center} fill="#081114" r={center * 0.72} />
        <Circle cx={center} cy={center} fill={`url(#${stripeId})`} r={center * 0.7} />
        <Circle cx={center} cy={center} fill={`url(#${envelopeId})`} r={center * 0.71} />
        <Circle
          cx={center}
          cy={center}
          fill="none"
          r={center * 0.71}
          stroke="rgba(207,250,251,0.18)"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  quiet: {
    shadowOpacity: 0.22,
  },
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_CORE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
  },
});
