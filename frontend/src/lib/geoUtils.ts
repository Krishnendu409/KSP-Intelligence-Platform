export function generateGeoJsonFromStats(stats: any[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stats
      .filter(stat => stat.latitude !== undefined && stat.longitude !== undefined)
      .map(stat => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [stat.longitude, stat.latitude]
        },
        properties: {
          id: `CASE-${stat.CaseMasterID}`,
          threatLevel: stat.GravityOffenceID === 1 ? 'CRITICAL' : stat.GravityOffenceID === 2 ? 'HIGH' : 'MEDIUM',
          gravityId: stat.GravityOffenceID,
          date: stat.CrimeRegisteredDate
        }
      }))
  };
}
