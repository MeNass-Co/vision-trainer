import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

import { luminanceToLinearGray } from '@/core/displayCalibration';
import {
  computeEnvelopeStops,
  computeGaborGeometry,
  computeStripeStops,
  MIN_CYCLE_PX,
} from '@/core/gaborStops';
import type { CalibrationProfile, GaborStimulus } from '@/types';

export type GaborCanvasHandle = {
  present: (stimulus: GaborStimulus) => Promise<{ onset: number; offset: number }>;
  clear: () => void;
};

type GaborCanvasProps = {
  calibration: CalibrationProfile;
  onReadyChange?: (ready: boolean) => void;
};

// Independent of the stimulus: the occluder alphas only depend on r/σ.
const ENVELOPE_STOPS = computeEnvelopeStops();
const now = () => (globalThis.performance?.now?.() ?? Date.now());

function grayColor(luminanceCdM2: number, calibration: CalibrationProfile) {
  const gray = Math.round(luminanceToLinearGray(luminanceCdM2, calibration) * 255);
  const channel = Math.max(0, Math.min(255, gray)).toString(16).padStart(2, '0');

  return `#${channel}${channel}${channel}`;
}

function orientationVector(orientationDeg: number) {
  const radians = (orientationDeg * Math.PI) / 180;
  const dx = Math.cos(radians) * 0.5;
  const dy = Math.sin(radians) * 0.5;

  return {
    x1: 0.5 - dx,
    y1: 0.5 - dy,
    x2: 0.5 + dx,
    y2: 0.5 + dy,
  };
}

/**
 * Calibrated rendering plan for one stimulus. Geometry (patch size, cycle
 * count) comes from the calibration profile — see gaborStops.ts for the
 * deg → physical px → dp unit chain. The stripe stops carry the
 * gamma-symmetric sinusoid; the envelope occluder shapes it into a Gaussian.
 */
function useGaborRendering(stimulus: GaborStimulus | null, calibration: CalibrationProfile) {
  return useMemo(() => {
    if (!stimulus) {
      return null;
    }

    const geometry = computeGaborGeometry(
      calibration,
      stimulus.spatialFrequencyCpd,
      stimulus.gaborSizeDeg
    );
    const stripeStops = computeStripeStops({
      cyclesAcrossPatch: geometry.cyclesAcrossPatch,
      contrast: stimulus.contrast,
      phaseRad: stimulus.phaseRad,
      backgroundLuminanceCdM2: stimulus.backgroundLuminanceCdM2,
      gamma: calibration.gamma,
    });

    return { geometry, stripeStops, vector: orientationVector(stimulus.orientationDeg) };
  }, [calibration, stimulus]);
}

export const GaborCanvas = forwardRef<GaborCanvasHandle, GaborCanvasProps>(
  ({ calibration, onReadyChange }, ref) => {
    const rawId = useId().replace(/:/g, '');
    const stripeId = `gabor-stripes-${rawId}`;
    const windowId = `gabor-window-${rawId}`;
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingPresentRef = useRef<{
      onset: number;
      resolve: (result: { onset: number; offset: number }) => void;
    } | null>(null);
    const mountedRef = useRef(false);
    const onReadyChangeRef = useRef(onReadyChange);
    const [stimulus, setStimulus] = useState<GaborStimulus | null>(null);
    const rendering = useGaborRendering(stimulus, calibration);
    const backgroundColor = grayColor(calibration.backgroundLuminanceCdM2, calibration);

    useEffect(() => {
      onReadyChangeRef.current = onReadyChange;
    });

    useEffect(() => {
      if (stimulus && rendering?.geometry.cycleWidthClamped) {
        console.warn(
          `[GaborCanvas] ${stimulus.spatialFrequencyCpd} cpd is unresolvable on this display ` +
            `(cycle < ${MIN_CYCLE_PX} device px); cycle width clamped — the presented frequency ` +
            'is coarser than the nominal condition.'
        );
      }
    }, [rendering, stimulus]);

    // A present() cleared mid-flight must still settle, or its awaiting caller
    // parks forever: resolve the pending promise with the clear moment as offset.
    const settlePendingPresent = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const pending = pendingPresentRef.current;
      pendingPresentRef.current = null;
      pending?.resolve({ onset: pending.onset, offset: now() });
    }, []);

    useEffect(() => {
      mountedRef.current = true;
      onReadyChangeRef.current?.(true);

      return () => {
        mountedRef.current = false;
        settlePendingPresent();
        onReadyChangeRef.current?.(false);
      };
    }, [settlePendingPresent]);

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          settlePendingPresent();
          setStimulus(null);
        },
        present: (nextStimulus) =>
          new Promise((resolve) => {
            settlePendingPresent();
            const onset = now();
            pendingPresentRef.current = { onset, resolve };
            setStimulus(nextStimulus);
            timeoutRef.current = setTimeout(() => {
              const offset = now();

              timeoutRef.current = null;
              pendingPresentRef.current = null;
              if (mountedRef.current) {
                setStimulus(null);
              }
              resolve({ onset, offset });
            }, Math.max(0, nextStimulus.durationMs));
          }),
      }),
      [settlePendingPresent]
    );

    const size = rendering?.geometry.diameterDp ?? 0;
    const center = size / 2;

    return (
      <View style={[styles.container, { backgroundColor }]}>
        {rendering ? (
          <Svg height={size} width={size}>
            <Defs>
              <LinearGradient id={stripeId} {...rendering.vector}>
                {rendering.stripeStops.map((stop, index) => (
                  <Stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity={1} />
                ))}
              </LinearGradient>
              <RadialGradient cx="50%" cy="50%" id={windowId} r="50%">
                {ENVELOPE_STOPS.map((stop, index) => (
                  <Stop
                    key={index}
                    offset={stop.offset}
                    stopColor={backgroundColor}
                    stopOpacity={stop.opacity}
                  />
                ))}
              </RadialGradient>
            </Defs>
            <Circle cx={center} cy={center} fill={`url(#${stripeId})`} r={center} />
            <Circle cx={center} cy={center} fill={`url(#${windowId})`} r={center} />
          </Svg>
        ) : null}
      </View>
    );
  }
);

GaborCanvas.displayName = 'GaborCanvas';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
