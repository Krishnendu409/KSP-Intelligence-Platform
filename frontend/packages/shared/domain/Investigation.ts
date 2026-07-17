import { InvestigationStatus } from '../enums/InvestigationStatus';
import { Priority } from '../enums/Priority';
import type { MapView, WorkspaceFilter } from '../types/UtilityTypes';

export interface Investigation {
    id: string;
    status: InvestigationStatus;
    priority: Priority;
    leadOfficer: string;
    timeline: string[];
    notes: string;
    savedViews: MapView;
    filters: WorkspaceFilter[];
}
