import { describe, it, expect } from 'vitest';
import { getActionableTimelineEvents } from './useTimelineData';

describe('Actionable Timeline Engine (Offline-First & Never Empty)', () => {
  it('returns rich actionable investigation events when no entity is selected or offline', () => {
    const events = getActionableTimelineEvents([]);
    expect(events.length).toBeGreaterThanOrEqual(4);

    const firstEvent = events[0];
    expect(firstEvent.id).toBeDefined();
    expect(firstEvent.timestamp).toBeDefined();
    expect(firstEvent.title).toBeDefined();
    expect(firstEvent.confidenceGrade).toBeDefined();
    expect(firstEvent.evidenceRef).toBeDefined();
    expect(firstEvent.actionLabel).toBeDefined();
    expect(firstEvent.actionHandlerType).toBeDefined();
  });

  it('filters actionable events by target entity ID when selected', () => {
    const allEvents = getActionableTimelineEvents([]);
    const arjunEvents = getActionableTimelineEvents(['PERSON-ARJUN']);

    expect(allEvents.length).toBeGreaterThan(0);
    expect(arjunEvents.length).toBeGreaterThan(0);
    expect(arjunEvents.every(e => e.entityIds.includes('PERSON-ARJUN') || e.entityIds.includes('ALL'))).toBe(true);
  });
});
