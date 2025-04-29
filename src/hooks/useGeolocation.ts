
import { useState, useEffect } from 'react';

interface GeolocationState {
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  error: string | null;
  timestamp: number | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    heading: null,
    speed: null,
    accuracy: null,
    error: null,
    timestamp: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prevState => ({
        ...prevState,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        heading: position.coords.heading || null,
        speed: position.coords.speed || null,
        accuracy: position.coords.accuracy || null,
        error: null,
        timestamp: position.timestamp,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState(prevState => ({
        ...prevState,
        error: error.message,
      }));
    };

    const geo = navigator.geolocation;
    const geoOptions = {
      enableHighAccuracy: options.enableHighAccuracy || true,
      timeout: options.timeout || 5000,
      maximumAge: options.maximumAge || 0,
    };

    let watcher: number | null = null;

    if (options.watchPosition) {
      watcher = geo.watchPosition(onSuccess, onError, geoOptions);
    } else {
      geo.getCurrentPosition(onSuccess, onError, geoOptions);
    }

    // Clean up
    return () => {
      if (watcher !== null) {
        geo.clearWatch(watcher);
      }
    };
  }, [options.enableHighAccuracy, options.maximumAge, options.timeout, options.watchPosition]);

  return state;
};
