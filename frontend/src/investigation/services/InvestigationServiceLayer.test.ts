import { describe, it, expect, beforeEach } from 'vitest';
import {
  investigationRepository,
  investigationService,
  hypothesisService,
  taskService,
} from './InvestigationService';

describe('Investigation Service Layer (Gotham / i2 Parity)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
  });

  it('creates, retrieves, and updates an Investigation object (Operation Nightfall)', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Operation Nightfall - Kingpin & Syndicate Nexus',
      codeName: 'NIGHTFALL',
      objectives: ['Identify Hawala Layering Network', 'Locate Abducted Victim'],
      leadOfficer: 'DSP Ramesh Kumar',
      caseIds: ['CASE-2026-089'],
      firIds: ['FIR-2026-089', 'FIR-2026-104']
    });

    expect(inv.id).toBeDefined();
    expect(inv.codeName).toBe('NIGHTFALL');

    const fetched = investigationRepository.getInvestigation(inv.id);
    expect(fetched?.title).toBe('Operation Nightfall - Kingpin & Syndicate Nexus');
    expect(fetched?.firIds).toContain('FIR-2026-089');
  });

  it('computes an enterprise Investigation Health Scorecard', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Operation Nightfall',
      codeName: 'NIGHTFALL',
      objectives: ['Dismantle syndicate'],
      leadOfficer: 'Inspector Priya',
      caseIds: ['CASE-01'],
      firIds: ['FIR-01']
    });

    // Add hypotheses and tasks
    hypothesisService.createHypothesis(inv.id, {
      statement: 'Arjun Sharma is the primary hawala coordinator',
      confidenceGrade: 'A1',
      status: 'SUPPORTED',
      supportingEvidenceIds: ['EVD-CDR-8819', 'EVD-ANPR-9921']
    });

    taskService.createTask(inv.id, {
      title: 'Collect Bank Ledger for Account #99182',
      priority: 'HIGH',
      assignedOfficer: 'SI Verma',
      status: 'IN_PROGRESS',
      linkedEntityIds: ['PERSON-ARJUN']
    });

    const scorecard = investigationService.computeHealthScorecard(inv.id);
    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallScore).toBeLessThanOrEqual(100);
    expect(scorecard.identityConfidence).toBeDefined();
    expect(scorecard.evidenceCompleteness).toBeDefined();
    expect(scorecard.outstandingTasksCount).toBe(1);
  });

  it('manages hypotheses through their complete lifecycle', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Syndicate Check',
      codeName: 'SYNDICATE-1'
    });

    const hyp = hypothesisService.createHypothesis(inv.id, {
      statement: 'Safehouse is located near Hebbal Flyover',
      confidenceGrade: 'B2',
      status: 'PROPOSED'
    });

    expect(hyp.status).toBe('PROPOSED');

    const updated = hypothesisService.updateStatus(hyp.id, 'SUPPORTED', ['EVD-CCTV-1102']);
    expect(updated?.status).toBe('SUPPORTED');
    expect(updated?.supportingEvidenceIds).toContain('EVD-CCTV-1102');
  });

  it('creates and assigns tasks linked directly to entities and evidence', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Task Check',
      codeName: 'TASK-1'
    });

    const task = taskService.createTask(inv.id, {
      title: 'Verify Alibi of Suspect via CDR triangulation',
      priority: 'CRITICAL',
      assignedOfficer: 'Inspector Priya',
      dueDate: '2026-07-14',
      linkedEntityIds: ['PERSON-VIKRAM'],
      linkedEvidenceIds: ['EVD-CDR-002']
    });

    expect(task.priority).toBe('CRITICAL');
    expect(task.linkedEntityIds).toContain('PERSON-VIKRAM');

    const invTasks = taskService.getTasksForInvestigation(inv.id);
    expect(invTasks.length).toBe(1);
    expect(invTasks[0].title).toBe('Verify Alibi of Suspect via CDR triangulation');
  });
});
