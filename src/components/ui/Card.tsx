import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, space } from '@/theme/tokens';

import { GlassCard } from './GlassCard';

export type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  raised?: boolean;
};

// ONE-material pass: Card is Tier 3 'content' glass (Vision profile,
// spatial-frequency, science cards all consume it) — same GlassCard every
// other content surface uses, radius/padding/content untouched.
export function Card({ children, style, raised = false }: CardProps) {
  return (
    <View style={styles.shadow}>
      <GlassCard radius={radius.lg} style={[styles.card, raised && styles.raised, style]} tier="content">
        {children}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: space.base,
  },
  raised: {
    backgroundColor: 'rgba(14, 22, 25, 0.44)',
  },
  shadow: {
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: '#071114',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
