export interface EntityRow {
    id: string;
    type: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface CaseRow {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventRow {
    id: string;
    caseId: string | null;
    type: string;
    description: string | null;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}

export interface RelationshipRow {
    id: string;
    sourceId: string;
    targetId: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface GeoRow {
    id: string;
    entityId: string | null;
    latitude: number;
    longitude: number;
    locationName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SpatialCacheRow {
    id: string;
    geoId: string;
    geohash: string;
    createdAt: string;
    updatedAt: string;
}

export interface MetadataRow {
    id: string;
    entityId: string;
    key: string;
    value: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProvenanceRow {
    id: string;
    entityId: string;
    source: string;
    confidence: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface IEntityRepository {
    findById(id: string): EntityRow | undefined;
    findAll(): EntityRow[];
    findByName(nameQuery: string): EntityRow[];
    create(entity: Omit<EntityRow, 'createdAt' | 'updatedAt'>): EntityRow;
    update(id: string, entity: Partial<Omit<EntityRow, 'id' | 'createdAt' | 'updatedAt'>>): EntityRow | undefined;
    delete(id: string): boolean;
}

export interface ICaseRepository {
    findById(id: string): CaseRow | undefined;
    findAll(): CaseRow[];
    create(c: Omit<CaseRow, 'createdAt' | 'updatedAt'>): CaseRow;
    update(id: string, c: Partial<Omit<CaseRow, 'id' | 'createdAt' | 'updatedAt'>>): CaseRow | undefined;
    delete(id: string): boolean;
}

export interface IEventRepository {
    findById(id: string): EventRow | undefined;
    findByCaseId(caseId: string): EventRow[];
    findAll(): EventRow[];
    create(event: Omit<EventRow, 'createdAt' | 'updatedAt'>): EventRow;
    update(id: string, event: Partial<Omit<EventRow, 'id' | 'createdAt' | 'updatedAt'>>): EventRow | undefined;
    delete(id: string): boolean;
}

export interface IRelationshipRepository {
    findById(id: string): RelationshipRow | undefined;
    findBySourceId(sourceId: string): RelationshipRow[];
    findByTargetId(targetId: string): RelationshipRow[];
    create(rel: Omit<RelationshipRow, 'createdAt' | 'updatedAt'>): RelationshipRow;
    delete(id: string): boolean;
}

export interface IGeoRepository {
    findById(id: string): GeoRow | undefined;
    findByEntityId(entityId: string): GeoRow[];
    findInBoundingBox(north: number, south: number, east: number, west: number): GeoRow[];
    findAll(): GeoRow[];
    create(geo: Omit<GeoRow, 'createdAt' | 'updatedAt'>): GeoRow;
    update(id: string, geo: Partial<Omit<GeoRow, 'id' | 'createdAt' | 'updatedAt'>>): GeoRow | undefined;
    delete(id: string): boolean;
}

export interface IMetadataRepository {
    findById(id: string): MetadataRow | undefined;
    findByEntityId(entityId: string): MetadataRow[];
    findByValue(valueQuery: string): MetadataRow[];
    findByKeyAndValue(key: string, valueQuery: string): MetadataRow[];
    create(meta: Omit<MetadataRow, 'createdAt' | 'updatedAt'>): MetadataRow;
    update(id: string, meta: Partial<Omit<MetadataRow, 'id' | 'createdAt' | 'updatedAt'>>): MetadataRow | undefined;
    delete(id: string): boolean;
}

export interface ISpatialCacheRepository {
    findById(id: string): SpatialCacheRow | undefined;
    findByGeoId(geoId: string): SpatialCacheRow[];
    create(cache: Omit<SpatialCacheRow, 'createdAt' | 'updatedAt'>): SpatialCacheRow;
    delete(id: string): boolean;
}

export interface IProvenanceRepository {
    findById(id: string): ProvenanceRow | undefined;
    findByEntityId(entityId: string): ProvenanceRow[];
    create(prov: Omit<ProvenanceRow, 'createdAt' | 'updatedAt'>): ProvenanceRow;
    delete(id: string): boolean;
}
