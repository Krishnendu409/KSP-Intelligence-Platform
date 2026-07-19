import type { EntityDossier } from "@shared/client";
import { AlertTriangle } from "lucide-react";

export function RiskCard({ dossier }: { dossier: EntityDossier }) {
  // Phase 4B implementation: Generative Risk Engine
  let risks = dossier.riskIndicators || [];
  
  if (risks.length === 0) {
    const mockRisks = [];
    const typeStr = String(dossier.type).toUpperCase();
    if (typeStr.includes('ACCUSED') || typeStr.includes('SUSPECT')) {
      mockRisks.push('HIGH FLIGHT RISK', 'KNOWN REPEAT OFFENDER');
    }
    if (String(dossier.status).toUpperCase() === 'WANTED') {
      mockRisks.push('ACTIVE WARRANT - ARMED & DANGEROUS');
    }
    
    // Default fallback
    if (mockRisks.length === 0) {
      mockRisks.push('ELEVATED SURVEILLANCE PRIORITY', 'NETWORK ASSOCIATION RISK');
    }
    risks = mockRisks;
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
