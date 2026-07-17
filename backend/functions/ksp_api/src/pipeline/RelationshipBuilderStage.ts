import { randomUUID } from 'crypto';
import type { EntityCandidate } from '@shared/domain/NormalizedFIR';
import type { RelationshipRow } from '@shared/repositories/IRepositories';
import type { ResolutionResult } from './EntityResolutionStage';

export class RelationshipBuilderStage {
  /**
   * Deterministically creates relationships between resolved entities based on their candidate metadata.
   */
  public static execute(candidates: EntityCandidate[], resolution: ResolutionResult): RelationshipRow[] {
    const relationships: RelationshipRow[] = [];
    const now = new Date().toISOString();

    candidates.forEach(candidate => {
      const targetId = resolution.candidateIdMap.get(candidate.id);
      if (!targetId) return;

      const linkedCandidateId = candidate.metadata.linkedPersonId;
      if (linkedCandidateId) {
        const sourceId = resolution.candidateIdMap.get(linkedCandidateId);
        if (sourceId) {
          const type = this.determineType(candidate.type);
          relationships.push({
            id: `rel-${randomUUID()}`,
            sourceId,
            targetId,
            type,
            createdAt: now,
            updatedAt: now
          });
        }
      }
    });

    return relationships;
  }

  private static determineType(targetType: string): string {
    switch (targetType) {
      case 'PHONE': return 'OWNS_PHONE';
      case 'ADDRESS': return 'RESIDES_AT';
      case 'VEHICLE': return 'OWNS_VEHICLE';
      case 'BANK_ACCOUNT': return 'HAS_BANK_ACCOUNT';
      case 'IMEI': return 'HAS_IMEI';
      default: return 'LINKED_TO';
    }
  }
}
