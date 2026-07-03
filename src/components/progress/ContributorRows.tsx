import { Platform, StyleSheet, View } from 'react-native';

import { MetricRow, verdictFromRatio, WaveIcon } from '@/components/progress/MetricRow';
import { motion, space } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

export type ContributorRowsProps = {
  rows: { label: string; bandLabel: string; sensitivity: number; norm: number }[];
};

export function ContributorRows({ rows }: ContributorRowsProps) {
  const reduceMotion = useEffectiveReducedMotion();
  const isStatic = reduceMotion || Platform.OS === 'web';

  return (
    <View style={styles.list}>
      {rows.map((row, index) => (
        <MetricRow
          baseline={row.norm.toFixed(1)}
          delay={index * motion.timing.staggerMs}
          delta={{
            direction: row.sensitivity >= row.norm ? 'up' : 'down',
            verdict: verdictFromRatio(row.sensitivity, row.norm),
          }}
          icon={<WaveIcon />}
          isStatic={isStatic}
          key={row.label}
          // `bandLabel` ("Broad shapes"/"Everyday detail"/"Fine detail") buckets
          // multiple spatial frequencies together and repeats across rows —
          // `label` ("1.5 cpd") is the one field that's genuinely unique per
          // row, which the WHOOP reference's per-row identity (row 16) requires.
          label={row.label}
          value={row.sensitivity}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space.md,
  },
});
