import type { RelationshipWithEvidence } from '@shared/domain/RelationshipEvidence';
import type { IRelationshipRepository, IProvenanceRepository, IEntityRepository } from '@shared/repositories/IRepositories';

export class RelationshipService {
  constructor(
    private readonly relationshipRepo: IRelationshipRepository,
    private readonly provenanceRepo: IProvenanceRepository,
    private readonly entityRepo?: IEntityRepository
  ) {}

  /**
   * Retrieves the one-hop relationships for a given entity, enriched with evidence.
   */
  public async getOneHopGraph(entityId: string): Promise<RelationshipWithEvidence[]> {
    const outEdges = this.relationshipRepo.findBySourceId(entityId);
    const inEdges = this.relationshipRepo.findByTargetId(entityId);

    const allRels = [...outEdges, ...inEdges];
    
    // De-duplicate in case of bidirectional relationships being stored twice
    const uniqueRelsMap = new Map<string, typeof outEdges[0]>();
    for (const rel of allRels) {
      uniqueRelsMap.set(rel.id, rel);
    }
    
    const uniqueRels = Array.from(uniqueRelsMap.values());

    const enrichedEdges: RelationshipWithEvidence[] = [];

    for (const rel of uniqueRels) {
      const provenances = this.provenanceRepo.findByEntityId(rel.id);
      
      const evidenceList = provenances.map(prov => ({
        type: 'FIR_REFERENCE',
        sourceId: prov.source,
        description: `Derived from ${prov.source} with confidence ${prov.confidence}`
      }));

      const baseConfidence = provenances.length > 0 ? (provenances[0].confidence || 0) : 50;

      const sourceEnt = this.entityRepo?.findById(rel.sourceId);
      const targetEnt = this.entityRepo?.findById(rel.targetId);

      enrichedEdges.push({
        id: rel.id,
        relationshipId: rel.id,
        sourceId: rel.sourceId,
        targetId: rel.targetId,
        sourceEntity: sourceEnt
          ? { id: sourceEnt.id, name: sourceEnt.name, type: sourceEnt.type }
          : { id: rel.sourceId, name: rel.sourceId, type: 'UNKNOWN' },
        targetEntity: targetEnt
          ? { id: targetEnt.id, name: targetEnt.name, type: targetEnt.type }
          : { id: rel.targetId, name: rel.targetId, type: 'UNKNOWN' },
        type: rel.type,
        confidence: baseConfidence,
        evidence: evidenceList
      });
    }

    return enrichedEdges;
  }

  /**
   * Generates a Cytoscape-compatible elements array for the frontend Network Graph.
   */
  public async getCytoscapeGraph(entityId: string): Promise<any[]> {
    const elements: any[] = [];
    
    // First, let's fetch the graph using the existing getOneHopGraph which grabs evidence
    const enrichedEdges = await this.getOneHopGraph(entityId);
    
    // Add the root node if it exists
    const rootEntity = this.entityRepo?.findById(entityId);
    if (rootEntity) {
      elements.push({
        data: {
          id: rootEntity.id,
          label: rootEntity.name,
          type: rootEntity.type,
          role: rootEntity.type === 'Case' ? 'Incident' : 'Suspect',
          threatLevel: rootEntity.type === 'Accused' ? 'HIGH' : 'MEDIUM'
        },
        classes: rootEntity.type === 'Accused' ? 'accused critical-node root' : 'case root'
      });
    }

    const addedNodes = new Set<string>();
    if (rootEntity) {
        addedNodes.add(rootEntity.id);
    }

    for (const edge of enrichedEdges) {
      // Add Source Node
      const sEnt = edge.sourceEntity || { id: edge.sourceId, name: edge.sourceId, type: 'UNKNOWN' };
      if (!addedNodes.has(edge.sourceId)) {
        const typeCls = sEnt.type.toLowerCase();
        elements.push({
          data: {
            id: edge.sourceId,
            label: sEnt.name,
            type: sEnt.type,
            role: sEnt.type,
            threatLevel: sEnt.type === 'Accused' ? 'HIGH' : undefined
          },
          classes: `${typeCls} ${sEnt.type === 'Accused' ? 'critical-node' : ''}`
        });
        addedNodes.add(edge.sourceId);
      }

      // Add Target Node
      const tEnt = edge.targetEntity || { id: edge.targetId, name: edge.targetId, type: 'UNKNOWN' };
      if (!addedNodes.has(edge.targetId)) {
        const typeCls = tEnt.type.toLowerCase();
        let clsStr = typeCls;
        if (tEnt.type === 'Accused') clsStr += ' critical-node';
        if (tEnt.type === 'Location') clsStr += ' bridge-node';
        
        elements.push({
          data: {
            id: edge.targetId,
            label: tEnt.name,
            type: tEnt.type,
            role: tEnt.type,
            threatLevel: tEnt.type === 'Accused' ? 'HIGH' : undefined
          },
          classes: clsStr
        });
        addedNodes.add(edge.targetId);
      }

      // Add Edge
      let edgeClass = edge.type.toLowerCase().replace(/_/g, ' ');
      elements.push({
        data: {
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          label: edge.type.replace(/_/g, ' ')
        },
        classes: edgeClass
      });
    }

    return elements;
  }
}
