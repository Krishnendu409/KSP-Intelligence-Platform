import { randomUUID } from 'crypto';
import type { EntityCandidate } from '@shared/domain/NormalizedFIR';
import type { EntityRow } from '@shared/repositories/IRepositories';

export interface ResolutionResult {
  entities: EntityRow[];
  candidateIdMap: Map<string, string>; // candidate.id -> resolved entity.id
}

export class EntityResolutionStage {
  /**
   * Deterministically merges exact matches (e.g. phones, standardized addresses) 
   * or creates new Entities. No fuzzy matching.
   */
  public static execute(candidates: EntityCandidate[], existingEntities: EntityRow[] = []): ResolutionResult {
    const entities = [...existingEntities];
    const candidateIdMap = new Map<string, string>();
    
    // Simple exact-match index based on Type + Name
    const index = new Map<string, EntityRow>();
    entities.forEach(e => {
      index.set(`${e.type}_${e.name}`, e);
    });

    const now = new Date().toISOString();

    candidates.forEach(candidate => {
      const key = `${candidate.type}_${candidate.name}`;
      
      if (index.has(key)) {
        // Resolve to existing
        const existing = index.get(key)!;
        candidateIdMap.set(candidate.id, existing.id);
      } else {
        // Create new
        const newEntity: EntityRow = {
          id: `ent-${randomUUID()}`,
          type: candidate.type,
          name: candidate.name,
          createdAt: now,
          updatedAt: now
        };
        entities.push(newEntity);
        index.set(key, newEntity);
        candidateIdMap.set(candidate.id, newEntity.id);
      }
    });

    return { entities, candidateIdMap };
  }
}
