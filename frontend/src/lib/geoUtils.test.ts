import { describe, it, expect } from 'vitest';
import { generateGeoJsonFromStats } from './geoUtils';

describe('generateGeoJsonFromStats', () => {
  it('converts raw backend stats array into a valid GeoJSON FeatureCollection', () => {
    const rawStats = [
      {
        latitude: 12.9716,
        longitude: 77.5946,
        GravityOffenceID: 1, // CRITICAL
        CaseMasterID: 101,
      },
      {
        latitude: 12.9352,
        longitude: 77.6245,
        GravityOffenceID: 2, // HIGH
        CaseMasterID: 102,
      },
      {
        latitude: 13.0,
        longitude: 77.6,
        GravityOffenceID: 3, // MEDIUM
        CaseMasterID: 103,
      },
      {
        // Should ignore items without coords
        GravityOffenceID: 1,
        CaseMasterID: 104,
      }
    ];

    const geoJson = generateGeoJsonFromStats(rawStats);

    expect(geoJson.type).toBe('FeatureCollection');
    expect(geoJson.features.length).toBe(3);

    const firstFeature = geoJson.features[0];
    expect(firstFeature.type).toBe('Feature');
    expect(firstFeature.geometry).toEqual({
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    });
    expect(firstFeature.properties?.threatLevel).toBe('CRITICAL');
    expect(firstFeature.properties?.id).toBe('CASE-101');
    expect(firstFeature.properties?.gravityId).toBe(1);

    const secondFeature = geoJson.features[1];
    expect(secondFeature.properties?.threatLevel).toBe('HIGH');
    
    const thirdFeature = geoJson.features[2];
    expect(thirdFeature.properties?.threatLevel).toBe('MEDIUM');
  });
});
