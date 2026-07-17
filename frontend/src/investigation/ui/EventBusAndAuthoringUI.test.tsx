// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IntelligenceAuthoringModal } from './IntelligenceAuthoringModal';
import { OperationalJournalDrawer } from './OperationalJournalDrawer';
import { ActiveAlertsBanner } from './ActiveAlertsBanner';
import { investigationRepository } from '../services/InvestigationRepository';
import { operationalEventBus } from '../events/OperationalEventBus';
import { activeAlertEngine } from '../engine/ActiveAlertEngine';

describe('Event Bus & Intelligence Authoring UI (Capability Increment 4)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
    operationalEventBus.clearAll();
    activeAlertEngine.clearWatchlistsAndAlerts();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders IntelligenceAuthoringModal and authors first-class field intelligence item', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Authoring Case',
      codeName: 'AUTH-100'
    });

    render(
      <IntelligenceAuthoringModal
        investigationId={inv.id}
        officerId="OFFICER-55"
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/Field Intelligence Authoring Workbench/i)).toBeDefined();

    const titleInput = screen.getByTestId('intel-title-input');
    fireEvent.change(titleInput, { target: { value: 'Recovered Burner SIM Card' } });

    const detailsInput = screen.getByTestId('intel-details-input');
    fireEvent.change(detailsInput, { target: { value: 'Seized during vehicle checkpoint search.' } });

    const submitBtn = screen.getByText(/Author & Publish Intelligence/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Successfully published intelligence item/i)).toBeDefined();
  });

  it('renders OperationalJournalDrawer displaying live event stream history', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Journal Case',
      codeName: 'JRN-100'
    });

    operationalEventBus.publish({
      id: 'EVT-01',
      investigationId: inv.id,
      eventType: 'ENTITY_CREATED',
      timestamp: new Date().toISOString(),
      officerId: 'OFFICER-55',
      summary: 'Created Person Profile Arjun Sharma'
    });

    render(<OperationalJournalDrawer investigationId={inv.id} isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Operational Event Stream Journal/i)).toBeDefined();
    expect(screen.getByText(/Created Person Profile Arjun Sharma/i)).toBeDefined();
    expect(screen.getByText(/ENTITY_CREATED/i)).toBeDefined();
  });

  it('renders ActiveAlertsBanner and acknowledges high-priority watchlist hit', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Alert Case',
      codeName: 'ALR-100'
    });

    activeAlertEngine.registerWatchlist({
      id: 'WL-01',
      targetValue: '+919845000000',
      matchType: 'PHONE',
      priority: 'CRITICAL',
      alertReason: 'Monitored Syndicate Kingpin SIM'
    });

    operationalEventBus.publish({
      id: 'EVT-HIT-1',
      investigationId: inv.id,
      eventType: 'INTELLIGENCE_AUTHORED',
      timestamp: new Date().toISOString(),
      officerId: 'OFFICER-10',
      summary: 'Intercepted Call on +919845000000'
    });

    render(<ActiveAlertsBanner investigationId={inv.id} />);

    expect(screen.getByText(/CRITICAL WATCHLIST ALERT/i)).toBeDefined();
    expect(screen.getByText(/Monitored Syndicate Kingpin SIM/i)).toBeDefined();

    const ackBtn = screen.getByText(/Acknowledge Alert/i);
    fireEvent.click(ackBtn);

    // After acknowledging, unacknowledged critical alert badge disappears
    expect(screen.queryByText(/Acknowledge Alert/i)).toBeNull();
  });
});
