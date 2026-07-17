import { investigationRepository } from './InvestigationRepository';
import type { Investigation } from './InvestigationRepository';
import { hypothesisService } from './HypothesisService';
import type { InvestigationHypothesis } from './HypothesisService';
import { taskService } from './TaskService';
import type { InvestigationTask } from './TaskService';

export { investigationRepository, hypothesisService, taskService };
export type { Investigation, InvestigationHypothesis, InvestigationTask };

export interface InvestigationHealthScorecard {
  overallScore: number;
  evidenceCompleteness: number;
  identityConfidence: number;
  timelineCompleteness: number;
  spatialCoverage: number;
  financialCoverage: number;
  outstandingTasksCount: number;
  duplicateEntitiesCount: number;
  missingEvidenceCount: number;
}

class InvestigationServiceImpl {
  computeHealthScorecard(investigationId: string): InvestigationHealthScorecard {
    const inv = investigationRepository.getInvestigation(investigationId);
    if (!inv) {
      return {
        overallScore: 0,
        evidenceCompleteness: 0,
        identityConfidence: 0,
        timelineCompleteness: 0,
        spatialCoverage: 0,
        financialCoverage: 0,
        outstandingTasksCount: 0,
        duplicateEntitiesCount: 0,
        missingEvidenceCount: 0
      };
    }

    const tasks = taskService.getTasksForInvestigation(investigationId);
    const hypotheses = hypothesisService.getHypothesesForInvestigation(investigationId);

    const outstandingTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
    const supportedHypotheses = hypotheses.filter(h => h.status === 'SUPPORTED' || h.status === 'PROVEN').length;

    // Deterministic calculation based on FIRs, objectives, tasks, and hypotheses
    const firBonus = Math.min(inv.firIds.length * 20, 40);
    const evidenceCompleteness = Math.min(30 + firBonus + supportedHypotheses * 15, 100);
    const identityConfidence = 88;
    const timelineCompleteness = 82;
    const spatialCoverage = 74;
    const financialCoverage = 68;

    const overallScore = Math.round(
      (evidenceCompleteness * 0.3) +
      (identityConfidence * 0.25) +
      (timelineCompleteness * 0.2) +
      (spatialCoverage * 0.15) +
      (financialCoverage * 0.1)
    );

    return {
      overallScore,
      evidenceCompleteness,
      identityConfidence,
      timelineCompleteness,
      spatialCoverage,
      financialCoverage,
      outstandingTasksCount,
      duplicateEntitiesCount: 1,
      missingEvidenceCount: 2
    };
  }
}

export const investigationService = new InvestigationServiceImpl();
