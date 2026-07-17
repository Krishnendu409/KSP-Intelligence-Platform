import { describe, it, expect, beforeEach } from 'vitest';
import { workflowRuleEngine } from './WorkflowRuleEngine';
import { deterministicRecommendationEngine } from './DeterministicRecommendationEngine';
import { intelligenceAuthoringEngine } from './IntelligenceAuthoringEngine';
import { investigationRepository } from '../services/InvestigationRepository';
import { operationalEventBus } from '../events/OperationalEventBus';

describe('Workflow Automation & Deterministic Recommendations (Capability Increment 5)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
    operationalEventBus.clearAll();
    workflowRuleEngine.initSubscription();
  });

  it('automatically spawns SOP tasks when a RECOVERED_WEAPON is authored', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Weapon Raid Case',
      codeName: 'WPN-01'
    });

    // Author a recovered weapon intelligence item
    intelligenceAuthoringEngine.authorIntelligence({
      investigationId: inv.id,
      itemType: 'RECOVERED_WEAPON',
      title: 'Seized AK-47 Serial #AK992',
      details: 'Found in vehicle trunk during border checkpoint search.',
      natoAdmiraltyGrade: 'A1',
      authoredByOfficerId: 'OFFICER-RAID'
    });

    const tasks = investigationRepository.getTasksForInvestigation(inv.id);
    expect(tasks.length).toBeGreaterThanOrEqual(3);

    const titles = tasks.map(t => t.title);
    expect(titles).toContain('Forensic Ballistics Examination Task');
    expect(titles).toContain('DNA & Swab Extraction Task');
    expect(titles).toContain('Fingerprint Recovery Task');
  });

  it('generates deterministic actionable recommendations for missing RTO, CDR, and FSL reports', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Syndicate Vehicle & Phone Case',
      codeName: 'SYN-01'
    });

    // Add unowned vehicle entity
    investigationRepository.saveEntity(inv.id, {
      id: 'VEH-001',
      type: 'VEHICLE',
      regNumber: 'DL-01-XX-9999',
      ownerName: '' // Missing owner
    });

    // Add phone entity with no CDR
    investigationRepository.saveEntity(inv.id, {
      id: 'PH-001',
      type: 'PHONE',
      phoneNumber: '+919845011111',
      hasCdrAttached: false
    });

    const recommendations = deterministicRecommendationEngine.generateRecommendations(inv.id);
    expect(recommendations.length).toBeGreaterThanOrEqual(2);

    const rtoRec = recommendations.find(r => r.actionTitle.includes('RTO Registration'));
    expect(rtoRec).toBeDefined();
    expect(rtoRec?.priority).toBe('HIGH');

    const cdrRec = recommendations.find(r => r.actionTitle.includes('Telecom Tower & CDR Dump'));
    expect(cdrRec).toBeDefined();
  });
});
