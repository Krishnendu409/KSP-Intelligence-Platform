import React, { useState } from 'react';
import { deterministicRecommendationEngine } from '../engine/DeterministicRecommendationEngine';
import type { InvestigationRecommendation } from '../engine/DeterministicRecommendationEngine';
import { investigationRepository } from '../services/InvestigationRepository';

interface RecommendationCenterDrawerProps {
  investigationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RecommendationCenterDrawer: React.FC<RecommendationCenterDrawerProps> = ({
  investigationId,
  isOpen,
  onClose
}) => {
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const recommendations = deterministicRecommendationEngine.generateRecommendations(investigationId);

  const handleAccept = (rec: InvestigationRecommendation) => {
    investigationRepository.createTask({
      investigationId,
      title: rec.suggestedTaskTitle,
      description: `[Deterministic Recommendation Acceptance]: ${rec.rationale} Action: ${rec.actionTitle}`,
      priority: rec.priority,
      status: 'TODO'
    });

    setAcceptedIds((prev) => new Set(prev).add(rec.id));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col text-slate-100">
      <div className="flex justify-between items-center border-b border-slate-800 p-4">
        <div>
          <h3 className="text-base font-bold text-sky-400">Deterministic Investigator Assistance Center</h3>
          <p className="text-xs text-slate-400">Capability Increment 5: Actionable Next Steps & Gaps</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-2 py-1 text-xs border border-slate-700 rounded"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {recommendations.length === 0 ? (
          <div className="text-sm text-slate-500 italic text-center py-8">
            No active recommendations. Investigation structure has zero detected evidentiary gaps.
          </div>
        ) : (
          recommendations.map((rec) => {
            const isAccepted = acceptedIds.has(rec.id);
            return (
              <div
                key={rec.id}
                className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      rec.priority === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    Priority: {rec.priority}
                  </span>
                  {rec.targetEntityId && (
                    <span className="text-xs text-slate-400 font-mono">Target: {rec.targetEntityId}</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">{rec.actionTitle}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.rationale}</p>

                <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center">
                  <span className="text-xs text-slate-400">SOP: {rec.suggestedTaskTitle}</span>
                  {isAccepted ? (
                    <span className="text-xs font-semibold text-emerald-400 px-2 py-1 bg-emerald-950/50 rounded border border-emerald-800">
                      SOP Task Created ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAccept(rec)}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold transition"
                    >
                      Accept & Create SOP Task
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
