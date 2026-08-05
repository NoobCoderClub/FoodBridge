'use client';

import { useCallback, useEffect, useState } from 'react';

interface GeolocationState {
  lat?: number;
  lng?: number;
  denied: boolean;
  loading: boolean;
}

type Coords = { lat: number; lng: number };

function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
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
export function useGeolocation({ immediate = true }: { immediate?: boolean } = {}) {
  const supported = isGeolocationSupported();
  const [state, setState] = useState<GeolocationState>({
    denied: !supported,
    loading: immediate && supported,
  });

  useEffect(() => {
    if (!immediate || !isGeolocationSupported()) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          denied: false,
          loading: false,
        });
      },
      () => {
        if (!cancelled) setState({ denied: true, loading: false });
      },
      { timeout: 5000 },
    );

    return () => {
      cancelled = true;
    };
  }, [immediate]);

  /**
   * Manual trigger, for event handlers only. `onLocated` lets the caller react
   * to a fix without mirroring coordinates into its own state via an effect.
   */
  const request = useCallback((onLocated?: (coords: Coords) => void) => {
    if (!isGeolocationSupported()) {
      setState({ denied: true, loading: false });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setState({ ...coords, denied: false, loading: false });
        onLocated?.(coords);
      },
      () => setState({ denied: true, loading: false }),
      { timeout: 5000 },
    );
  }, []);

  return { ...state, supported, request };
}
