import React from 'react';
import { GitBranch, AlertTriangle, ArrowRight } from 'lucide-react';

export interface RelationshipConfidenceExplorerProps {
  sourceId: string;
  sourceName?: string;
  targetId: string;
  targetName?: string;
  relationType: string;
  confidenceGrade?: string;
  firId?: string;
  evidenceRef?: string;
  rationale?: string;
  onChallengeEdge?: () => void;
}

export const RelationshipConfidenceExplorer: React.FC<RelationshipConfidenceExplorerProps> = ({
  sourceId,
  sourceName,
  targetId,
  targetName,
  relationType,
  confidenceGrade = 'A1',
  firId = 'FIR-2026-089',
  evidenceRef = 'EVD-FIN-4421',
  rationale = 'Corroborated financial clearing ledger entry between subject nodes',
  onChallengeEdge
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-tactical-900 border border-tactical-700 rounded-lg text-tactical-100">
      <div className="flex items-center justify-between border-b border-tactical-700 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-accent-cyan" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-accent-cyan">
            Relationship Confidence Explorer
          </h3>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
          GRADE {confidenceGrade}
        </span>
      </div>

      {/* Edge Directed Graph Display */}
      <div className="p-3 bg-tactical-950/80 border border-tactical-700/80 rounded flex items-center justify-between font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-xxs text-tactical-400">SOURCE NODE</span>
          <span className="font-bold text-white">{sourceName || sourceId}</span>
        </div>
        <div className="flex flex-col items-center px-3">
          <span className="text-xxs text-accent-cyan uppercase font-semibold">{relationType}</span>
          <ArrowRight className="w-4 h-4 text-tactical-400 my-0.5" />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xxs text-tactical-400">TARGET NODE</span>
          <span className="font-bold text-white">{targetName || targetId}</span>
        </div>
      </div>

      {/* Originating FIR & Evidence */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 bg-tactical-950/60 border border-tactical-700/60 rounded flex flex-col gap-1">
          <span className="text-xxs font-mono text-tactical-400">ORIGINATING FIR</span>
          <span className="font-mono text-tactical-200">{firId}</span>
        </div>
        <div className="p-2.5 bg-tactical-950/60 border border-tactical-700/60 rounded flex flex-col gap-1">
          <span className="text-xxs font-mono text-tactical-400">SUPPORTING EVIDENCE</span>
          <span className="font-mono text-accent-cyan">{evidenceRef}</span>
        </div>
      </div>

      {/* Rationale */}
      <div className="flex flex-col gap-1 text-xs">
        <span className="text-xxs font-mono text-tactical-400">DETERMINISTIC EDGE RATIONALE</span>
        <p className="text-tactical-200 leading-relaxed bg-tactical-950/40 p-2.5 rounded border border-tactical-800">
          {rationale}
        </p>
      </div>

      {/* Challenge Action */}
      <div className="border-t border-tactical-700 pt-3 flex justify-end">
        <button
          onClick={onChallengeEdge}
          className="px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/60 text-rose-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Challenge Relationship</span>
        </button>
      </div>
    </div>
  );
};
