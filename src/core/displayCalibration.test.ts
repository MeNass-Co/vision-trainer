import { describe, expect, it } from 'vitest';

import { buildDeviceCalibration } from './deviceCalibration';
import { DEFAULT_CALIBRATION, viewingDistanceReminder } from './displayCalibration';

describe('viewingDistanceReminder', () => {
  it('derives the intro copy from the device calibration distance', () => {
    const { viewingDistanceCm } = buildDeviceCalibration();

    expect(viewingDistanceCm).toBe(33);
    expect(viewingDistanceReminder(viewingDistanceCm)).toBe(
      "Hold your phone about 30 cm away (a short arm's length) — the distance your calibration assumes."
    );
  });

  it('rounds to the nearest 10 cm and adapts the reach hint for the fallback profile', () => {
    expect(viewingDistanceReminder(DEFAULT_CALIBRATION.viewingDistanceCm)).toBe(
      "Hold your phone about 60 cm away (an arm's length) — the distance your calibration assumes."
    );
    expect(viewingDistanceReminder(57)).toContain('about 60 cm');
    expect(viewingDistanceReminder(4)).toContain('about 10 cm');
  });
});
