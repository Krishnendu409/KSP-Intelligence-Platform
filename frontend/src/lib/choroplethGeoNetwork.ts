export interface ChoroplethDistrictPolygon {
  id: string;
  type: 'Feature';
  properties: {
    districtCode: string;
    districtName: string;
    policeStations: string[];
    crimeCount: number;
    heinousCount: number;
    narcoticsCount: number;
    cyberCount: number;
    colorHex: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeoNetworkArc {
  id: string;
  sourceLabel: string;
  targetLabel: string;
  sourceLat: number;
  sourceLng: number;
  targetLat: number;
  targetLng: number;
  relationshipType: 'HAWALA_FINANCIAL' | 'ENCRYPTED_COMMS' | 'CO_ACCUSED_LINK' | 'WEAPON_TRANSIT';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export function getDistrictDensityColor(crimeCount: number): string {
  if (crimeCount >= 20) {
    return 'rgba(239, 68, 68, 0.65)'; // High / Heinous Red
  }
  if (crimeCount >= 12) {
    return 'rgba(245, 158, 11, 0.45)'; // Moderate Amber
  }
  return 'rgba(16, 185, 129, 0.35)'; // Low Emerald Green
}

const BENGALURU_DISTRICT_POLYGONS: ChoroplethDistrictPolygon[] = [
  {
    id: 'dist-east-indiranagar',
    type: 'Feature',
    properties: {
      districtCode: 'DIST-0443',
      districtName: 'Bengaluru East Division (Indiranagar / MG Road Zone)',
      policeStations: ['Indiranagar PS', 'MG Road PS', 'JB Nagar PS', 'Halasuru PS'],
      crimeCount: 38,
      heinousCount: 14,
      narcoticsCount: 12,
      cyberCount: 12,
      colorHex: getDistrictDensityColor(38)
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.620, 12.990],
        [77.665, 12.990],
        [77.665, 12.960],
        [77.620, 12.960],
        [77.620, 12.990]
      ]]
    }
  },
  {
    id: 'dist-south-koramangala',
    type: 'Feature',
    properties: {
      districtCode: 'DIST-0445',
      districtName: 'Bengaluru South East Division (Koramangala / HSR Zone)',
      policeStations: ['Koramangala PS', 'HSR Layout PS', 'Madiwala PS'],
      crimeCount: 34,
      heinousCount: 16,
      narcoticsCount: 10,
      cyberCount: 8,
      colorHex: getDistrictDensityColor(34)
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.610, 12.955],
        [77.655, 12.955],
        [77.655, 12.910],
        [77.610, 12.910],
        [77.610, 12.955]
      ]]
    }
  },
  {
    id: 'dist-whitefield',
    type: 'Feature',
    properties: {
      districtCode: 'DIST-0448',
      districtName: 'Whitefield Division (EPIP / Marathahalli Zone)',
      policeStations: ['Whitefield PS', 'Marathahalli PS', 'KR Puram PS'],
      crimeCount: 22,
      heinousCount: 8,
      narcoticsCount: 8,
      cyberCount: 6,
      colorHex: getDistrictDensityColor(22)
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.685, 13.000],
        [77.770, 13.000],
        [77.770, 12.945],
        [77.685, 12.945],
        [77.685, 13.000]
      ]]
    }
  },
  {
    id: 'dist-central',
    type: 'Feature',
    properties: {
      districtCode: 'DIST-0441',
      districtName: 'Bengaluru Central Division (Vidhana Soudha / Cubbon Park)',
      policeStations: ['Cubbon Park PS', 'Vidhana Soudha PS', 'Ulsoor Gate PS'],
      crimeCount: 12,
      heinousCount: 2,
      narcoticsCount: 4,
      cyberCount: 6,
      colorHex: getDistrictDensityColor(12)
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.585, 12.990],
        [77.618, 12.990],
        [77.618, 12.960],
        [77.585, 12.960],
        [77.585, 12.990]
      ]]
    }
  },
  {
    id: 'dist-north-malleshwaram',
    type: 'Feature',
    properties: {
      districtCode: 'DIST-0442',
      districtName: 'Bengaluru North Division (Malleshwaram / Yeshwanthpur)',
      policeStations: ['Malleshwaram PS', 'Yeshwanthpur PS', 'Sadashivanagar PS'],
      crimeCount: 18,
      heinousCount: 6,
      narcoticsCount: 6,
      cyberCount: 6,
      colorHex: getDistrictDensityColor(18)
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.550, 13.025],
        [77.585, 13.025],
        [77.585, 12.990],
        [77.550, 12.990],
        [77.550, 13.025]
      ]]
    }
  },
  {
    id: 'dist-west',
    type: 'Feature',
    properties: {
      districtCode: 'DIST-0444',
      districtName: 'Bengaluru West Division (Vijayanagar / Rajajinagar)',
      policeStations: ['Vijayanagar PS', 'Rajajinagar PS', 'Basaveshwaranagar PS'],
      crimeCount: 8,
      heinousCount: 2,
      narcoticsCount: 2,
      cyberCount: 4,
      colorHex: getDistrictDensityColor(8)
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.520, 12.990],
        [77.550, 12.990],
        [77.550, 12.955],
        [77.520, 12.955],
        [77.520, 12.990]
      ]]
    }
  }
];

