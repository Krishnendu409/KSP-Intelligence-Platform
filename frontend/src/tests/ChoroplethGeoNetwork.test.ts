import { describe, it, expect } from 'vitest';
import { 
  getBengaluruChoroplethDistricts,
  getGeoNetworkArcs,
  getDistrictDensityColor
} from '../lib/choroplethGeoNetwork';

describe('Choropleth GIS Map & On-Map Geo-Network Links', () => {
  it('returns Bengaluru police districts with crime counts and density styling', () => {
    const districts = getBengaluruChoroplethDistricts();
    expect(districts.length).toBeGreaterThanOrEqual(6); // Central, East, South, Whitefield, North, West
    expect(districts[0].properties.districtName).toBeDefined();
    expect(typeof districts[0].properties.crimeCount).toBe('number');
    expect(districts[0].properties.colorHex).toMatch(/^rgba\(/);
  });

  it('computes color scale correctly for density tiers', () => {
    expect(getDistrictDensityColor(5)).toContain('rgba(16, 185, 129'); // Low green
    expect(getDistrictDensityColor(18)).toContain('rgba(245, 158, 11'); // Moderate amber
    expect(getDistrictDensityColor(35)).toContain('rgba(239, 68, 68'); // High red
  });

  it('returns geospatial network links connecting safehouses, crime scenes, and towers', () => {
    const arcs = getGeoNetworkArcs();
    expect(arcs.length).toBeGreaterThanOrEqual(4);
    expect(arcs[0].sourceLat).toBeGreaterThan(12.8);
    expect(arcs[0].targetLat).toBeGreaterThan(12.8);
    expect(arcs[0].relationshipType).toBeDefined();
  });
});
