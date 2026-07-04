import * as Localization from 'expo-localization';

import en from './locales/en';
import fr from './locales/fr';

/**
 * FRENCH ONLY for this pass (orchestrator arbitrage, native-revamp): the app
 * ships en + fr today. Adding a third language later means (1) drop a new
 * `src/i18n/locales/<code>/*.json` sibling set mirroring the English keys,
 * (2) register it in RESOURCES/SUPPORTED_LOCALES below. No call site changes.
 */
export type Locale = 'en' | 'fr';

const RESOURCES = { en, fr } as const;
const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'fr'];
const FALLBACK_LOCALE: Locale = 'en';

type Resources = typeof en;

// A "leaf" is a translatable value: a plain string, an ordered string list
// (e.g. week-day letters), or a plural map ({ one, other }). Anything else is
// a namespace to keep descending into.
type Leaf = string | readonly string[] | { one: string; other: string };

type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends Leaf
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${DotPaths<T[K]>}`
      : never;
}[keyof T & string];

/** Every valid translation key, derived from the English resource shape. */
export type TranslationKey = DotPaths<Resources>;

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

function detectLocale(): Locale {
  try {
    const preferred = Localization.getLocales();
    for (const entry of preferred) {
      const code = entry.languageCode?.toLowerCase();
      if (code && SUPPORTED_LOCALES.includes(code as Locale)) {
        return code as Locale;
      }
    }
  } catch {
    // Locale detection can fail outside a native runtime (tests, web SSR) —
    // fall back to English silently rather than crash.
  }
  return FALLBACK_LOCALE;
}

let currentLocale: Locale = detectLocale();

/** The active locale, resolved once from the device at module load. */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Test-only escape hatch. The app itself never switches locale at runtime —
 * there is no in-app language switcher by design (device locale governs it).
 */
export function __setLocaleForTests(locale: Locale): void {
  currentLocale = locale;
}

function resolvePath(resource: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, segment) => {
    if (node && typeof node === 'object' && segment in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, resource);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

function lookup(key: string): unknown {
  const localized = resolvePath(RESOURCES[currentLocale], key);
  if (localized !== undefined) return localized;
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn(`[i18n] Missing "${key}" for locale "${currentLocale}", falling back to English.`);
  }
  return resolvePath(RESOURCES[FALLBACK_LOCALE], key);
}

/** Translate a dot-path key against the current locale, interpolating {{params}}. */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const value = lookup(key);
  if (typeof value !== 'string') {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] "${key}" is not a plain string (got ${typeof value}). Use tList/tPlural.`);
    }
    return key;
  }
  return interpolate(value, params);
}

/** Translate a dot-path key whose value is an ordered string list (e.g. week-day letters). */
export function tList(key: TranslationKey): string[] {
  const value = lookup(key);
  if (!Array.isArray(value)) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] "${key}" is not a list (got ${typeof value}).`);
    }
    return [];
  }
  return value as string[];
}

/**
 * Translate a `{ one, other }` plural map at `key`, selecting the branch for
 * `count` (English collapses both branches to the same text in a few spots on
 * purpose — French genuinely needs the distinction, e.g. "jour" / "jours").
 */
export function tPlural(
  key: TranslationKey,
  count: number,
  params?: Record<string, string | number>
): string {
  const value = lookup(key);
  const branch =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as { one: string; other: string })[count === 1 ? 'one' : 'other']
      : undefined;
  if (typeof branch !== 'string') {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] "${key}" is not a { one, other } plural map.`);
    }
    return key;
  }
  return interpolate(branch, { count, ...params });
}
