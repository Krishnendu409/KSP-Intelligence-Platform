export interface Evidence {
  type: string; // e.g., 'FIR_WITNESS', 'PHONE_CALL', 'BANK_TRANSFER'
  sourceId: string; // ID of the raw data backing this
  description: string;
}

export interface RelationshipWithEvidence {
  id: string;
  relationshipId?: string;
  sourceId: string;
  targetId: string;
  sourceEntity?: { id: string; name: string; type: string };
  targetEntity?: { id: string; name: string; type: string };
  type: string;
  confidence: number;
  evidence: Evidence[];
}

export interface EntityGraph {
  entityId: string;
  edges: RelationshipWithEvidence[];
  // Optionally could include node details if we want a full graph representation,
  // but usually edges are enough to fetch connected entities via EntityService.
}
