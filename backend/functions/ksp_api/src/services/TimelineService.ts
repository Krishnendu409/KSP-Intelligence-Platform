import type { IEventRepository, IRelationshipRepository, EventRow } from '@shared/repositories/IRepositories';

export interface TimelineFilter {
  startDate?: string;
  endDate?: string;
  types?: string[];
  limit?: number;
}

export class TimelineService {
  constructor(
    private readonly eventRepo: IEventRepository,
    private readonly relationshipRepo?: IRelationshipRepository
  ) {}

  /**
   * Retrieves a chronological timeline of events for a specific case.
   */
  public async getCaseTimeline(caseId: string, filter?: TimelineFilter): Promise<EventRow[]> {
    return this.getTimelineForContext(undefined, caseId, filter);
  }

  public async getTimelineForContext(entityId?: string, caseId?: string, filter?: TimelineFilter): Promise<EventRow[]> {
    let events: EventRow[] = [];
    if (caseId) {
      events = this.eventRepo.findByCaseId(caseId);
    } else if (entityId && this.relationshipRepo) {
      events = await this.getEventsForEntity(entityId);
    }

    // Apply filtering
    if (filter) {
      if (filter.startDate) {
        const start = new Date(filter.startDate).getTime();
        events = events.filter(e => new Date(e.timestamp).getTime() >= start);
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate).getTime();
        events = events.filter(e => new Date(e.timestamp).getTime() <= end);
      }
      if (filter.types && filter.types.length > 0) {
        events = events.filter(e => filter.types!.includes(e.type));
      }
    }

    // Sort chronologically (oldest first)
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Apply limit
    if (filter?.limit && filter.limit > 0) {
      events = events.slice(0, filter.limit);
    }

    return events;
  }

  private async getEventsForEntity(entityId: string): Promise<EventRow[]> {
    if (!this.relationshipRepo) return [];
    const relationships = this.relationshipRepo.findBySourceId(entityId);
    const caseIds = relationships
      .filter(r => r.type === 'INVOLVED_IN')
      .map(r => r.targetId);
    return caseIds.flatMap(cid => this.eventRepo.findByCaseId(cid));
  }
}
