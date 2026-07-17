import React from 'react';
import { GitBranch, AlertTriangle } from 'lucide-react';

export interface EvidentiaryPathTraceProps {
  subjectId: string;
  conclusion?: string;
  confidenceGrade?: string;
  supportingFIRs?: string[];
  evidenceIds?: string[];
  reasons?: string[];
  onChallenge?: () => void;
}

export const EvidentiaryPathTrace: React.FC<EvidentiaryPathTraceProps> = ({
  subjectId,
  conclusion = 'CONFIRMED_OPERATIVE',
  confidenceGrade = 'A1',
  supportingFIRs = ['Unknown FIR'],
  evidenceIds = ['Unknown Evidence'],
  reasons = ['Systematic linkage via database relationships'],
  onChallenge
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-tactical-900 border border-tactical-700 rounded-lg text-tactical-100">
      <div className="flex items-center justify-between border-b border-tactical-700 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-accent-cyan" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-accent-cyan">
            Evidentiary Path Trace
          </h3>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
          GRADE {confidenceGrade}
        </span>
      </div>

      {/* Target & Conclusion */}
      <div className="p-3 bg-tactical-950/80 border border-tactical-700/80 rounded flex flex-col gap-1">
        <span className="text-xxs font-mono text-tactical-400">SUBJECT IDENTIFIER</span>
        <span className="font-mono text-sm font-bold text-white">{subjectId}</span>
        <span className="text-xs font-semibold text-accent-cyan mt-1">
          DETERMINISTIC CONCLUSION: {conclusion}
        </span>
      </div>

      {/* Supporting FIRs & Evidence Items */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 bg-tactical-950/60 border border-tactical-700/60 rounded flex flex-col gap-1.5">
          <span className="text-xxs font-mono text-tactical-400">LINKED FIR RECORDS</span>
          {supportingFIRs.map((fir, idx) => (
            <span key={idx} className="font-mono text-xs px-1.5 py-0.5 rounded bg-tactical-800 border border-tactical-600 text-tactical-200">
              {fir}
            </span>
          ))}
        </div>

        <div className="p-2.5 bg-tactical-950/60 border border-tactical-700/60 rounded flex flex-col gap-1.5">
          <span className="text-xxs font-mono text-tactical-400">SOURCE EVIDENCE ITEMS</span>
          {evidenceIds.map((evd, idx) => (
            <span key={idx} className="font-mono text-xs px-1.5 py-0.5 rounded bg-tactical-800 border border-tactical-600 text-accent-cyan">
              {evd}
            </span>
          ))}
        </div>
      </div>

      {/* Deterministic Reasons */}
      <div className="flex flex-col gap-2">
        <span className="text-xxs font-mono text-tactical-400">EVIDENTIARY REASONING PATH</span>
        <ul className="flex flex-col gap-1.5 list-disc list-inside text-xs text-tactical-200">
          {reasons.map((reason, idx) => (
            <li key={idx} className="leading-relaxed">{reason}</li>
          ))}
        </ul>
      </div>

      {/* Action: Challenge Intelligence */}
      <div className="border-t border-tactical-700 pt-3 flex justify-end">
        <button
          onClick={onChallenge}
          className="px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/60 text-rose-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Challenge Intelligence</span>
        </button>
      </div>
    </div>
  );
};
