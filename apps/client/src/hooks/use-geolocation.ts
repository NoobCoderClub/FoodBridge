'use client';

import { useEffect, useState } from 'react';

interface GeolocationState {
  lat?: number;
  lng?: number;
  denied: boolean;
  loading: boolean;
}

function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    denied: !isGeolocationSupported(),
    loading: isGeolocationSupported(),
  });

  useEffect(() => {
    if (!isGeolocationSupported()) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          denied: false,
          loading: false,
        });
      },
      () => {
        setState({ denied: true, loading: false });
      },
      { timeout: 5000 },
    );
  }, []);

  return state;
}
