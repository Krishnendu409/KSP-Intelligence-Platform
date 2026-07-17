
export interface TacticalMapFeature {
  id: string;
  category: 'FIR_INCIDENT' | 'SUSPECT_LOCATION' | 'ANPR_CAMERA' | 'CELL_TOWER' | 'POLICE_STATION';
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  caseId?: string;
  entityId?: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp?: string;
  details: string;
}

export interface PoliceStationFeature {
  id: string;
  name: string;
  jurisdiction: string;
  contact: string;
  latitude: number;
  longitude: number;
}
