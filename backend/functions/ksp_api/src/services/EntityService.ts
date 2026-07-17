import type { EntityDossier } from '@shared/domain/EntityDossier';
import type { EntityLocation } from '@shared/domain/EntityLocation';
import type { 
  IEntityRepository, 
  IMetadataRepository, 
  IEventRepository, 
  IRelationshipRepository, 
  IGeoRepository 
} from '@shared/repositories/IRepositories';

export class EntityService {
  constructor(
    private readonly entityRepo: IEntityRepository,
    private readonly metadataRepo: IMetadataRepository,
    private readonly eventRepo: IEventRepository,
    private readonly relationshipRepo: IRelationshipRepository,
    private readonly geoRepo: IGeoRepository
  ) {}

  /**
   * Generates a comprehensive Entity Dossier for a given Entity ID.
   * This dossier aggregates all known derived intelligence for the entity.
   */
  public async getEntityDossier(entityId: string): Promise<EntityDossier | null> {
    const entity = this.entityRepo.findById(entityId);
    if (!entity) return null;

    const metadata = this.metadataRepo.findByEntityId(entityId);
    const geos = this.geoRepo.findByEntityId(entityId);
    const relationships = this.relationshipRepo.findBySourceId(entityId);
    // Since events are tied to cases, we might need a way to link entity to cases, 
    // or just assume we have eventRepo.findByEntityId if the model supported it.
    // In our schema, `EventRow` has `caseId`. 
    // An entity is related to a case via a relationship (e.g., PERSON -> INVOLVED_IN -> CASE).
    // Let's fetch the events by finding cases the entity is related to.

    const aliases = metadata.filter(m => m.key === 'alias').map(m => m.value);
    const identifiers = metadata
      .filter(m => m.key !== 'alias')
      .reduce((acc, m) => {
        acc[m.key] = m.value;
        return acc;
      }, {} as Record<string, string>);

    // Find related cases to pull events
    const relatedCaseIds = relationships
      .filter(r => r.targetId.startsWith('case-')) // simplistic check, or we could check entityRepo for targetId
      .map(r => r.targetId);

    const events = [];
    for (const caseId of relatedCaseIds) {
      const caseEvents = this.eventRepo.findByCaseId(caseId);
      events.push(...caseEvents);
    }
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      entityId: entity.id,
      generatedAt: new Date().toISOString(),
      pipelineVersion: '1.0.0', // Hardcoded for now, could be fetched from config
      datasetVersion: '1.0.0',
      profile: {
        type: entity.type,
        name: entity.name,
        aliases,
        identifiers,
      },
      riskIndicators: [],
      timeline: {
        firstSeen: events.length > 0 ? events[0].timestamp : entity.createdAt,
        lastSeen: events.length > 0 ? events[events.length - 1].timestamp : entity.updatedAt,
        totalEvents: events.length,
        events: events.map(e => ({
          id: e.id,
          type: e.type,
          timestamp: e.timestamp,
          description: e.description
        }))
      },
      relationships: {
        totalEdges: relationships.length,
        edges: relationships.map(r => ({
          id: r.id,
          targetId: r.targetId,
          type: r.type
        }))
      },
      spatial: {
        totalLocations: geos.length,
        locations: geos.map(g => ({
          latitude: g.latitude,
          longitude: g.longitude,
          locationName: g.locationName
        }))
      }
    };
  }

  public async getAllEntityLocations(): Promise<EntityLocation[]> {
    const allGeos = this.geoRepo.findAll();
    const results: EntityLocation[] = [];
    for (const g of allGeos) {
      if (!g.entityId || g.latitude == null || g.longitude == null) continue;
      const entity = this.entityRepo.findById(g.entityId);
      if (entity) {
        results.push({
          entityId: entity.id,
          name: entity.name,
          type: entity.type,
          latitude: g.latitude,
          longitude: g.longitude,
          locationName: g.locationName ?? null
        });
      }
    }
    return results;
  }

  public async getEntitiesInBounds(north: number, south: number, east: number, west: number): Promise<EntityLocation[]> {
    const geos = this.geoRepo.findInBoundingBox(north, south, east, west);
    const results: EntityLocation[] = [];
    for (const g of geos) {
      if (!g.entityId || g.latitude == null || g.longitude == null) continue;
      const entity = this.entityRepo.findById(g.entityId);
      if (entity) {
        results.push({
          entityId: entity.id,
          name: entity.name,
          type: entity.type,
          latitude: g.latitude,
          longitude: g.longitude,
          locationName: g.locationName ?? null
        });
      }
    }
    return results;
  }
}
