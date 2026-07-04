import Constants from 'expo-constants';
import { type Href, useRouter } from 'expo-router';
import { GlassContainer } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AmbientGradient } from '@/components/home/AmbientGradient';
import { Row } from '@/components/settings/Row';
import { Section } from '@/components/settings/Section';
import { Toggle } from '@/components/settings/Toggle';
import { AppText, FadeIn, PressableScale, Screen } from '@/components/ui';
import { t } from '@/i18n';
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
          {t('settings.title')}
        </AppText>
      </FadeIn>
      {/* GlassContainer (THE GREAT NATIVE WAVE): groups every settings section's
          glass card into one liquid-glass merge group so adjacent cards can
          blend/morph at the edges instead of reading as isolated slabs — the
          same droplet behavior Apple's own System Settings sections get. */}
      <GlassContainer spacing={space.lg}>
      <FadeIn delay={60}>
        <Section title={t('settings.sections.feedback.title')}>
          <Row
            icon="iphone.radiowaves.left.and.right"
            label={t('settings.rows.haptics.label')}
            right={
              <Toggle
                accessibilityLabel={t('settings.rows.haptics.label')}
                onChange={(value) => set('hapticsEnabled', value)}
                value={state.hapticsEnabled}
              />
            }
          />
          <Row
            icon="figure.walk.motion"
            iconFallback="tortoise"
            label={t('settings.rows.reduceMotion.label')}
            right={
              <Toggle
                accessibilityLabel={t('settings.rows.reduceMotion.label')}
                onChange={(value) => set('reduceMotion', value)}
                value={state.reduceMotion}
              />
            }
          />
        </Section>
      </FadeIn>
      <FadeIn delay={120}>
        <Section title={t('settings.sections.display.title')}>
          <Row
            accessibilityLabel={t('settings.rows.displayCalibration.label')}
            chevron
            icon="sun.max"
            label={t('settings.rows.displayCalibration.label')}
            onPress={() => router.push('/calibration' as Href)}
            right={<Chevron />}
          />
        </Section>
      </FadeIn>
      <FadeIn delay={180}>
        <Section title={t('settings.sections.reminders.title')}>
          <Row
            icon="bell"
            label={t('settings.rows.dailyReminder.label')}
            right={
              <Toggle
                accessibilityLabel={t('settings.rows.dailyReminder.label')}
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
                {t('settings.messages.remindersDisabled')}
              </AppText>
              <PressableScale
                accessibilityLabel={t('settings.messages.openSettings')}
                accessibilityRole="button"
                onPress={() => {
                  void Linking.openSettings();
                }}>
                <AppText color="accent" variant="micro">
                  {t('settings.messages.openSettings')}
                </AppText>
              </PressableScale>
            </View>
          ) : null}
        </Section>
      </FadeIn>
      <FadeIn delay={240}>
        <Section title={t('settings.sections.about.title')}>
          <Row
            icon="info.circle"
            label={t('settings.rows.version.label')}
            right={
              <AppText color="muted" style={styles.rowValue}>
                {t('settings.rows.version.value', { version: appVersion, build: buildNumber })}
              </AppText>
            }
          />
          <Row
            accessibilityLabel={t('settings.rows.science.label')}
            chevron
            icon="book"
            label={t('settings.rows.science.label')}
            onPress={() => router.push('/science' as Href)}
            right={<Chevron />}
          />
          <Row
            accessibilityLabel={t('settings.rows.earlyAccess.label')}
            chevron
            icon="sparkles"
            label={t('settings.rows.earlyAccess.label')}
            onPress={() => router.push('/paywall' as Href)}
            right={<Chevron />}
          />
          <Row
            accessibilityLabel={t('settings.rows.privacyPolicy.label')}
            chevron
            label={t('settings.rows.privacyPolicy.label')}
            onPress={() => {
              void WebBrowser.openBrowserAsync(PRIVACY_URL);
            }}
            right={<Chevron />}
          />
          <Row
            accessibilityLabel={t('settings.rows.termsOfUse.label')}
            chevron
            label={t('settings.rows.termsOfUse.label')}
            onPress={() => {
              void WebBrowser.openBrowserAsync(TERMS_URL);
            }}
            right={<Chevron />}
          />
        </Section>
      </FadeIn>
      </GlassContainer>
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
