import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { gapAnalysisEngine } from '../engine/GapAnalysisEngine';

export interface OperationalDecisionSupportProps {
  investigationId: string;
  entities?: any[];
}

export const OperationalDecisionSupport: React.FC<OperationalDecisionSupportProps> = ({
  investigationId,
  entities = []
}) => {
  const gaps = gapAnalysisEngine.analyzeGaps(investigationId, entities);

  return (
    <div className="flex flex-col gap-4 p-4 bg-tactical-900 border border-tactical-700 rounded-lg text-tactical-100">
      <div className="flex items-center justify-between border-b border-tactical-700 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-300">
            Operational Decision Support — Structural Gap Analysis
          </h3>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-tactical-800 border border-tactical-600 text-tactical-300">
          DETECTED GAPS: {gaps.length}
        </span>
      </div>

      {gaps.length === 0 ? (
        <div className="p-4 bg-tactical-950/60 rounded border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>No structural investigative gaps detected in graph.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="p-3.5 bg-tactical-950/80 border border-tactical-700/80 rounded flex flex-col gap-2 hover:border-amber-500/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-300 uppercase">
                  {gap.gapType}
                </span>
                <span
                  className={`font-mono text-xxs px-1.5 py-0.5 rounded font-bold ${
                    gap.severity === 'CRITICAL'
                      ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300'
                      : 'bg-amber-950/80 border border-amber-500/60 text-amber-300'
                  }`}
                >
                  SEVERITY: {gap.severity}
                </span>
              </div>

              <p className="text-xs text-tactical-200">{gap.description}</p>

              <div className="mt-1 p-2 bg-tactical-900/80 rounded border border-tactical-800 font-mono text-xxs text-accent-cyan flex items-center gap-1.5">
                <span className="font-bold">REMEDIATION STEP:</span>
                <span>{gap.remediationStep}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
