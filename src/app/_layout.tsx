import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText, PrimaryButton } from '@/components/ui';
import { t } from '@/i18n';
import { notificationService } from '@/services/notifications';
import { useAppStore } from '@/store/useAppStore';
import { radius, space, surface } from '@/theme/tokens';
import { useAppFonts } from '@/theme/useAppFonts';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useAppFonts();
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrateFailed = useAppStore((state) => state.hydrateFailed);
  const hydrate = useAppStore((state) => state.hydrate);
  const retryHydrate = useAppStore((state) => state.retryHydrate);
  const onboardingComplete = useAppStore((state) => state.settings.onboardingComplete);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const ready = (loaded || error) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // A tapped reminder lands the user on Today. The platform-split service is a
  // no-op on web, so no native notification code enters the web bundle.
  useEffect(() => {
    return notificationService.addResponseListener(() => {
      router.replace('/(tabs)');
    });
  }, [router]);

  // Route gate: a returning user skips onboarding; a fresh user can't slip past it.
  // `needsRedirect` is computed during render so we can withhold the tree until the
  // redirect settles — otherwise the deep-linked screen paints for one frame first.
  // A failed hydration never redirects: defaults would masquerade as a fresh user
  // and re-onboard a veteran over a transient load failure.
  // The paywall is the tail of the onboarding funnel: it never triggers a redirect,
  // so flipping onboardingComplete while it settles can't yank the user to the tabs.
  const inOnboarding = segments[0] === 'onboarding';
  const inPaywall = (segments[0] as string) === 'paywall';
  const needsRedirect =
    ready &&
    !hydrateFailed &&
    ((!onboardingComplete && !inOnboarding && !inPaywall) || (onboardingComplete && inOnboarding));

  useEffect(() => {
    if (!needsRedirect) return;
    router.replace(onboardingComplete ? '/(tabs)' : '/onboarding');
  }, [needsRedirect, onboardingComplete, router]);

  if (!ready) return null;

  if (hydrateFailed) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: surface.base }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <View style={styles.degraded}>
            <AppText style={styles.degradedTitle} variant="title">
              {t('common.errors.hydrateFailedTitle')}
            </AppText>
            <PrimaryButton label={t('common.errors.retry')} onPress={() => void retryHydrate()} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (needsRedirect) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: surface.base }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: surface.base },
            animation: 'fade',
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="session"
            options={{ presentation: 'fullScreenModal', gestureEnabled: true, animation: 'none' }}
          />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="paywall" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="calibration"
            options={{
              presentation: 'formSheet',
              animation: 'slide_from_bottom',
              sheetAllowedDetents: [1],
              sheetGrabberVisible: true,
              sheetCornerRadius: radius.sheet,
            }}
          />
          <Stack.Screen
            name="science"
            options={{
              presentation: 'formSheet',
              animation: 'slide_from_bottom',
              sheetAllowedDetents: [1],
              sheetGrabberVisible: true,
              sheetCornerRadius: radius.sheet,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  degraded: {
    alignItems: 'center',
    backgroundColor: surface.base,
    flex: 1,
    gap: space.xl,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  degradedTitle: {
    textAlign: 'center',
  },
});
