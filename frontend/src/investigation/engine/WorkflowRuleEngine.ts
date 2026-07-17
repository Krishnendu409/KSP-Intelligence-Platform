import { operationalEventBus } from '../events/OperationalEventBus';
import type { OperationalEvent } from '../events/OperationalEventBus';
import { investigationRepository } from '../services/InvestigationRepository';

export class WorkflowRuleEngine {
  private unsubscribeBus: (() => void) | null = null;

  constructor() {
    this.initSubscription();
  }

  public initSubscription(): void {
    if (this.unsubscribeBus) {
      this.unsubscribeBus();
    }
    this.unsubscribeBus = operationalEventBus.subscribe('INTELLIGENCE_AUTHORED', (event: OperationalEvent) => {
      this.evaluateIntelligenceEvent(event);
    });
  }

  private evaluateIntelligenceEvent(event: OperationalEvent): void {
    const item = event.payload?.intelligenceItem;
    if (!item) return;

    if (item.itemType === 'RECOVERED_WEAPON') {
      // Auto generate SOP Forensic & Ballistics tasks
      investigationRepository.createTask({
        investigationId: event.investigationId,
        title: 'Forensic Ballistics Examination Task',
        description: `Perform microscopic rifling and firing pin mark comparison on seized weapon [${item.title}].`,
        priority: 'HIGH',
        status: 'TODO'
      });

      investigationRepository.createTask({
        investigationId: event.investigationId,
        title: 'DNA & Swab Extraction Task',
        description: `Collect touch DNA and epithelial swabs from trigger guard and grip of [${item.title}].`,
        priority: 'HIGH',
        status: 'TODO'
      });

      investigationRepository.createTask({
        investigationId: event.investigationId,
        title: 'Fingerprint Recovery Task',
        description: `Process magazine and bolt assembly for latent prints on [${item.title}].`,
        priority: 'MEDIUM',
        status: 'TODO'
      });

      operationalEventBus.publish({
        id: `EVT-RULE-${Math.floor(Math.random() * 100000)}`,
        investigationId: event.investigationId,
        eventType: 'TASK_ASSIGNED',
        timestamp: new Date().toISOString(),
        officerId: 'SYSTEM_SOP_RULE_ENGINE',
        summary: `Auto-generated 3 Forensic SOP Tasks for Recovered Weapon [${item.title}]`
      });
    } else if (item.itemType === 'PHONE_INTERCEPTION') {
      investigationRepository.createTask({
        investigationId: event.investigationId,
        title: 'Voice Biometric Comparison Task',
        description: `Analyze audio spectrum against known suspect voice exemplars for interception [${item.title}].`,
        priority: 'HIGH',
        status: 'TODO'
      });
    }
  }
}

export const workflowRuleEngine = new WorkflowRuleEngine();
