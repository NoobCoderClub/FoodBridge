'use client';

import { useCallback, useEffect, useState } from 'react';

/** Why the last fix failed. `null` means nothing has gone wrong. */
type GeolocationFailure = 'denied' | 'unavailable';

interface GeolocationState {
  lat?: number;
  lng?: number;
  /** Radius of 68% confidence, in metres, as reported by the device. */
  accuracy?: number;
  failure: GeolocationFailure | null;
  loading: boolean;
}

type Coords = { lat: number; lng: number; accuracy: number };

interface UseGeolocationOptions {
  immediate?: boolean;
  /**
   * Engages the GPS chip instead of answering from WiFi/cell/IP triangulation.
   * Off by default: the browse feed only needs a rough position to sort by
   * distance, and a GPS warm-up on mount costs battery and delays the feed.
   * The listing form opts in — a pickup point has to be exact.
   */
  enableHighAccuracy?: boolean;
}

function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
}

/**
 * A high-accuracy request needs a longer timeout than a coarse one — a cold
 * GPS fix routinely takes more than five seconds, so the old 5s ceiling would
 * abort the request before the chip ever reported. `maximumAge: 0` refuses a
 * cached position, which is what makes pressing the button a second time
 * actually re-measure rather than replay the same coarse fix.
 */
function positionOptions(enableHighAccuracy: boolean): PositionOptions {
  return enableHighAccuracy
    ? { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    : { timeout: 5000 };
}

/**
 * A blocked permission is worth telling the user how to fix; a timeout or an
 * unavailable position is not their doing and the advice would be wrong.
 */
function failureFor(error: GeolocationPositionError): GeolocationFailure {
  return error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable';
}

/**
 * `immediate` (the default) locates on mount — that's what the browse feed
 * wants. The listing form passes `false` so nothing is requested until the
 * poster actually presses "Use my current location".
 *
 * State is only ever written from the geolocation callbacks, never
 * synchronously inside the effect: the effect subscribes to an external system
 * and lets its callbacks push results back, which is the pattern React expects.
 */
export function useGeolocation({
  immediate = true,
  enableHighAccuracy = false,
}: UseGeolocationOptions = {}) {
  // `navigator` doesn't exist during SSR, so support can only be determined
  // client-side. The initial state must be a `navigator`-independent literal
  // — identical on the server and on the client's first render — or React
  // hydration sees two different states for the same paint and mismatches.
  const [state, setState] = useState<GeolocationState>({
    failure: null,
    loading: immediate,
  });

  useEffect(() => {
    if (!immediate) return;

    let cancelled = false;

    // Effects never run during SSR and only run after the client's first
    // paint, so this is the correct — and only safe — place to feature-detect.
    // Deferred to a microtask rather than called synchronously here: state is
    // only ever written from a callback (see above), never straight out of
    // the effect body, so this stays consistent with the branch below.
    if (!isGeolocationSupported()) {
      queueMicrotask(() => {
        if (!cancelled) setState({ failure: 'unavailable', loading: false });
      });
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          failure: null,
          loading: false,
        });
      },
      (error) => {
        if (!cancelled) setState({ failure: failureFor(error), loading: false });
      },
      positionOptions(enableHighAccuracy),
    );

    return () => {
      cancelled = true;
    };
  }, [immediate, enableHighAccuracy]);

  /**
   * Manual trigger, for event handlers only. `onLocated` lets the caller react
   * to a fix without mirroring coordinates into its own state via an effect.
   */
  const request = useCallback(
    (onLocated?: (coords: Coords) => void) => {
      if (!isGeolocationSupported()) {
        setState({ failure: 'unavailable', loading: false });
        return;
      }

      setState((prev) => ({ ...prev, loading: true }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setState({ ...coords, failure: null, loading: false });
          onLocated?.(coords);
        },
        (error) => setState({ failure: failureFor(error), loading: false }),
        positionOptions(enableHighAccuracy),
      );
    },
    [enableHighAccuracy],
  );

  // Unused by any current consumer's JSX, so a value that differs between
  // SSR and the client's first render never reaches the DOM and can't cause
  // a hydration mismatch. If a future caller renders this conditionally,
  // move the check into the effect instead of reading it here.
  return {
    ...state,
    denied: state.failure !== null,
    supported: isGeolocationSupported(),
    request,
  };
}
