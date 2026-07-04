// Vitest runs outside the native runtime, so expo-localization's native
// module isn't available. Tests assert against the English source of truth
// (src/i18n never weakens to match a test — see src/i18n/index.ts's
// __setLocaleForTests), so defaulting to "en" here is the correct fixture.
export function getLocales(): Array<{ languageCode: string | null }> {
  return [{ languageCode: 'en' }];
}
