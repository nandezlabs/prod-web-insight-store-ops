/**
 * Geolocation Utilities
 */

import type { GeolocationCoordinates } from "@insight/shared-types";

/**
 * Get current position
 */
export function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Calculate distance between two coordinates (in meters)
 * Uses Haversine formula
 */
export function calculateDistance(
  coords1: GeolocationCoordinates,
  coords2: GeolocationCoordinates
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coords1.latitude * Math.PI) / 180;
  const φ2 = (coords2.latitude * Math.PI) / 180;
  const Δφ = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
  const Δλ = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if coordinates are within radius
 */
export function isWithinRadius(
  point: GeolocationCoordinates,
  center: GeolocationCoordinates,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(point, center);
  return distance <= radiusMeters;
}

/**
 * Format coordinates as string
 * @example "40.7128° N, 74.0060° W"
 */
export function formatCoordinates(coords: GeolocationCoordinates): string {
  const lat = Math.abs(coords.latitude);
  const lng = Math.abs(coords.longitude);
  const latDir = coords.latitude >= 0 ? "N" : "S";
  const lngDir = coords.longitude >= 0 ? "E" : "W";
  return `${lat.toFixed(4)}° ${latDir}, ${lng.toFixed(4)}° ${lngDir}`;
}

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

/**
 * Watch position changes
 */
export function watchPosition(
  callback: (coords: GeolocationCoordinates) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number | null {
  if (!navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    errorCallback,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

/**
 * Clear position watch
 */
export function clearWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
