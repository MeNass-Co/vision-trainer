import { space } from '@/theme/tokens';

// THE GREAT NATIVE WAVE: the hand-drawn Liquid Glass tab bar this file used to
// render (GlassView pill, reanimated slide/pulse, SF Symbol glyphs) is retired
// in favor of `expo-router/unstable-native-tabs`' NativeTabs — see
// `src/app/(tabs)/_layout.tsx`. A real UITabBarController now owns the bar's
// material, glyphs, and scroll-under behavior; no JS component mounts here
// anymore.
//
// `TAB_BAR_CLEARANCE` survives because a handful of screens (Today's
// non-scrolling layout, Progress' empty state) render outside any ScrollView,
// so they never receive UIKit's automatic content-inset adjustment and must
// reserve manual bottom space above the floating native bar themselves — the
// same problem the old floating custom bar had. Recalibrated (2026-07) to the
// iOS 26 floating pill tab bar's own on-screen height + its gap above the
// safe area, measured off a native-tabs capture; consumers still add their
// own `insets.bottom` on top of this.
export const TAB_BAR_CLEARANCE = 60 + space.base;
