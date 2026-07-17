import { operationalEventBus } from '../events/OperationalEventBus';
import type { OperationalEvent } from '../events/OperationalEventBus';

export interface WatchlistEntry {
  id: string;
  targetValue: string; // e.g., "+919845088888" or "DL-01-AB-1234"
  matchType: 'PHONE' | 'VEHICLE' | 'PERSON' | 'WEAPON' | 'KEYWORD';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  alertReason: string;
}

export interface ActiveAlert {
  id: string;
  investigationId: string;
  watchlistEntryId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  triggeredByEventId: string;
  triggeredAt: string;
  matchedValue: string;
  acknowledged: boolean;
}

export class ActiveAlertEngine {
  private watchlists: Map<string, WatchlistEntry> = new Map();
  private activeAlerts: Map<string, ActiveAlert[]> = new Map(); // investigationId -> alerts
  private unsubscribeBus: (() => void) | null = null;

  constructor() {
    this.initBusSubscription();
  }

  private initBusSubscription() {
    if (this.unsubscribeBus) {
      this.unsubscribeBus();
    }
    this.unsubscribeBus = operationalEventBus.subscribe('*', (event: OperationalEvent) => {
      this.evaluateEventForAlerts(event);
    });
  }

  public registerWatchlist(entry: WatchlistEntry): WatchlistEntry {
    this.watchlists.set(entry.id, entry);
    return entry;
  }

  public getAlertsForInvestigation(investigationId: string): ActiveAlert[] {
    return this.activeAlerts.get(investigationId) || [];
  }

  public acknowledgeAlert(investigationId: string, alertId: string): boolean {
    const list = this.activeAlerts.get(investigationId);
    if (!list) return false;
    const alert = list.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  private evaluateEventForAlerts(event: OperationalEvent): void {
    // Avoid recursion if the event itself is a WATCHLIST_HIT
    if (event.eventType === 'WATCHLIST_HIT') return;

    const payloadText = JSON.stringify(event.payload || {}).toLowerCase();
    const summaryText = event.summary.toLowerCase();

    this.watchlists.forEach((wl) => {
      const targetLower = wl.targetValue.toLowerCase();
      if (payloadText.includes(targetLower) || summaryText.includes(targetLower)) {
        const alertId = `ALERT-${Math.floor(Math.random() * 100000)}`;
        const alert: ActiveAlert = {
          id: alertId,
          investigationId: event.investigationId,
          watchlistEntryId: wl.id,
          priority: wl.priority,
          reason: `${wl.alertReason} [Matched: ${wl.targetValue}]`,
          triggeredByEventId: event.id,
          triggeredAt: new Date().toISOString(),
          matchedValue: wl.targetValue,
          acknowledged: false
        };

        const list = this.activeAlerts.get(event.investigationId) || [];
        list.push(alert);
        this.activeAlerts.set(event.investigationId, list);

        // Publish WATCHLIST_HIT event
        operationalEventBus.publish({
          id: `EVT-HIT-${alertId}`,
          investigationId: event.investigationId,
          eventType: 'WATCHLIST_HIT',
          timestamp: alert.triggeredAt,
          officerId: 'SYSTEM_ALERT_ENGINE',
          summary: `WATCHLIST HIT (${wl.priority}): ${alert.reason}`,
          payload: { alert }
        });
      }
    });
  }

  public clearWatchlistsAndAlerts(): void {
    this.watchlists.clear();
    this.activeAlerts.clear();
    this.initBusSubscription();
  }
}

export const activeAlertEngine = new ActiveAlertEngine();
