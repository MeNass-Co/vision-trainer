import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { t } from '@/i18n';
import { ACCENT_CORE } from '@/theme/tokens';

// THE GREAT NATIVE WAVE: the hand-drawn Liquid Glass tab bar (CustomTabBar,
// GlassView + reanimated pill) is retired in favor of a real UITabBar via
// expo-router's NativeTabs. iOS 26 gives this its own genuine glass material,
// automatic scroll-under, and the minimize-on-scroll behavior for free — the
// custom component could only ever approximate those. `TAB_BAR_CLEARANCE` is
// still exported from CustomTabBar.tsx for the few screens that reserve
// bottom space above the bar; CustomTabBar itself is no longer mounted.
export function TabsLayout() {
  return (
    <NativeTabs tintColor={ACCENT_CORE}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('common.tabs.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>{t('common.tabs.progress')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t('common.tabs.settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default TabsLayout;
