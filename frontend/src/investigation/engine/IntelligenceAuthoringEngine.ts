import { operationalEventBus } from '../events/OperationalEventBus';
import { investigationRepository } from '../services/InvestigationRepository';

export type IntelligenceItemType =
  | 'OBSERVATION'
  | 'LEAD'
  | 'TIP'
  | 'INFORMANT_REPORT'
  | 'SURVEILLANCE_LOG'
  | 'PHONE_INTERCEPTION'
  | 'MEETING'
  | 'SUSPICIOUS_VEHICLE'
  | 'RECOVERED_WEAPON'
  | 'WITNESS_STATEMENT'
  | 'ANONYMOUS_TIP'
  | 'OFFICER_FIELD_NOTE'
  | 'CONFIDENTIAL_SOURCE';

export interface IntelligenceItem {
  id: string;
  investigationId: string;
  itemType: IntelligenceItemType;
  title: string;
  details: string;
  natoAdmiraltyGrade: string; // A1 - F6
  authoredByOfficerId: string;
  createdAt: string;
  linkedEntityIds: string[];
  attributes?: Record<string, any>;
}

export interface AuthorIntelligenceRequest {
  investigationId: string;
  itemType: IntelligenceItemType;
  title: string;
  details: string;
  natoAdmiraltyGrade: string;
  authoredByOfficerId: string;
  linkedEntityIds?: string[];
  attributes?: Record<string, any>;
}

export class IntelligenceAuthoringEngine {
  private authoredItems: Map<string, IntelligenceItem[]> = new Map();

  public authorIntelligence(request: AuthorIntelligenceRequest): IntelligenceItem {
    const id = `INTEL-${request.itemType}-${Math.floor(Math.random() * 100000)}`;
    const item: IntelligenceItem = {
      id,
      investigationId: request.investigationId,
      itemType: request.itemType,
      title: request.title,
      details: request.details,
      natoAdmiraltyGrade: request.natoAdmiraltyGrade || 'B2',
      authoredByOfficerId: request.authoredByOfficerId,
      createdAt: new Date().toISOString(),
      linkedEntityIds: request.linkedEntityIds || [],
      attributes: request.attributes || {}
    };

    // Save item
    const list = this.authoredItems.get(request.investigationId) || [];
    list.push(item);
    this.authoredItems.set(request.investigationId, list);

    // Also persist as entity in InvestigationRepository
    investigationRepository.saveEntity(request.investigationId, {
      ...item,
      type: 'INTELLIGENCE_ITEM'
    });

    // Broadcast Operational Event
    operationalEventBus.publish({
      id: `EVT-AUTH-${id}`,
      investigationId: request.investigationId,
      eventType: 'INTELLIGENCE_AUTHORED',
      timestamp: item.createdAt,
      officerId: request.authoredByOfficerId,
      summary: `Authored [${request.itemType}]: ${request.title}`,
      payload: { intelligenceItem: item }
    });

    return item;
  }

  public getItemsForInvestigation(investigationId: string): IntelligenceItem[] {
    return this.authoredItems.get(investigationId) || [];
  }

  public clearAll(): void {
    this.authoredItems.clear();
  }
}

export const intelligenceAuthoringEngine = new IntelligenceAuthoringEngine();
