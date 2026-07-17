import React, { useState } from 'react';
import { Zap, PlusCircle, CheckCircle2 } from 'lucide-react';
import { suggestionEngine } from '../engine/SuggestionEngine';
import type { InvestigationRecommendation } from '../engine/SuggestionEngine';
import type { InvestigationTask } from '../services/TaskService';

export interface ActionableRecommendationsDrawerProps {
  investigationId: string;
  entities?: any[];
  onTaskCreated?: (task: InvestigationTask) => void;
}

export const ActionableRecommendationsDrawer: React.FC<ActionableRecommendationsDrawerProps> = ({
  investigationId,
  entities = [],
  onTaskCreated
}) => {
  const recommendations = suggestionEngine.generateRecommendations(investigationId, entities);
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set());

  const handleConvert = (rec: InvestigationRecommendation) => {
    const task = suggestionEngine.convertRecommendationToTask(investigationId, rec, 'Assigned Officer');
    setConvertedIds(prev => new Set(prev).add(rec.id));
    if (onTaskCreated) {
      onTaskCreated(task);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-tactical-900 border border-tactical-700 rounded-lg text-tactical-100">
      <div className="flex items-center justify-between border-b border-tactical-700 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-cyan" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-accent-cyan">
            Actionable Recommendations Drawer
          </h3>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-tactical-800 border border-tactical-600 text-tactical-300">
          SUGGESTED ACTIONS: {recommendations.length}
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-4 bg-tactical-950/60 rounded border border-tactical-800 text-tactical-400 font-mono text-xs">
          No pending investigative recommendations for current entity set.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recommendations.map((rec) => {
            const isConverted = convertedIds.has(rec.id);
            return (
              <div
                key={rec.id}
                className="p-3.5 bg-tactical-950/80 border border-tactical-700/80 rounded flex flex-col gap-2.5 hover:border-accent-cyan/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">
                    {rec.recommendedAction}
                  </span>
                  <span
                    className={`font-mono text-xxs px-1.5 py-0.5 rounded font-bold ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300'
                        : 'bg-amber-950/80 border border-amber-500/60 text-amber-300'
                    }`}
                  >
                    PRIORITY: {rec.priority}
                  </span>
                </div>

                <p className="text-xs text-tactical-300">{rec.rationale}</p>

                <div className="flex items-center justify-between pt-1 border-t border-tactical-800">
                  <span className="font-mono text-xxs text-tactical-400">TARGET ID: {rec.targetEntityId}</span>
                  {isConverted ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-xxs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Converted to Operational Task</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConvert(rec)}
                      className="px-2.5 py-1 rounded bg-accent-cyan/20 hover:bg-accent-cyan/30 border border-accent-cyan text-accent-cyan font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Convert to Task</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
