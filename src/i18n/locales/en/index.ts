import calibration from './calibration.json';
import common from './common.json';
import onboarding from './onboarding.json';
import paywall from './paywall.json';
import progress from './progress.json';
import science from './science.json';
import session from './session.json';
import settings from './settings.json';
import today from './today.json';

// English is the canonical resource shape: every other locale is typed
// against this object, so a missing French key is a compile-time error
// (see src/i18n/index.ts's DotPaths<Resources> where Resources = typeof en).
export default {
  calibration,
  common,
  onboarding,
  paywall,
  progress,
  science,
  session,
  settings,
  today,
} as const;
