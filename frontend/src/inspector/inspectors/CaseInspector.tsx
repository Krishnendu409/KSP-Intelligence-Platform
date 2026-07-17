import React from "react";
import { useInvestigationStore } from "../../workspace/store/useInvestigationStore";
import { FolderOpen, User, ArrowRight } from "lucide-react";

export interface CaseInspectorProps {
  data: {
    id: string;
    title: string;
    status?: string;
    riskLevel?: string;
    leadInvestigator?: string;
    entityIds?: string[];
    description?: string;
  };
}

export const CaseInspector: React.FC<CaseInspectorProps> = ({ data }) => {
  const { setFocusedEntity } = useInvestigationStore();

  const entities = data.entityIds || ["PERSON-001", "PERSON-002", "VEHICLE-001"];

  return (
    <div className="flex flex-col gap-4 text-tactical-200 text-xs">
      {/* Case Header */}
      <div className="flex flex-col gap-2 p-3 rounded bg-tactical-800/80 border border-tactical-700">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-accent-amber font-bold flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            {data.id}
          </span>
          <span className="px-2 py-0.5 rounded text-xxs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
            {data.riskLevel || "HIGH PRIORITY"}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white">
          {data.title || "FIR Investigation Case"}
        </h4>
        {data.leadInvestigator && (
          <div className="text-xxs font-mono text-tactical-400">
            LEAD IO: <span className="text-tactical-200">{data.leadInvestigator}</span>
          </div>
        )}
      </div>

      {/* Case Summary */}
      {data.description && (
        <div className="p-3 rounded bg-tactical-900/60 border border-tactical-800">
          <div className="text-xxs font-mono text-tactical-400 mb-1">FIR SUMMARY</div>
          <p className="text-tactical-200 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Involved Targets / Entities */}
      <div className="flex flex-col gap-2">
        <div className="text-xxs font-mono text-tactical-400 uppercase tracking-wider">
          Involved Entities ({entities.length})
        </div>
        <div className="flex flex-col gap-1.5">
          {entities.map((entityId) => (
            <button
              key={entityId}
              onClick={() => setFocusedEntity(entityId)}
              className="flex items-center justify-between p-2.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-700 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-accent-cyan" />
                <span className="font-mono text-xs text-white">{entityId}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-tactical-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
