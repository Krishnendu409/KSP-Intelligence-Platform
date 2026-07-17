import { investigationRepository } from '../services/InvestigationRepository';

export interface InvestigationRecommendation {
  id: string;
  investigationId: string;
  actionTitle: string;
  rationale: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetEntityId?: string;
  suggestedTaskTitle: string;
}

export class DeterministicRecommendationEngine {
  public generateRecommendations(investigationId: string): InvestigationRecommendation[] {
    const entities = investigationRepository.getEntitiesForInvestigation(investigationId);
    const recommendations: InvestigationRecommendation[] = [];

    entities.forEach((entity) => {
      if (entity.type === 'VEHICLE' && (!entity.ownerName || entity.ownerName.trim() === '')) {
        recommendations.push({
          id: `REC-VEH-${entity.id}`,
          investigationId,
          actionTitle: `Request RTO Registration & Ownership Dump for Vehicle [${entity.regNumber || entity.id}]`,
          rationale: 'Vehicle entity has no registered owner or chassis details associated.',
          priority: 'HIGH',
          targetEntityId: entity.id,
          suggestedTaskTitle: `RTO Ownership Verification for ${entity.regNumber || entity.id}`
        });
      }

      if (entity.type === 'PHONE' && entity.hasCdrAttached === false) {
        recommendations.push({
          id: `REC-PH-${entity.id}`,
          investigationId,
          actionTitle: `Request Telecom Tower & CDR Dump for Phone [${entity.phoneNumber || entity.id}]`,
          rationale: 'Phone entity identified in investigation without call detail record (CDR) ingestion.',
          priority: 'HIGH',
          targetEntityId: entity.id,
          suggestedTaskTitle: `Subpoena CDR & Cell Tower Dump for ${entity.phoneNumber || entity.id}`
        });
      }

      if (entity.type === 'PERSON' && (!entity.aadhaarNumber && !entity.panNumber)) {
        recommendations.push({
          id: `REC-PER-${entity.id}`,
          investigationId,
          actionTitle: `Run Identity Database Verification for Person [${entity.name || entity.id}]`,
          rationale: 'Subject lacks government identity numbers (Aadhaar/PAN) to prevent alias collision.',
          priority: 'MEDIUM',
          targetEntityId: entity.id,
          suggestedTaskTitle: `Identity Record Check for ${entity.name || entity.id}`
        });
      }
    });

    return recommendations;
  }
}

export const deterministicRecommendationEngine = new DeterministicRecommendationEngine();
