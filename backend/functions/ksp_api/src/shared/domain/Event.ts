import type { GeoLocation } from '../types/UtilityTypes';
import type { EventType } from '../enums/EventType';
import type { DerivedIntelligence } from './BaseEntity';

export interface Event extends DerivedIntelligence {
    id: string;
    type: EventType;
    timestamp: string;
    location: GeoLocation;
    entityIds: string[];
    caseId: string;
    description: string;
}
