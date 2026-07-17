// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RecommendationCenterDrawer } from './RecommendationCenterDrawer';
import { investigationRepository } from '../services/InvestigationRepository';

describe('Workflow Automation & Recommendations UI (Capability Increment 5)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders deterministic recommendations and creates SOP tasks when accepted', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Recommendation UI Case',
      codeName: 'REC-UI-1'
    });

    // Add unowned vehicle entity
    investigationRepository.saveEntity(inv.id, {
      id: 'VEH-99',
      type: 'VEHICLE',
      regNumber: 'MH-02-AB-5555',
      ownerName: ''
    });

    render(<RecommendationCenterDrawer investigationId={inv.id} isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Deterministic Investigator Assistance Center/i)).toBeDefined();
    expect(screen.getByText(/Request RTO Registration & Ownership Dump/i)).toBeDefined();

    const acceptBtn = screen.getByText(/Accept & Create SOP Task/i);
    fireEvent.click(acceptBtn);

    const tasks = investigationRepository.getTasksForInvestigation(inv.id);
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toContain('RTO Ownership Verification');
  });
});
