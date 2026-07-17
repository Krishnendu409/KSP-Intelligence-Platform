import { taskService } from '../services/TaskService';
import type { InvestigationTask } from '../services/TaskService';

export interface InvestigationRecommendation {
  id: string;
  investigationId: string;
  targetEntityId: string;
  ruleCode: 'RULE_MISSING_CDR' | 'RULE_MISSING_ANPR' | 'RULE_MISSING_BALLISTICS' | 'RULE_MISSING_FIU';
  recommendedAction: string;
  rationale: string;
  priority: 'CRITICAL' | 'HIGH' | 'ROUTINE';
}

class SuggestionEngineImpl {
  generateRecommendations(investigationId: string, entities: any[] = []): InvestigationRecommendation[] {
    const recommendations: InvestigationRecommendation[] = [];

    for (const entity of entities) {
      if (entity.type === 'PERSON' && entity.phoneIds && entity.phoneIds.length > 0 && !entity.hasCdr) {
        recommendations.push({
          id: `REC-CDR-${entity.id}`,
          investigationId,
          targetEntityId: entity.id,
          ruleCode: 'RULE_MISSING_CDR',
          recommendedAction: `Request 90-Day CDR for ${entity.name || entity.id}`,
          rationale: 'Suspect operates active mobile identifiers without uploaded Call Data Record analysis.',
          priority: 'CRITICAL'
        });
      }

      if (entity.type === 'VEHICLE' && !entity.hasAnprSearch) {
        recommendations.push({
          id: `REC-ANPR-${entity.id}`,
          investigationId,
          targetEntityId: entity.id,
          ruleCode: 'RULE_MISSING_ANPR',
          recommendedAction: `Run ANPR Corridor Search for ${entity.regNumber || entity.id}`,
          rationale: 'Vehicle linked to syndicate without automated license plate reader checkpoint logs.',
          priority: 'HIGH'
        });
      }
    }

    return recommendations;
  }

  convertRecommendationToTask(
    investigationId: string,
    rec: InvestigationRecommendation,
    assignedOfficer: string = 'Unassigned Officer'
  ): InvestigationTask {
    return taskService.createTask(investigationId, {
      title: rec.recommendedAction,
      priority: rec.priority,
      assignedOfficer,
      linkedEntityIds: [rec.targetEntityId],
      comments: [rec.rationale]
    });
  }
}

export const suggestionEngine = new SuggestionEngineImpl();