const GEO_NETWORK_ARCS: GeoNetworkArc[] = [
  {
    id: 'arc-hawala-indiranagar-dubai',
    sourceLabel: 'Indiranagar Contraband Safehouse (12.9784, 77.6408)',
    targetLabel: 'Koramangala Hawala Ledger Drop (12.9352, 77.6245)',
    sourceLat: 12.9784,
    sourceLng: 77.6408,
    targetLat: 12.9352,
    targetLng: 77.6245,
    relationshipType: 'HAWALA_FINANCIAL',
    severity: 'CRITICAL'
  },
  {
    id: 'arc-cyber-mgroad-koramangala',
    sourceLabel: 'MG Road Crypto Phishing Server (12.9756, 77.6066)',
    targetLabel: 'Koramangala Mule Account Operator (12.9352, 77.6245)',
    sourceLat: 12.9756,
    sourceLng: 77.6066,
    targetLat: 12.9352,
    targetLng: 77.6245,
    relationshipType: 'ENCRYPTED_COMMS',
    severity: 'HIGH'
  },
  {
    id: 'arc-arms-whitefield-indiranagar',
    sourceLabel: 'Whitefield EPIP Godown Cache (12.9855, 77.7285)',
    targetLabel: 'Indiranagar Enforcement Cell (12.9784, 77.6408)',
    sourceLat: 12.9855,
    sourceLng: 77.7285,
    targetLat: 12.9784,
    targetLng: 77.6408,
    relationshipType: 'WEAPON_TRANSIT',
    severity: 'CRITICAL'
  },
  {
    id: 'arc-cyber-ecity-hsr',
    sourceLabel: 'Electronic City Phishing Hub (12.8452, 77.6602)',
    targetLabel: 'HSR Layout Sector 2 Penthouse (12.9121, 77.6446)',
    sourceLat: 12.8452,
    sourceLng: 77.6602,
    targetLat: 12.9121,
    targetLng: 77.6446,
    relationshipType: 'CO_ACCUSED_LINK',
    severity: 'MODERATE'
  }
];

export function getBengaluruChoroplethDistricts(): ChoroplethDistrictPolygon[] {
  return BENGALURU_DISTRICT_POLYGONS;
}

export function calculateLiveChoropleth(firs: any[]): ChoroplethDistrictPolygon[] {
  // Deep copy polygons to avoid mutating the base array
  const updatedPolygons = JSON.parse(JSON.stringify(BENGALURU_DISTRICT_POLYGONS)) as ChoroplethDistrictPolygon[];
  
  updatedPolygons.forEach(district => {
    district.properties.crimeCount = 0;
    district.properties.heinousCount = 0;
    district.properties.narcoticsCount = 0;
    district.properties.cyberCount = 0;
  });

  firs.forEach(fir => {
    if (!fir.latitude || !fir.longitude) return;
    const pt = [fir.longitude, fir.latitude];
    
    // Find which district this FIR falls into using Ray-Casting
    const targetDistrict = updatedPolygons.find(dist => {
      const poly = dist.geometry.coordinates[0];
      let inside = false;
      const x = pt[0], y = pt[1];
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    });

    if (targetDistrict) {
      targetDistrict.properties.crimeCount++;
      // Basic mock heuristics to populate other categories based on FIR data
      if (targetDistrict.properties.crimeCount % 3 === 0) targetDistrict.properties.heinousCount++;
      if (targetDistrict.properties.crimeCount % 4 === 0) targetDistrict.properties.narcoticsCount++;
      if (targetDistrict.properties.crimeCount % 5 === 0) targetDistrict.properties.cyberCount++;
    }
  });

  updatedPolygons.forEach(district => {
    district.properties.colorHex = getDistrictDensityColor(district.properties.crimeCount);
  });

  return updatedPolygons;
}

export function getGeoNetworkArcs(): GeoNetworkArc[] {
  return GEO_NETWORK_ARCS;
}
