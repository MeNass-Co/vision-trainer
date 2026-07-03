import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, GlassCard, Hairline } from '@/components/ui';
import { fontWeight, hairline, radius, space } from '@/theme/tokens';

export type SectionProps = {
  title: string;
  children: ReactNode;
  footer?: string;
};

export function Section({ title, children, footer }: SectionProps) {
  const rows = Children.toArray(children);

  return (
    <View style={styles.section}>
      <AppText color="secondary" style={styles.title}>
        {title}
      </AppText>
      {/* ONE-material pass: Tier 2 'surface' glass (settings sections, calibration
          slider) — the old opaque `surface.card` flat fill is gone, radius.xl(25)
          preserved. */}
      <GlassCard radius={radius.xl} style={styles.group} tier="surface">
        {rows.map((row, index) => (
          <Fragment key={index}>
            {/* spec rows 12-14: 1pt separator (hairline.px1, not native hairlineWidth), inset symmetric, flush with row text edge */}
            {index > 0 ? <Hairline inset={space.base} style={styles.hairline} /> : null}
            {row}
          </Fragment>
        ))}
      </GlassCard>
      {footer ? (
        <AppText color="secondary" style={styles.footer} variant="caption">
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    // spec row 35: caption weight reads Regular in reference; caption token is Medium — flagged minor mismatch, accepted
  },
  group: {
    // settings-group spec rows 1, 20, 30: radius.xl (25) fixed regardless of
    // height. Fill/blur/hairline now come from GlassCard (Tier 2 'surface').
    borderRadius: radius.xl,
  },
  hairline: {
    // spec row 12: separator thickness = hairline.px1 (1pt) — overrides Hairline's default native StyleSheet.hairlineWidth
    height: hairline.px1,
  },
  section: {
    // spec rows 37-38: label->card and card->caption gap = 10 (space.labelGap, no token — nearest space.sm=8/space.md=12)
    gap: 10,
    // spec row 36: section-to-section gap = space.section = 34 (nearest existing token space.xl = 32)
    marginBottom: 34,
  },
  title: {
    // Mobbin-conquest fix #2: 18/23 bold competed with the 'Settings' title
    // above it — dropped a tier so the two-tier hierarchy (screen title vs.
    // section cap) actually reads. Sentence case preserved, still text.secondary.
    fontWeight: fontWeight.semibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
});
