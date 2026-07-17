import { hypothesisService } from '../services/HypothesisService';

export interface InvestigationGap {
  id: string;
  investigationId: string;
  entityId: string;
  gapType: 'UNOWNED_VEHICLE' | 'UNREGISTERED_SIM' | 'UNSUPPORTED_HYPOTHESIS' | 'MISSING_COORDINATES' | 'UNLINKED_FIR';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  remediationStep: string;
}

class GapAnalysisEngineImpl {
  analyzeGaps(investigationId: string, entities: any[] = []): InvestigationGap[] {
    const gaps: InvestigationGap[] = [];

    // Check entity gaps
    for (const entity of entities) {
      if (entity.type === 'VEHICLE' && !entity.ownerId) {
        gaps.push({
          id: `GAP-VEH-${entity.id}`,
          investigationId,
          entityId: entity.id,
          gapType: 'UNOWNED_VEHICLE',
          severity: 'HIGH',
          description: `Vehicle ${entity.regNumber || entity.id} has no registered owner link in the investigation graph.`,
          remediationStep: 'Query RTO vehicle registration database or attach registered owner node.'
        });
      }

      if (entity.type === 'PHONE' && !entity.subscriberId) {
        gaps.push({
          id: `GAP-SIM-${entity.id}`,
          investigationId,
          entityId: entity.id,
          gapType: 'UNREGISTERED_SIM',
          severity: 'CRITICAL',
          description: `Phone number ${entity.phoneNumber || entity.id} has no KYC subscriber profile linked.`,
          remediationStep: 'Issue Telecom KYC inquiry or trace CDR subscriber metadata.'
        });
      }
    }

    // Check hypothesis gaps
    const hypotheses = hypothesisService.getHypothesesForInvestigation(investigationId);
    for (const hyp of hypotheses) {
      if (hyp.supportingEvidenceIds.length === 0) {
        gaps.push({
          id: `GAP-HYP-${hyp.id}`,
          investigationId,
          entityId: hyp.id,
          gapType: 'UNSUPPORTED_HYPOTHESIS',
          severity: 'HIGH',
          description: `Hypothesis "${hyp.statement}" has zero supporting evidence items attached.`,
          remediationStep: 'Attach physical/digital evidence or demote hypothesis status to PROPOSED.'
        });
      }
    }

    return gaps;
  }
}

export const gapAnalysisEngine = new GapAnalysisEngineImpl();
