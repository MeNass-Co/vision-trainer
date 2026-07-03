import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, FadeIn, GaborMark, Screen, SheetCloseButton } from '@/components/ui';
import { radius, space, surface } from '@/theme/tokens';

const SECTIONS = [
  {
    body: 'Contrast sensitivity is not fixed. With brief, repeated exposure to faint striped patterns, the visual cortex sharpens how it encodes edges. This is perceptual learning, and the gains can persist.',
    eyebrow: 'Why it works',
    title: 'Your visual system keeps learning',
  },
  {
    body: 'Each trial shows two quick flashes. One holds a faint grating, the other is blank. You pick the one with the pattern. The contrast keeps adjusting to sit right at the edge of what you can see.',
    eyebrow: 'What you are doing',
    title: 'Two flashes, one pattern',
  },
  {
    body: 'A staircase lowers the contrast when you are right and raises it when you are wrong. You spend the whole session at the boundary of your vision, which is exactly where the learning is strongest.',
    eyebrow: 'Why it adapts',
    title: 'Training lives at your threshold',
  },
  {
    body: 'A few quiet minutes in a dimly lit room beats a long, distracted stretch. Consistency is what moves the curve, so a daily session keeps the gains compounding.',
    eyebrow: 'How to get the most',
    title: 'Short, dim, and daily',
  },
] as const;

export default function ScienceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Screen (scroll) sets content top padding to `insets.top + space.xxl` — its
  // shared header rhythm. The sheet's close chip must instead sit at `space.base`
  // from the SHEET's own top edge (modal-sheet spec row 5), so pull it up locally
  // by the delta and push the following header down by the same amount so the
  // rest of the content doesn't visually jump into the status area.
  const chipTopOffset = insets.top + space.xxl - space.base;

  return (
    <Screen scroll sheet style={styles.screen}>
      <View
        style={[
          styles.topBar,
          { marginBottom: space.md + chipTopOffset, marginTop: -chipTopOffset },
        ]}>
        <SheetCloseButton onPress={() => router.back()} />
      </View>
      <FadeIn style={styles.header}>
        <AppText color="muted" uppercase variant="micro">
          The science
        </AppText>
        <AppText style={styles.title} variant="title">
          How perceptual learning sharpens your sight
        </AppText>
      </FadeIn>
      {SECTIONS.map((section, index) => (
        <FadeIn delay={80 + index * 60} key={section.eyebrow}>
          <Card style={styles.card}>
            <AppText color="accent" uppercase variant="micro">
              {section.eyebrow}
            </AppText>
            <AppText variant="heading">{section.title}</AppText>
            {section.title === 'Two flashes, one pattern' ? (
              <View style={styles.diagramRow}>
                <View style={styles.diagramItem}>
                  <View style={styles.diagramSquare}>
                    <GaborMark quiet size={40} />
                  </View>
                  <AppText color="muted" style={styles.diagramLabel} uppercase variant="micro">
                    Pattern
                  </AppText>
                </View>
                <View style={styles.diagramItem}>
                  <View style={styles.diagramSquare} />
                  <AppText color="muted" style={styles.diagramLabel} uppercase variant="micro">
                    Blank
                  </AppText>
                </View>
              </View>
            ) : null}
            <AppText color="secondary">{section.body}</AppText>
          </Card>
        </FadeIn>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.sm,
  },
  diagramItem: {
    alignItems: 'center',
    gap: space.xs,
  },
  diagramLabel: {
    letterSpacing: 0.6,
  },
  diagramRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.xs,
  },
  diagramSquare: {
    alignItems: 'center',
    backgroundColor: surface.raised,
    borderColor: surface.hairline,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  header: {
    gap: space.sm,
    marginBottom: space.lg,
  },
  screen: {
    gap: space.md,
    paddingBottom: space.xxl,
  },
  title: {
    maxWidth: 320,
  },
  topBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // Screen's own horizontal padding is space.lg (24); the sheet's close chip
    // sits at space.base (16) from the sheet edge (modal-sheet spec rows 5-6).
    // Vertical marginTop/marginBottom are set inline (see chipTopOffset above) —
    // they depend on the safe-area inset, which isn't known at StyleSheet.create time.
    marginRight: space.base - space.lg,
  },
});
