import type { EventRow } from '@shared/repositories/IRepositories';

export interface Timeline {
  caseId: string;
  events: EventRow[];
}

export class TimelineBuilderStage {
  /**
   * Builds chronological timelines from events.
   * Currently groups events by Case and sorts them by timestamp.
   * Timeline ordering is based ONLY on timestamps. No prediction.
   */
  public static execute(events: EventRow[]): Timeline[] {
    const caseMap = new Map<string, EventRow[]>();

    events.forEach(event => {
      if (!event.caseId) return;
      if (!caseMap.has(event.caseId)) {
        caseMap.set(event.caseId, []);
      }
      caseMap.get(event.caseId)!.push(event);
    });

    const timelines: Timeline[] = [];

    caseMap.forEach((caseEvents, caseId) => {
      caseEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      timelines.push({
        caseId,
        events: caseEvents
      });
    });

    return timelines;
  }
}
