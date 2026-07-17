export interface ViewportCoords {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface FlightTriggerOptions {
  userInitiated?: boolean;
}

export function shouldTriggerFlyTo(
  _prevViewport: ViewportCoords,
  _newViewport: ViewportCoords,
  options: FlightTriggerOptions = {}
): { shouldFly: boolean } {
  if (options.userInitiated) {
    return { shouldFly: false };
  }
  return { shouldFly: true };
}

export function calculateEntityFlightParams(location: { longitude: number; latitude: number }) {
  return {
    center: [location.longitude, location.latitude] as [number, number],
    zoom: 14,
    duration: 700,
    essential: true,
  };
}

export function getTacticalMapConfig() {
  return {
    dragRotate: false,
    pitchWithRotate: false,
    minZoom: 9,
    maxZoom: 18,
  };
}
