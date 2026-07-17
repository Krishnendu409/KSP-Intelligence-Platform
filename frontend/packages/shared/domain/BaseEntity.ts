import { EntityType } from '../enums/EntityType';

export interface BaseEntity {
    id: string;
    type: EntityType;
    label: string;
    createdAt: string;
    updatedAt: string;
}

export interface DerivedIntelligence {
    confidence: number;
    sourceIds: string[];
    generatedBy: string;
    generatedAt: string;
}
