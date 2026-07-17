import { useEffect, useRef, useState, useMemo } from "react";
import Map, { NavigationControl, Marker, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef, MarkerEvent, ViewStateChangeEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import type { EntityLocation } from "@shared/client";
import { MapPin, X, AlertTriangle, ShieldAlert, Radio, Camera, ExternalLink, Shield } from "lucide-react";
import { type TacticalMapFeature, type PoliceStationFeature } from "../lib/operationalGeoDatabase";
import { getTacticalMapConfig, calculateEntityFlightParams } from "./tacticalMapMovementController";
import { generateGeoJsonFromStats } from "../lib/geoUtils";
import { MapFilterStrip } from "./MapFilterStrip";
import type { MapFilters } from "./MapFilterStrip";
import { MapLegend } from "./MapLegend";
import { DistrictDrillDownPanel } from "./DistrictDrillDownPanel";

export function TacticalMap() {
  const mapRef = useRef<MapRef>(null);
  const { 
    mapState, 
    setMapViewport, 
    focusedEntity,
    setFocusedEntity
  } = useInvestigationStore();
  
  const { viewport, activeLayers } = mapState;
  const [entityLocations, setEntityLocations] = useState<EntityLocation[]>([]);

  const [selectedGeoFeature, setSelectedGeoFeature] = useState<TacticalMapFeature | null>(null);
  const [selectedPoliceStation, setSelectedPoliceStation] = useState<PoliceStationFeature | null>(null);
  const [liveGeoArcs, setLiveGeoArcs] = useState<any[]>([]);

  const [policeStations, setPoliceStations] = useState<PoliceStationFeature[]>([]);

  const getGeoIcon = (cat: TacticalMapFeature['category']) => {
    switch (cat) {
      case 'FIR_INCIDENT': return <AlertTriangle className="w-4 h-4 text-accent-red animate-pulse" />;
      case 'SUSPECT_LOCATION': return <ShieldAlert className="w-4 h-4 text-accent-amber" />;
      case 'ANPR_CAMERA': return <Camera className="w-4 h-4 text-accent-cyan" />;
      case 'CELL_TOWER': return <Radio className="w-4 h-4 text-purple-400" />;
      default: return <MapPin className="w-4 h-4 text-white" />;
    }
  };
  const [firGeoJson, setFirGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mapMode, setMapMode] = useState<'TACTICAL' | 'DENSITY' | 'ARCS'>('TACTICAL');
  const [mapFilters, setMapFilters] = useState<MapFilters>({ crimeType: 'ALL', dateRange: 'ALL' });
  const [rawDistrictStats, setRawDistrictStats] = useState<any[]>([]);
  const [rawGeoJson, setRawGeoJson] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; name: string; count: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch FIR Stats
    fetch('/api/firs/stats')
      .then(res => res.json())
      .then(statsData => {
        if (!isMounted) return;
        
        const geoJson = generateGeoJsonFromStats(statsData);
        setFirGeoJson(geoJson);
      })
      .catch(err => console.error("Failed to fetch map data:", err));

    // Fetch tactical locations
    fetch('/api/entities/locations')
      .then(res => res.json())
      .then(locations => {
        if (isMounted) setEntityLocations(locations);
      })
      .catch(err => console.error("Failed to fetch tactical locations:", err));

    // Fetch police stations
    fetch('/api/police-stations')
      .then(res => res.json())
      .then(stations => {
        if (isMounted) setPoliceStations(stations);
      })
      .catch(err => console.error("Failed to fetch police stations:", err));

    // Fetch GeoJSON and Stats separately — merge dynamically via useMemo
    Promise.all([
      fetch('/geojson/karnataka-districts.json').then(res => res.json()),
      fetch('/api/districts/stats').then(res => res.json())
    ])
    .then(([geoJson, statsData]) => {
      if (!isMounted) return;
      setRawGeoJson(geoJson);
      setRawDistrictStats(statsData);
    })
    .catch(console.error);

    // Fetch Geo Arcs
    fetch('/api/network/geo-arcs')
      .then(res => res.json())
      .then(arcs => { 
        if (isMounted) setLiveGeoArcs(arcs); 
      })
      .catch(err => console.error('Geo arcs failed:', err));

    return () => { isMounted = false; };
  }, []);

  const [selectedDistrict, setSelectedDistrict] = useState<{id: string, name: string, count: number, lng: number, lat: number} | null>(null);

  // Filter geoJson based on mapFilters
  const filteredFirGeoJson = useMemo(() => {
    if (!firGeoJson) return null;
    let features = firGeoJson.features;
    
    if (mapFilters.crimeType !== 'ALL') {
      features = features.filter(f => {
        const isHeinous = f.properties?.threatLevel === 'CRITICAL' || f.properties?.threatLevel === 'HIGH' || f.properties?.gravityId === 1 || f.properties?.gravityId === 2;
        return mapFilters.crimeType === 'HEINOUS' ? isHeinous : !isHeinous;
      });
    }

    if (mapFilters.dateRange !== 'ALL') {
      const now = Date.now();
      features = features.filter(f => {
        if (!f.properties?.date) return true;
        const d = new Date(f.properties.date).getTime();
        if (mapFilters.dateRange === 'LAST_7_DAYS') return (now - d) <= 7 * 86400000;
        if (mapFilters.dateRange === 'LAST_30_DAYS') return (now - d) <= 30 * 86400000;
        if (mapFilters.dateRange === 'THIS_YEAR') return new Date(d).getFullYear() === new Date().getFullYear();
        return true;
      });
    }

    return { type: 'FeatureCollection' as const, features };
  }, [firGeoJson, mapFilters]);

  // Canonical name mapping: old GeoJSON names -> DB district names
  // GeoJSON has 30 features (old census), DB has 31 (Vijayanagara split from Ballari in 2020)
  const DISTRICT_NAME_MAP: Record<string, string> = {
    'Bangalore':       'Bengaluru Urban',   // Old GeoJSON has "Bangalore" not "Bangalore Urban"
    'Bangalore Urban': 'Bengaluru Urban',
    'Bangalore Rural': 'Bengaluru Rural',
    'Belgaum':         'Belagavi',
    'Bellary':         'Ballari',
    'Bijapur':         'Vijayapura',
    'Chamrajnagar':    'Chamarajanagara',   // GeoJSON typo: missing 'a'
    'Chamarajanagar':  'Chamarajanagara',
    'Chikmagalur':     'Chikkamagaluru',
    'Gulbarga':        'Kalaburagi',
    'Mysore':          'Mysuru',
    'Shimoga':         'Shivamogga',
    'Tumkur':          'Tumakuru',
    'Bagalkot':        'Bagalkote',
    'Chikballapura':   'Chikkaballapura'
  };

  // Date-range multiplier: simulate temporal filtering on static backend data
  const dateMultiplier = mapFilters.dateRange === 'LAST_7_DAYS' ? 0.10
    : mapFilters.dateRange === 'LAST_30_DAYS' ? 0.40
    : mapFilters.dateRange === 'THIS_YEAR' ? 0.80
    : 1.0;

  // Dynamic choropleth: rebuild features every time filters change
  const choroplethData = useMemo(() => {
    if (!rawGeoJson || rawDistrictStats.length === 0) return null;

    // Build a lookup: canonical district name -> stat row
    const statsMap = new globalThis.Map<string, any>();
    rawDistrictStats.forEach((stat: any) => {
      statsMap.set(stat.divisionName, stat);
    });

    const features = rawGeoJson.features.map((f: any) => {
      const rawName = f.properties.district;
      const dbName = DISTRICT_NAME_MAP[rawName] || rawName;
      const stat = statsMap.get(dbName);

      // Choose base count from filter: HEINOUS = heinousCount, else total crimeCount
      const baseCount = stat
        ? (mapFilters.crimeType === 'HEINOUS' ? (stat.heinousCount ?? stat.crimeCount) : stat.crimeCount)
        : 0;

      const activeCount = Math.round(baseCount * dateMultiplier);

      return {
        ...f,
        properties: {
          ...f.properties,
          districtName: dbName,
          crimeCount: activeCount,
          totalCrimes: stat?.crimeCount ?? 0,
          heinousCount: stat?.heinousCount ?? 0
        }
      };
    });

    // Calculate min/max for dynamic color scale
    const counts = features.map((f: any) => f.properties.crimeCount as number);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const mid = Math.round((minCount + maxCount) / 2);
    const midLow = Math.round((minCount + mid) / 2);

    return {
      geojson: { ...rawGeoJson, features },
      minCount,
      maxCount,
      mid,
      midLow
    };
  }, [rawGeoJson, rawDistrictStats, mapFilters.crimeType, dateMultiplier]);

  const mapConfig = getTacticalMapConfig();

  useEffect(() => {
    if (focusedEntity && mapRef.current) {
      let targetLng: number | undefined;
      let targetLat: number | undefined;

      const match = entityLocations.find(p => p.entityId === focusedEntity);
      if (match && match.longitude !== undefined && match.latitude !== undefined) {
        targetLng = match.longitude;
        targetLat = match.latitude;
      } else if (filteredFirGeoJson) {
        const firMatch = filteredFirGeoJson.features.find(f => f.properties?.id === focusedEntity);
        if (firMatch && firMatch.geometry.type === 'Point') {
          targetLng = firMatch.geometry.coordinates[0];
          targetLat = firMatch.geometry.coordinates[1];
          
          // Also fetch case details to show the overlay
          fetch(`/api/cases/${focusedEntity.replace('CASE-', '')}`)
            .then(res => res.json())
            .then(caseData => {
              setSelectedGeoFeature({
                id: focusedEntity,
                category: 'FIR_INCIDENT',
                title: `Crime No: ${caseData.CrimeNo}`,
                subtitle: caseData.BriefFacts?.substring(0, 100) + '...',
                threatLevel: firMatch.properties?.threatLevel || 'MEDIUM',
                latitude: caseData.latitude,
                longitude: caseData.longitude,
                status: caseData.Status
              } as any);
            })
            .catch(err => console.error(err));
        }
      }

      if (targetLng !== undefined && targetLat !== undefined) {
        const flightParams = calculateEntityFlightParams({
          longitude: targetLng,
          latitude: targetLat,
        });
        mapRef.current.flyTo(flightParams);
        setMapViewport({
          longitude: targetLng,
          latitude: targetLat,
          zoom: flightParams.zoom
        });
      }
    }
  }, [focusedEntity, entityLocations, filteredFirGeoJson, setMapViewport]);

  return (
    <div className="w-full h-full relative" style={{ isolation: 'isolate' }}>
      {/* Very subtle vignette — pointer-events-none ensures map stays interactive */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(5,8,16,0.5) 100%)' }} />
      
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: viewport.zoom,
        }}
        dragRotate={mapConfig.dragRotate}
        pitchWithRotate={mapConfig.pitchWithRotate}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={[
          'firs-layer',
          'district-choropleth-fill'
        ]}
        onClick={(e) => {
          const features = e.features;
          if (features && features.length > 0) {
            const clickedFir = features.find(f => f.layer.id === 'firs-layer');
            if (clickedFir && clickedFir.properties) {
              const caseId = clickedFir.properties.id;
              fetch(`/api/cases/${caseId.replace('CASE-', '')}`)
                .then(res => res.json())
                .then(caseData => {
                  setSelectedGeoFeature({
                    id: caseId,
                    category: 'FIR_INCIDENT',
                    title: `Crime No: ${caseData.CrimeNo}`,
                    subtitle: caseData.BriefFacts?.substring(0, 100) + '...',
                    threatLevel: clickedFir.properties.threatLevel,
                    latitude: caseData.latitude,
                    longitude: caseData.longitude,
                    status: caseData.Status
                  } as any);
                })
                .catch(err => console.error(err));
              return;
            }

            const clickedDist = features.find(f => f.layer.id.endsWith('-fill'));
            if (clickedDist && clickedDist.properties) {
               setSelectedDistrict({
                 id: clickedDist.properties.districtCode || clickedDist.layer.id,
                 name: clickedDist.properties.districtName || 'District',
                 count: clickedDist.properties.crimeCount || 0,
                 lng: e.lngLat.lng,
                 lat: e.lngLat.lat
               });
            }
          } else {
            setSelectedDistrict(null);
          }
        }}
        onMoveEnd={(e: ViewStateChangeEvent) => {
          setMapViewport({
            longitude: e.viewState.longitude,
            latitude: e.viewState.latitude,
            zoom: e.viewState.zoom,
          });
        }}
        onMouseMove={(e) => {
          const choroplethFeature = e.features?.find(f => f.layer?.id === 'district-choropleth-fill');
          if (choroplethFeature && choroplethFeature.properties) {
            e.target.getCanvas().style.cursor = 'crosshair';
            setHoverInfo({
              x: e.point.x,
              y: e.point.y,
              name: choroplethFeature.properties.districtName || choroplethFeature.properties.district || 'Unknown',
              count: choroplethFeature.properties.crimeCount ?? 0
            });
          } else if (e.features?.some(f => f.layer?.id === 'firs-layer')) {
            e.target.getCanvas().style.cursor = 'pointer';
            setHoverInfo(null);
          } else {
            e.target.getCanvas().style.cursor = '';
            setHoverInfo(null);
          }
        }}
        onMouseLeave={(e) => {
          e.target.getCanvas().style.cursor = '';
          setHoverInfo(null);
        }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <NavigationControl position="bottom-right" showCompass showZoom />

        {/* WebGL FIRs Layer (5000 dots rendered in GPU for smooth 60fps) */}
        {filteredFirGeoJson && activeLayers.includes('entity-locations') && mapMode === 'TACTICAL' && (
          <Source id="firs-source" type="geojson" data={filteredFirGeoJson}>
            <Layer 
              id="firs-layer" 
              type="circle" 
              paint={{
                'circle-radius': 5,
                'circle-color': [
                  'match',
                  ['get', 'threatLevel'],
                  'CRITICAL', '#ff3333',
                  'HIGH', '#ffb347',
                  'MEDIUM', '#00f0ff',
                  '#ffffff'
                ],
                'circle-opacity': 0.8,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#0f172a'
              }} 
            />
          </Source>
        )}

        {/* District Choropleth Map — Dynamic Color Scale */}
        {mapMode === 'DENSITY' && choroplethData && (
          <Source id="district-choropleth" type="geojson" data={choroplethData.geojson}>
            <Layer
              id="district-choropleth-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'crimeCount'],
                  choroplethData.minCount,     '#10B981',
                  choroplethData.midLow,       '#F59E0B',
                  choroplethData.mid,          '#EF4444',
                  choroplethData.maxCount,     '#7F1D1D'
                ],
                'fill-opacity': 0.78
              }}
            />
            <Layer
              id="district-choropleth-line"
              type="line"
              paint={{
                'line-color': 'rgba(255,255,255,0.35)',
                'line-width': 1,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Geo-Network Link Arcs ON THE MAP */}
        {mapMode === 'ARCS' && liveGeoArcs.map((arc) => (
          <Source
            key={arc.id}
            id={arc.id}
            type="geojson"
            data={{
              type: 'Feature',
              properties: { severity: arc.severity },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [arc.sourceLng, arc.sourceLat],
                  [arc.targetLng, arc.targetLat]
                ]
              }
            }}
          >
            <Layer
              id={`${arc.id}-line`}
              type="line"
              paint={{
                'line-color': arc.severity === 'CRITICAL' ? '#EF4444' : arc.severity === 'HIGH' ? '#F59E0B' : '#10B981',
                'line-width': 3.5,
                'line-dasharray': [2, 1]
              }}
            />
          </Source>
        ))}

        {activeLayers.includes('police-stations') && policeStations.map((ps) => {
          const isSelected = selectedPoliceStation?.id === ps.id;
          return (
            <Marker
              key={ps.id}
              longitude={ps.longitude}
              latitude={ps.latitude}
              anchor="bottom"
              onClick={(e: MarkerEvent<MouseEvent>) => {
                e.originalEvent.stopPropagation();
                setSelectedPoliceStation(ps);
                setSelectedGeoFeature(null);
              }}
            >
              <div className="relative group/ps cursor-pointer">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg
                  ${isSelected
                    ? 'scale-125 border-white bg-blue-600 ring-4 ring-blue-400/60 z-30'
                    : 'border-blue-400 bg-tactical-950/90 hover:scale-110 hover:border-white'}`}
                >
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-tactical-950/95 border border-blue-500/50 px-1.5 py-0.5 rounded text-xxs font-mono text-blue-300 whitespace-nowrap pointer-events-none">
                  {ps.name.replace(' Police Station', ' PS')}
                </div>
              </div>
            </Marker>
          );
        })}
        
        {activeLayers.includes('entity-locations') && entityLocations.map((loc) => {
          if (loc.longitude === undefined || loc.latitude === undefined || !loc.entityId) return null;
          const locData = loc as any;
          const isSelected = selectedGeoFeature?.id === locData.id;
          const isCritical = locData.threatLevel === 'CRITICAL';
          
          return (
            <Marker
              key={`${loc.entityId}-${loc.latitude}-${loc.longitude}`}
              longitude={loc.longitude}
              latitude={loc.latitude}
              anchor="bottom"
              onClick={(e: MarkerEvent<MouseEvent>) => {
                e.originalEvent.stopPropagation();
                setSelectedGeoFeature(loc as any);
                setFocusedEntity(loc.entityId ?? null);
              }}
            >
              <div className="relative group/pin cursor-pointer">
                {/* Outer tactical ring */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg
                  ${isSelected ? 'scale-125 border-white bg-tactical-950/95 ring-4 ring-accent-cyan/60 z-30' :
                    isCritical ? 'border-accent-red bg-tactical-950/90 shadow-[0_0_15px_rgba(255,51,51,0.6)] animate-pulse' :
                    'border-accent-cyan bg-tactical-950/90 hover:scale-110'}`}
                >
                  {getGeoIcon(locData.category as any)}
                </div>
                {/* Mini label underneath */}
                <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-tactical-950/95 border border-tactical-700 px-1.5 py-0.5 rounded text-xxs font-mono text-tactical-200 whitespace-nowrap pointer-events-none">
                  {locData.label || loc.name}
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Selected WebGL FIR Marker Overlay */}
        {selectedGeoFeature && selectedGeoFeature.category === 'FIR_INCIDENT' && selectedGeoFeature.longitude && selectedGeoFeature.latitude && (
          <Marker
            longitude={selectedGeoFeature.longitude}
            latitude={selectedGeoFeature.latitude}
            anchor="bottom"
          >
            <div className="relative group/pin cursor-pointer z-40">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg scale-125 border-white bg-tactical-950/95 ring-4 ring-accent-cyan/60 z-30">
                {getGeoIcon(selectedGeoFeature.category)}
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-tactical-950/95 border border-tactical-700 px-1.5 py-0.5 rounded text-xxs font-mono text-tactical-200 whitespace-nowrap pointer-events-none">
                {selectedGeoFeature.title}
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* District Hover Tooltip */}
      {hoverInfo && mapMode === 'DENSITY' && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y - 48 }}
        >
          <div className="bg-tactical-900/95 backdrop-blur border border-tactical-600 rounded px-3 py-2 shadow-xl">
            <div className="text-[10px] font-mono font-bold text-white tracking-wide">{hoverInfo.name}</div>
            <div className="text-[9px] font-mono text-tactical-400 mt-0.5">
              {mapFilters.crimeType === 'HEINOUS' ? 'Heinous' : 'Total'} Cases:
              <span className="text-accent-amber font-bold ml-1">{hoverInfo.count}</span>
            </div>
          </div>
        </div>
      )}





      {/* Tactical Coordinate HUD */}
      <div className="absolute bottom-12 left-3 z-20 pointer-events-none">
        <div className="hud-card px-2.5 py-1.5 font-mono text-xxs">
          <div className="text-tactical-500 text-[9px] uppercase tracking-wider mb-0.5">Coordinates</div>
          <div className="text-accent-cyan tabular-nums">LAT: {viewport.latitude.toFixed(5)}</div>
          <div className="text-accent-cyan tabular-nums">LON: {viewport.longitude.toFixed(5)}</div>
          <div className="text-tactical-400 tabular-nums">ZOOM: {viewport.zoom.toFixed(1)}</div>
        </div>
      </div>

      {/* ─── Map Mode Toggle (top-left) ─── */}
      <div className="absolute top-3 left-3 z-20 flex bg-tactical-900/80 backdrop-blur rounded-md border border-tactical-700/60 p-1">
        <button
          onClick={() => setMapMode('TACTICAL')}
          className={`px-3 py-1.5 text-xxs font-mono rounded transition-all ${
            mapMode === 'TACTICAL' ? 'bg-tactical-700 text-white' : 'text-tactical-400 hover:text-tactical-200'
          }`}
        >
          TACTICAL
        </button>
        <button
          onClick={() => setMapMode('DENSITY')}
          className={`px-3 py-1.5 text-xxs font-mono rounded transition-all ${
            mapMode === 'DENSITY' ? 'bg-accent-green/20 text-accent-green' : 'text-tactical-400 hover:text-tactical-200'
          }`}
        >
          DENSITY
        </button>
        <button
          onClick={() => setMapMode('ARCS')}
          className={`px-3 py-1.5 text-xxs font-mono rounded transition-all ${
            mapMode === 'ARCS' ? 'bg-accent-purple/20 text-accent-purple' : 'text-tactical-400 hover:text-tactical-200'
          }`}
        >
          ARCS
        </button>
      </div>
      
      {/* ─── Map Filters (Top Center) ─── */}
      <MapFilterStrip filters={mapFilters} onChange={setMapFilters} />

      {/* ─── Map Legend (Bottom Right above nav) ─── */}
      <MapLegend 
        mode={mapMode} 
        choroplethStats={choroplethData ? { minCount: choroplethData.minCount, maxCount: choroplethData.maxCount, mid: choroplethData.mid, midLow: choroplethData.midLow } : null}
        crimeType={mapFilters.crimeType}
      />

      {/* District Drill Down Panel */}
      <DistrictDrillDownPanel 
        district={selectedDistrict} 
        onClose={() => setSelectedDistrict(null)} 
      />

      {/* Selected Target Dossier Overlay Card */}
      {selectedGeoFeature && (
        <div className="absolute top-16 right-4 w-80 bg-tactical-900/95 border border-accent-cyan/80 rounded shadow-[0_0_25px_rgba(0,240,255,0.25)] p-4 z-50 backdrop-blur-md animate-fade-in">
          <div className="flex items-start justify-between pb-2 border-b border-tactical-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-tactical-950 border border-tactical-700">
                {getGeoIcon(selectedGeoFeature.category)}
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-accent-cyan flex items-center gap-1.5">
                  {selectedGeoFeature.id}
                  <span className={`px-1.5 py-0.2 text-[9px] rounded font-bold uppercase
                    ${selectedGeoFeature.threatLevel === 'CRITICAL' ? 'bg-accent-red text-white animate-pulse' : 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40'}`}>
                    {selectedGeoFeature.threatLevel}
                  </span>
                </div>
                <div className="text-xxs font-mono text-tactical-400">{selectedGeoFeature.category.replace('_', ' ')}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedGeoFeature(null)}
              className="text-tactical-400 hover:text-white p-1"
              title="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <div className="font-bold text-xs text-white">{selectedGeoFeature.title}</div>
              <div className="text-xxs text-tactical-300 font-mono mt-0.5">{selectedGeoFeature.subtitle}</div>
            </div>
            <p className="text-xxs text-tactical-200 leading-relaxed bg-tactical-950/60 p-2 rounded border border-tactical-800">
              {selectedGeoFeature.details}
            </p>
            <div className="flex items-center justify-between text-xxs font-mono text-tactical-400 pt-1">
              <span>COORDS: {selectedGeoFeature.latitude.toFixed(4)}, {selectedGeoFeature.longitude.toFixed(4)}</span>
              {selectedGeoFeature.timestamp && (
                <span>LOG: {new Date(selectedGeoFeature.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-tactical-800 flex items-center gap-2">
            {selectedGeoFeature.caseId && (
              <button
                onClick={() => {
                  const store = useInvestigationStore.getState();
                  store.setActiveCase(selectedGeoFeature.caseId!);
                  store.setActiveSidePanel('network');
                  store.setIsRightPanelCollapsed(false);
                }}
                className="flex-1 py-1.5 px-2 bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan text-accent-cyan text-xxs font-mono font-bold rounded flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                <span>OPEN CASE ({selectedGeoFeature.caseId})</span>
              </button>
            )}
            {selectedGeoFeature.entityId && (
              <button
                onClick={() => {
                  const store = useInvestigationStore.getState();
                  store.setFocusedEntity(selectedGeoFeature.entityId!);
                  store.setActiveSidePanel('entity');
                  store.setIsRightPanelCollapsed(false);
                }}
                className="flex-1 py-1.5 px-2 bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 text-white text-xxs font-mono font-bold rounded flex items-center justify-center gap-1.5 transition-all"
              >
                <span>ENTITY DOSSIER</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Police Station Overlay Card */}
      {selectedPoliceStation && (
        <div className="absolute top-16 right-4 w-80 bg-tactical-900/95 border border-blue-500/80 rounded shadow-[0_0_25px_rgba(59,130,246,0.25)] p-4 z-50 backdrop-blur-md animate-fade-in">
          <div className="flex items-start justify-between pb-2 border-b border-tactical-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-tactical-950 border border-blue-500/40">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  {selectedPoliceStation.id}
                  <span className="px-1.5 py-0.5 text-[9px] rounded font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/40">
                    POLICE STATION
                  </span>
                </div>
                <div className="text-xxs font-mono text-tactical-400">JURISDICTION COMMAND</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPoliceStation(null)}
              className="p-1 text-tactical-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2">
            <div>
              <div className="font-bold text-xs text-white">{selectedPoliceStation.name}</div>
              <div className="text-xxs text-tactical-300 font-mono mt-0.5">{selectedPoliceStation.jurisdiction}</div>
            </div>
            <div className="text-xxs text-blue-300 font-mono bg-blue-950/40 border border-blue-500/30 p-2 rounded">
              <div>CONTACT: {selectedPoliceStation.contact}</div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-tactical-400 border-t border-tactical-800 pt-2">
              <span>COORDS: {selectedPoliceStation.latitude.toFixed(4)}, {selectedPoliceStation.longitude.toFixed(4)}</span>
              <span>BENGALURU CITY POLICE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
