import type { 
  ICaseRepository, 
  IEventRepository, 
  IEntityRepository, 
  IRelationshipRepository, 
  IGeoRepository, 
  IMetadataRepository, 
  IProvenanceRepository,
  CaseRow,
  EventRow,
  EntityRow,
  RelationshipRow,
  GeoRow,
  MetadataRow
} from '@shared/repositories/IRepositories';
import { ProvenanceBuilder } from './ProvenanceBuilder';

export class DerivedIntelligencePersistenceStage {
  constructor(
    private readonly caseRepo: ICaseRepository,
    private readonly eventRepo: IEventRepository,
    private readonly entityRepo: IEntityRepository,
    private readonly relationshipRepo: IRelationshipRepository,
    private readonly geoRepo: IGeoRepository,
    private readonly metadataRepo: IMetadataRepository,
    private readonly provenanceRepo: IProvenanceRepository
  ) {}

  public execute(payload: {
    sourceFirId: string;
    caseRow: Omit<CaseRow, 'createdAt' | 'updatedAt'>;
    eventRow: Omit<EventRow, 'createdAt' | 'updatedAt'>;
    entities: Omit<EntityRow, 'createdAt' | 'updatedAt'>[];
    relationships: Omit<RelationshipRow, 'createdAt' | 'updatedAt'>[];
    geoFeatures: Omit<GeoRow, 'createdAt' | 'updatedAt'>[];
    metadataFeatures: Omit<MetadataRow, 'createdAt' | 'updatedAt'>[];
  }): void {
    const { sourceFirId, caseRow, eventRow, entities, relationships, geoFeatures, metadataFeatures } = payload;
    
    // Save Case
    if (!this.caseRepo.findById(caseRow.id)) {
      this.caseRepo.create({
        ...caseRow,
        description: caseRow.description || ''
      });
    }
    
    // Save Event
    if (!this.eventRepo.findById(eventRow.id)) {
      this.eventRepo.create({
        ...eventRow,
        description: eventRow.description || ''
      });
    }

    // Save Entities + Provenance
    entities.forEach(entity => {
      if (!this.entityRepo.findById(entity.id)) {
        this.entityRepo.create(entity);
        const prov = ProvenanceBuilder.execute(sourceFirId, entity.id, 'Entity Resolution');
        this.provenanceRepo.create(prov);
      }
    });

    // Save Relationships + Provenance
    relationships.forEach(rel => {
      if (!this.relationshipRepo.findById(rel.id)) {
        this.relationshipRepo.create(rel);
        const prov = ProvenanceBuilder.execute(sourceFirId, rel.id, 'Relationship Builder');
        this.provenanceRepo.create(prov);
      }
    });

    // Save Geo + Provenance
    geoFeatures.forEach(geo => {
      if (!this.geoRepo.findById(geo.id)) {
        this.geoRepo.create(geo);
        const prov = ProvenanceBuilder.execute(sourceFirId, geo.id, 'Feature Extraction (Geo)');
        this.provenanceRepo.create(prov);
      }
    });

    // Save Metadata + Provenance
    metadataFeatures.forEach(meta => {
      if (!this.metadataRepo.findById(meta.id)) {
        this.metadataRepo.create(meta);
        const prov = ProvenanceBuilder.execute(sourceFirId, meta.id, 'Feature Extraction (Metadata)');
        this.provenanceRepo.create(prov);
      }
    });
  }
}
