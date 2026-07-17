import { describe, it, expect, beforeEach } from 'vitest';
import { operationalEventBus } from './OperationalEventBus';
import { intelligenceAuthoringEngine } from '../engine/IntelligenceAuthoringEngine';
import { activeAlertEngine } from '../engine/ActiveAlertEngine';
import { investigationRepository } from '../services/InvestigationRepository';

describe('Operational Event Bus & Intelligence Authoring (Capability Increment 4)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
    operationalEventBus.clearAll();
    activeAlertEngine.clearWatchlistsAndAlerts();
  });

  it('publishes and logs operational events to the investigation event journal', () => {
    const eventsReceived: any[] = [];
    const unsubscribe = operationalEventBus.subscribe('ENTITY_CREATED', (e) => {
      eventsReceived.push(e);
    });

    operationalEventBus.publish({
      id: 'EVT-001',
      investigationId: 'INV-101',
      eventType: 'ENTITY_CREATED',
      timestamp: new Date().toISOString(),
      officerId: 'OFFICER-44',
      summary: 'Created Person Entity Rohan Verma',
      payload: { entityId: 'PERSON-101' }
    });

    expect(eventsReceived).toHaveLength(1);
    expect(eventsReceived[0].summary).toBe('Created Person Entity Rohan Verma');

    const history = operationalEventBus.getEventHistory('INV-101');
    expect(history).toHaveLength(1);

    unsubscribe();
  });

  it('authors first-class intelligence items and broadcasts INTELLIGENCE_AUTHORED events', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Syndicate Weapon & Interception Case',
      codeName: 'INTEL-CASE'
    });

    const authoredItem = intelligenceAuthoringEngine.authorIntelligence({
      investigationId: inv.id,
      itemType: 'RECOVERED_WEAPON',
      title: 'Glock 19 Serial #GK-90291 Recovered at Safehouse',
      details: 'Found hidden behind drywall in south bedroom during raid.',
      natoAdmiraltyGrade: 'B2',
      authoredByOfficerId: 'OFFICER-88',
      linkedEntityIds: ['PERSON-ARJUN', 'VEHICLE-DL01']
    });

    expect(authoredItem.id).toBeDefined();
    expect(authoredItem.itemType).toBe('RECOVERED_WEAPON');
    expect(authoredItem.natoAdmiraltyGrade).toBe('B2');

    const journal = operationalEventBus.getEventHistory(inv.id);
    const authEvent = journal.find(e => e.eventType === 'INTELLIGENCE_AUTHORED');
    expect(authEvent).toBeDefined();
    expect(authEvent?.summary).toContain('Glock 19');
  });

  it('automatically triggers ActiveAlerts when intelligence or entities match active watchlists', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Watchlist Operation',
      codeName: 'WATCH-01'
    });

    // Register a high-priority phone watchlist entry
    activeAlertEngine.registerWatchlist({
      id: 'WL-PHONE-1',
      targetValue: '+919845088888',
      matchType: 'PHONE',
      priority: 'CRITICAL',
      alertReason: 'Syndicate burner phone monitored by Counter Terrorism squad'
    });

    // Author an interception report referencing this phone
    intelligenceAuthoringEngine.authorIntelligence({
      investigationId: inv.id,
      itemType: 'PHONE_INTERCEPTION',
      title: 'Intercepted Call on Burner +919845088888',
      details: 'Target discussed safehouse transfer.',
      natoAdmiraltyGrade: 'A1',
      authoredByOfficerId: 'OFFICER-12',
      linkedEntityIds: [],
      attributes: {
        phoneNumber: '+919845088888'
      }
    });

    const activeAlerts = activeAlertEngine.getAlertsForInvestigation(inv.id);
    expect(activeAlerts.length).toBeGreaterThan(0);
    expect(activeAlerts[0].priority).toBe('CRITICAL');
    expect(activeAlerts[0].reason).toContain('Syndicate burner phone monitored');
  });
});
