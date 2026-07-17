import type { EntityDossier } from "@shared/client";
import { AlertTriangle } from "lucide-react";

export function RiskCard({ dossier }: { dossier: EntityDossier }) {
  const risks = dossier.riskIndicators || [];
  
  if (risks.length === 0) {
    return (
      <div className="p-4 border-b border-tactical-600 bg-tactical-900/30">
        <span className="text-xxs font-mono text-tactical-500 uppercase tracking-widest">
          Risk Assessment
        </span>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-tactical-600" />
          <span className="font-mono text-sm text-tactical-400">
            Unavailable
          </span>
        </div>
        <p className="mt-2 text-xs text-tactical-500">
          Risk Engine not implemented. This section activates in Phase 4B.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-tactical-600 bg-tactical-800/40">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-accent-red" />
        <span className="font-mono text-xs text-accent-red uppercase tracking-widest font-bold">Active Risk Indicators</span>
      </div>
      <div className="flex flex-col gap-2">
        {risks.map((risk, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 bg-tactical-900/50 border border-tactical-600 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
            <span className="text-xs font-mono text-tactical-100">{risk}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
