import type { RelationshipType } from '../enums/RelationshipType';
import type { DerivedIntelligence } from './BaseEntity';

export interface Relationship extends DerivedIntelligence {
    id: string;
    sourceId: string;
    targetId: string;
    relationshipType: RelationshipType;
    sourceEvidence: string;
    validFrom: string;
    validTo: string;
}
