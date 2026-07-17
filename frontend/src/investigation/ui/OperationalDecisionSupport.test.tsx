// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OperationalDecisionSupport } from './OperationalDecisionSupport';
import { ActionableRecommendationsDrawer } from './ActionableRecommendationsDrawer';
import { investigationRepository } from '../services/InvestigationRepository';
import { taskService } from '../services/TaskService';

describe('Operational Decision Support & Actionable Recommendations Drawer (Task 5)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
    taskService.clearAll();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders structural investigation gaps clearly categorized by severity and remediation step', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Decision Support Test',
      codeName: 'DST-01'
    });

    render(
      <OperationalDecisionSupport
        investigationId={inv.id}
        entities={[
          { id: 'VEH-99', type: 'VEHICLE', regNumber: 'KA01AB1234', ownerId: undefined },
          { id: 'PHONE-99', type: 'PHONE', phoneNumber: '+919845011223', subscriberId: undefined }
        ]}
      />
    );

    expect(screen.getByText(/UNOWNED_VEHICLE/i)).toBeDefined();
    expect(screen.getByText(/UNREGISTERED_SIM/i)).toBeDefined();
    expect(screen.getByText(/Query RTO vehicle registration database/i)).toBeDefined();
  });

  it('renders actionable recommendations and converts recommendation to operational Task on click', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Recommendations Test',
      codeName: 'REC-01'
    });

    const mockOnTaskCreated = vi.fn();

    render(
      <ActionableRecommendationsDrawer
        investigationId={inv.id}
        entities={[
          { id: 'PERSON-ARJUN', type: 'PERSON', name: 'Arjun Sharma', phoneIds: ['PHONE-01'], hasCdr: false }
        ]}
        onTaskCreated={mockOnTaskCreated}
      />
    );

    expect(screen.getByText(/Request 90-Day CDR/i)).toBeDefined();
    const convertButtons = screen.getAllByText(/Convert to Task/i);
    fireEvent.click(convertButtons[0]);

    expect(mockOnTaskCreated).toHaveBeenCalledTimes(1);
    const tasks = taskService.getTasksForInvestigation(inv.id);
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toContain('Request 90-Day CDR');
  });
});
