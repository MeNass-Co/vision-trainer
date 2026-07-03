import Constants from 'expo-constants';
import { type Href, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { Row } from '@/components/settings/Row';
import { Section } from '@/components/settings/Section';
import { Toggle } from '@/components/settings/Toggle';
import { AppText, FadeIn, PressableScale, Screen } from '@/components/ui';
import { useSettingsState } from '@/presenters';
import { notificationService } from '@/services/notifications';
import { space, text } from '@/theme/tokens';
import { useEffectiveReducedMotion } from '@/theme/useEffectiveReducedMotion';

const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;
const PRIVACY_URL = 'https://menass-co.github.io/vision-trainer/privacy.html';
const TERMS_URL = 'https://menass-co.github.io/vision-trainer/terms.html';

export default function SettingsScreen() {
  const reduceMotion = useEffectiveReducedMotion();
  const router = useRouter();
  const { state, set } = useSettingsState();
  const reminderToggleInFlightRef = useRef(false);
  const [remindersBlocked, setRemindersBlocked] = useState(false);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const extra = Constants.expoConfig?.extra as { buildNumber?: string } | undefined;
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? extra?.buildNumber ?? '–';

  const handleRemindersChange = async (next: boolean) => {
    if (reminderToggleInFlightRef.current) {
      return;
    }

    reminderToggleInFlightRef.current = true;

    try {
      if (next) {
        const permission = await notificationService.requestRemindersPermission();
        if (!permission.granted) {
          // Permission denied/unavailable - keep the toggle off. A permanent
          // denial gets a visible path to iOS Settings instead of a silent snap-back.
          setRemindersBlocked(!permission.canAskAgain);
          set('remindersEnabled', false);
          return;
        }
        setRemindersBlocked(false);
        await notificationService.scheduleDailyReminder(REMINDER_HOUR, REMINDER_MINUTE);
        set('remindersEnabled', true);
      } else {
        await notificationService.cancelDailyReminder();
        set('remindersEnabled', false);
      }
    } catch {
      // Enabling failed before a reminder was scheduled; failed cancellation leaves it active.
      set('remindersEnabled', !next);
    } finally {
      reminderToggleInFlightRef.current = false;
    }
  };

  return (
    <Screen
      scroll
      tabBarClearance
      warm
      background={<AmbientGradient constellation reduceMotion={reduceMotion} />}
      style={styles.screen}>
      <FadeIn style={styles.title}>
        <AppText style={styles.settingsTitle} variant="title">
          Settings
        </AppText>
      </FadeIn>
      <FadeIn delay={60}>
        <Section title="Feedback">
          <Row
            label="Haptics"
            right={
              <Toggle
                accessibilityLabel="Haptics"
                onChange={(value) => set('hapticsEnabled', value)}
                value={state.hapticsEnabled}
              />
            }
          />
          <Row
            description="Calm ambient animation"
            label="Reduce motion"
            right={
              <Toggle
                accessibilityLabel="Reduce motion"
                onChange={(value) => set('reduceMotion', value)}
                value={state.reduceMotion}
              />
            }
          />
        </Section>
      </FadeIn>
      <FadeIn delay={120}>
        <Section title="Display">
          <Row
            accessibilityLabel="Display calibration"
            chevron
            description="Set a comfortable brightness for sessions"
            label="Display calibration"
            onPress={() => router.push('/calibration' as Href)}
            right={<Chevron />}
          />
        </Section>
      </FadeIn>
      <FadeIn delay={180}>
        <Section title="Reminders">
          <Row
            description="A gentle evening nudge to keep your streak"
            label="Daily reminder"
            right={
              <Toggle
                accessibilityLabel="Daily reminder"
                onChange={(value) => {
                  void handleRemindersChange(value);
                }}
                value={state.remindersEnabled}
              />
            }
          />
          {remindersBlocked ? (
            <View style={styles.remindersBlocked}>
              <AppText color="muted" variant="micro">
                Reminders are off in iOS Settings.
              </AppText>
              <PressableScale
                accessibilityLabel="Open Settings"
                accessibilityRole="button"
                onPress={() => {
                  void Linking.openSettings();
                }}>
                <AppText color="accent" variant="micro">
                  Open Settings
                </AppText>
              </PressableScale>
            </View>
          ) : null}
        </Section>
      </FadeIn>
      <FadeIn delay={240}>
        <Section title="About">
          <Row
            label="Version"
            right={
              <AppText color="muted" style={styles.rowValue}>
                v{appVersion} ({buildNumber})
              </AppText>
            }
          />
          <Row
            accessibilityLabel="The science"
            chevron
            description="How perceptual learning works"
            label="The science"
            onPress={() => router.push('/science' as Href)}
            right={<Chevron />}
          />
          <Row
            accessibilityLabel="Early access"
            chevron
            description="What early access includes"
            label="Early access"
            onPress={() => router.push('/paywall' as Href)}
            right={<Chevron />}
          />
          <Row
            accessibilityLabel="Privacy Policy"
            chevron
            label="Privacy Policy"
            onPress={() => {
              void WebBrowser.openBrowserAsync(PRIVACY_URL);
            }}
            right={<Chevron />}
          />
          <Row
            accessibilityLabel="Terms of Use"
            chevron
            label="Terms of Use"
            onPress={() => {
              void WebBrowser.openBrowserAsync(TERMS_URL);
            }}
            right={<Chevron />}
          />
        </Section>
      </FadeIn>
    </Screen>
  );
}

function Chevron() {
  // Taste-iteration-3 (SF Symbols everywhere): one icon language app-wide,
  // same SymbolView primitive the tab bar already uses.
  return (
    <SymbolView
      name="chevron.right"
      resizeMode="scaleAspectFit"
      size={14}
      style={styles.chevronGlyph}
      tintColor={text.muted}
      type="monochrome"
      weight="medium"
    />
  );
}

const styles = StyleSheet.create({
  chevronGlyph: {
    height: 14,
    width: 14,
  },
  remindersBlocked: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.sm,
    justifyContent: 'space-between',
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  rowValue: {
    // spec row 34: value/chevron trailing text shares row-title type size (17/22)
    fontSize: 17,
    lineHeight: 22,
  },
  screen: {
    // spec row 2: screen edge -> card edge = space.base (16), overriding Screen's default 24pt `padded` inset
    paddingBottom: space.lg,
    paddingHorizontal: space.base,
  },
  settingsTitle: {
    fontSize: 34,
    lineHeight: 40,
  },
  title: {
    marginBottom: space.lg,
  },
});
