import { randomUUID } from 'crypto';
import type { ProvenanceRow } from '@shared/repositories/IRepositories';

export class ProvenanceBuilder {
  /**
   * Generates provenance records for derived intelligence objects.
   * Format: Source FIR -> Pipeline Stage -> Pipeline Version
   */
  public static execute(
    sourceFirId: string, 
    generatedEntityId: string, 
    stageName: string, 
    version = 'v1.0'
  ): ProvenanceRow {
    const now = new Date().toISOString();
    return {
      id: `prov-${randomUUID()}`,
      entityId: generatedEntityId,
      source: `${sourceFirId} -> ${stageName} -> Pipeline ${version}`,
      confidence: 1.0, // Base pipeline is deterministic
      createdAt: now,
      updatedAt: now
    };
  }
}
