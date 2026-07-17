export interface GeoLocation { 
    lat: number; 
    lng: number; 
}

export interface MapView { 
    center: GeoLocation; 
    zoom: number; 
}

export interface WorkspaceFilter { 
    key: string; 
    value: string; 
    operator: string; 
}
