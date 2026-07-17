import { describe, it, expect } from 'vitest';
import {
  shouldTriggerFlyTo,
  getTacticalMapConfig,
  calculateEntityFlightParams
} from './tacticalMapMovementController';

describe('Tactical Map Movement & Performance Controller (TDD)', () => {
  it('suppresses flyTo animations when viewport changes are user-initiated (pan/zoom)', () => {
    const prevViewport = { longitude: 77.5946, latitude: 12.9716, zoom: 12 };
    const newViewport = { longitude: 77.6000, latitude: 12.9800, zoom: 13 };
    
    // When user drags/zooms map manually, should NOT trigger flyTo rubber-banding loop
    const result = shouldTriggerFlyTo(prevViewport, newViewport, { userInitiated: true });
    expect(result.shouldFly).toBe(false);
  });

  it('triggers smooth lightweight flyTo when programmatic entity targeting occurs', () => {
    const targetEntityLocation = { longitude: 77.6100, latitude: 12.9300 };
    
    const result = calculateEntityFlightParams(targetEntityLocation);
    expect(result.center).toEqual([77.6100, 12.9300]);
    expect(result.zoom).toBe(14);
    expect(result.duration).toBe(700);
    expect(result.essential).toBe(true);
  });

  it('enforces lightweight 2D tactical map configuration for low-spec police hardware', () => {
    const config = getTacticalMapConfig();
    expect(config.dragRotate).toBe(false);
    expect(config.pitchWithRotate).toBe(false);
    expect(config.minZoom).toBe(9);
    expect(config.maxZoom).toBe(18);
  });
});
