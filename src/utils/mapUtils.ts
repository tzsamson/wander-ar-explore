
/**
 * Utility functions for handling map operations
 */

// Calculate distance between two coordinates in meters
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // Distance in meters
};

// Calculate bearing between two points in degrees
export const calculateBearing = (
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number
): number => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const bearing = Math.atan2(y, x);

  return ((bearing * 180) / Math.PI + 360) % 360; // Convert to degrees and normalize
};

// Format a distance in meters to a human-readable format
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

// Convert device orientation to camera heading
export const getHeadingFromDeviceOrientation = (
  alpha: number | null,
  beta: number | null,
  gamma: number | null
): number | null => {
  if (alpha === null) return null;
  
  // Simple implementation - in real app would use more complex calculations
  // that account for device orientation and position
  return alpha;
};

// Determine if a point is in view based on heading and field of view
export const isPointInView = (
  userHeading: number,
  pointBearing: number,
  fieldOfView = 50
): boolean => {
  const diff = Math.abs((userHeading - pointBearing + 360) % 360);
  return diff < fieldOfView / 2 || diff > 360 - fieldOfView / 2;
};

// Calculate position for AR element based on bearing and distance
export const calculateArPosition = (
  bearing: number,
  userHeading: number,
  distance: number
): { x: number; y: number; scale: number } => {
  // Normalize compass values
  const normalizedBearing = (bearing - userHeading + 360) % 360;
  
  // Convert to screen position (centered, with 180 degrees = full screen width)
  const screenPosX = ((normalizedBearing > 180 ? normalizedBearing - 360 : normalizedBearing) / 60);
  
  // Scale based on distance - closer objects appear larger
  const scale = Math.max(0.5, Math.min(1.5, 150 / Math.max(distance, 10)));
  
  // Y position can be based on distance or fixed
  const y = -0.2; // Slight offset from center
  
  return {
    x: screenPosX,
    y: y,
    scale: scale
  };
};

// Google Maps URL
export const getGoogleMapsDirectionsUrl = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): string => {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=walking`;
};
