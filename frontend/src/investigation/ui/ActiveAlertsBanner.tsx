import React, { useState } from 'react';
import { activeAlertEngine } from '../engine/ActiveAlertEngine';

interface ActiveAlertsBannerProps {
  investigationId: string;
}

export const ActiveAlertsBanner: React.FC<ActiveAlertsBannerProps> = ({ investigationId }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const alerts = activeAlertEngine
    .getAlertsForInvestigation(investigationId)
    .filter((a) => !a.acknowledged);

  if (alerts.length === 0) return null;

  const handleAcknowledge = (alertId: string) => {
    activeAlertEngine.acknowledgeAlert(investigationId, alertId);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div
      key={refreshKey}
      className="bg-rose-950/90 border-b border-rose-800/80 px-6 py-3 flex items-center justify-between text-rose-200 z-40"
    >
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-xs">
          CRITICAL WATCHLIST ALERT
        </span>
        <span className="text-sm font-medium">
          {alerts[0].reason} ({alerts.length} active alert{alerts.length > 1 ? 's' : ''})
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAcknowledge(alerts[0].id)}
          className="px-3 py-1 bg-rose-900 hover:bg-rose-800 border border-rose-700 rounded text-xs font-semibold text-white transition"
        >
          Acknowledge Alert
        </button>
      </div>
    </div>
  );
};
