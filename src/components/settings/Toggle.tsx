import { Host, Toggle as SwiftUIToggle } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  disabled as disabledModifier,
  tint,
} from '@expo/ui/swift-ui/modifiers';

import { ACCENT } from '@/theme/tokens';

export type ToggleProps = {
  accessibilityLabel?: string;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  value: boolean;
};

// THE GREAT NATIVE WAVE: a real UISwitch (via @expo/ui's SwiftUI Toggle) —
// the ~90 lines of hand-tuned reanimated track/knob geometry & springs this
// file used to carry are gone. Stock UISwitch's intrinsic size already
// matched our old hand-drawn geometry (51x31 track, 27pt knob — see the old
// spec comment this file used to carry), so `<Host matchContents>` lets the
// hosting view report that intrinsic size back into RN layout instead of an
// explicit frame. `tint` re-colors the "on" track to our accent, same as
// UISwitch's `onTintColor`.
export function Toggle({ accessibilityLabel, disabled = false, onChange, value }: ToggleProps) {
  const modifiers = [tint(ACCENT), disabledModifier(disabled)];
  if (accessibilityLabel) {
    modifiers.push(accessibilityLabelModifier(accessibilityLabel));
  }

  return (
    <Host matchContents testID={accessibilityLabel}>
      <SwiftUIToggle isOn={value} modifiers={modifiers} onIsOnChange={onChange} />
    </Host>
  );
}
