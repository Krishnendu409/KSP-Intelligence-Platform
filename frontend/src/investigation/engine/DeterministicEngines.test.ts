import { describe, it, expect, beforeEach } from 'vitest';
import { explainabilityEngine } from './ExplainabilityEngine';
import { gapAnalysisEngine } from './GapAnalysisEngine';
import { suggestionEngine } from './SuggestionEngine';
import { investigationRepository } from '../services/InvestigationRepository';
import { hypothesisService } from '../services/HypothesisService';
import { taskService } from '../services/TaskService';

describe('Deterministic Investigative Engines (Gotham / i2 Parity)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
    hypothesisService.clearAll();
    taskService.clearAll();
  });

  it('generates a deterministic ExplanationObject for any entity or risk score', () => {
    const explanation = explainabilityEngine.generateExplanation('PERSON-ARJUN', {
      riskLevel: 'CRITICAL',
      firIds: ['FIR-2026-089', 'FIR-2026-104'],
      evidenceIds: ['EVD-CDR-8819', 'EVD-ANPR-9921']
    });

    expect(explanation.subjectId).toBe('PERSON-ARJUN');
    expect(explanation.conclusion).toBe('CRITICAL_SYNDICATE_KINGPIN');
    expect(explanation.reasons.length).toBeGreaterThan(0);
    expect(explanation.supportingFIRs).toContain('FIR-2026-089');
    expect(explanation.confidenceGrade).toBe('A1');
    expect(explanation.algorithmUsed).toBe('DeterministicMultiHopRuleEngine_v2');
  });

  it('detects structural investigation gaps (unowned vehicles, unregistered SIMs, unsupported hypotheses)', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Gap Test Investigation',
      codeName: 'GAP-TEST'
    });

    // Create an unsupported hypothesis
    hypothesisService.createHypothesis(inv.id, {
      statement: 'Suspect fled to Dubai via sea route',
      supportingEvidenceIds: []
    });

    const gaps = gapAnalysisEngine.analyzeGaps(inv.id, [
      { id: 'VEH-01', type: 'VEHICLE', regNumber: 'KA01AB1234', ownerId: undefined },
      { id: 'PHONE-01', type: 'PHONE', phoneNumber: '+919845011223', subscriberId: undefined }
    ]);

    expect(gaps.length).toBeGreaterThanOrEqual(3);
    const gapTypes = gaps.map(g => g.gapType);
    expect(gapTypes).toContain('UNOWNED_VEHICLE');
    expect(gapTypes).toContain('UNREGISTERED_SIM');
    expect(gapTypes).toContain('UNSUPPORTED_HYPOTHESIS');
  });

  it('generates deterministic rule-based investigative recommendations and converts them to tasks', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Recommendation Test',
      codeName: 'REC-TEST'
    });

    const recs = suggestionEngine.generateRecommendations(inv.id, [
      { id: 'PERSON-ARJUN', type: 'PERSON', name: 'Arjun Sharma', phoneIds: ['PHONE-01'], hasCdr: false },
      { id: 'VEH-01', type: 'VEHICLE', regNumber: 'KA01AB1234', hasAnprSearch: false }
    ]);

    expect(recs.length).toBeGreaterThanOrEqual(2);
    expect(recs.some(r => r.ruleCode === 'RULE_MISSING_CDR')).toBe(true);
    expect(recs.some(r => r.ruleCode === 'RULE_MISSING_ANPR')).toBe(true);

    // Convert recommendation to operational Task
    const task = suggestionEngine.convertRecommendationToTask(inv.id, recs[0], 'Inspector Priya');
    expect(task.title).toContain(recs[0].recommendedAction);
    expect(task.assignedOfficer).toBe('Inspector Priya');

    const tasks = taskService.getTasksForInvestigation(inv.id);
    expect(tasks.length).toBe(1);
  });
});
