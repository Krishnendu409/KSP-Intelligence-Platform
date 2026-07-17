export interface OperationalEvent {
  id: string;
  investigationId: string;
  eventType:
    | 'ENTITY_CREATED'
    | 'INTELLIGENCE_AUTHORED'
    | 'EVIDENCE_ATTACHED'
    | 'HYPOTHESIS_CREATED'
    | 'TASK_ASSIGNED'
    | 'WATCHLIST_HIT'
    | 'FIR_INGESTED'
    | string;
  timestamp: string;
  officerId: string;
  summary: string;
  payload?: any;
}

export type EventSubscriber = (event: OperationalEvent) => void;

export class OperationalEventBus {
  private subscribers: Map<string, Set<EventSubscriber>> = new Map();
  private eventHistory: Map<string, OperationalEvent[]> = new Map(); // investigationId -> events

  public subscribe(eventType: string, subscriber: EventSubscriber): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(subscriber);

    return () => {
      const set = this.subscribers.get(eventType);
      if (set) {
        set.delete(subscriber);
      }
    };
  }

  public publish(event: OperationalEvent): void {
    // Record to operational journal
    const list = this.eventHistory.get(event.investigationId) || [];
    list.push(event);
    this.eventHistory.set(event.investigationId, list);

    // Notify type-specific subscribers
    const specificSubscribers = this.subscribers.get(event.eventType);
    if (specificSubscribers) {
      specificSubscribers.forEach((sub) => {
        try {
          sub(event);
        } catch (err) {
          console.error(`Error in EventSubscriber for ${event.eventType}:`, err);
        }
      });
    }

    // Notify wildcard (*) subscribers
    const wildcardSubscribers = this.subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach((sub) => {
        try {
          sub(event);
        } catch (err) {
          console.error(`Error in wildcard EventSubscriber:`, err);
        }
      });
    }
  }

  public getEventHistory(investigationId: string): OperationalEvent[] {
    return this.eventHistory.get(investigationId) || [];
  }

  public getAllEvents(): OperationalEvent[] {
    const all: OperationalEvent[] = [];
    this.eventHistory.forEach((events) => {
      all.push(...events);
    });
    return all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public clearAll(): void {
    this.subscribers.clear();
    this.eventHistory.clear();
  }
}

export const operationalEventBus = new OperationalEventBus();
