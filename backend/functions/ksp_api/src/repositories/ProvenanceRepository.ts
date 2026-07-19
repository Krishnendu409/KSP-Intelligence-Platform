import type { IProvenanceRepository, ProvenanceRow } from '../shared/repositories/IRepositories';

/**
 * Derives provenance for relationship edges directly from the deterministic
 * relationship-id convention used by SQLiteRelationshipRepository
 * (`rel-c{caseId}-...`) so every edge in the network graph can answer
 * "why is this edge here" (PRD §7.5) instead of returning empty evidence.
 */
export class ProvenanceRepository implements IProvenanceRepository {
  findById(_id: string): ProvenanceRow | undefined {
    return undefined;
  }

  findByEntityId(relationshipId: string): ProvenanceRow[] {
    const match = relationshipId.match(/^rel-c(\d+)-/);
    if (!match) return [];

    const caseId = match[1];
    const now = new Date().toISOString();
    return [{
      id: `prov-${relationshipId}`,
      entityId: relationshipId,
      source: `CASE-${caseId}`,
      // Direct FK-derived edges (shared CaseMasterID) are deterministic facts, not fuzzy
      // matches — full confidence. Fuzzy repeat-offender links are scored separately
      // via identity.service.ts's matchConfidence() and never claimed as certain.
      confidence: 100,
      createdAt: now,
      updatedAt: now,
    }];
  }

  create(_prov: Omit<ProvenanceRow, 'createdAt' | 'updatedAt'>): ProvenanceRow {
    throw new Error('Not Implemented: provenance is derived, not stored');
  }

  delete(_id: string): boolean {
    return false;
  }
}
