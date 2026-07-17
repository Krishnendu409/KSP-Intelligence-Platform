import React from "react";
import { useInvestigationStore } from "../../workspace/store/useInvestigationStore";
import { FolderOpen, User } from "lucide-react";

export interface EvidenceInspectorProps {
  data: {
    id: string;
    title: string;
    category?: "DIGITAL" | "FORENSIC" | "FINANCIAL" | "CCTV" | "STATEMENT";
    caseReference?: string;
    description: string;
    timestamp?: string;
    linkedEntityIds?: string[];
  };
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({ data }) => {
  const { setFocusedEntity, navigateTo } = useInvestigationStore();

  const linkedEntities = data.linkedEntityIds || ["PERSON-001"];

  return (
    <div className="flex flex-col gap-4 text-tactical-200 text-xs">
      {/* Evidence Header */}
      <div className="flex flex-col gap-2 p-3 rounded bg-tactical-800/80 border border-tactical-700">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-xxs font-mono font-bold bg-accent-amber/20 text-accent-amber border border-accent-amber/40">
            {data.category || "EXHIBIT / EVIDENCE"}
          </span>
          <span className="font-mono text-xxs text-tactical-400">
            ID: {data.id}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white mt-1">
          {data.title}
        </h4>
        {data.caseReference && (
          <button
            onClick={() => navigateTo({ type: "CASE", id: data.caseReference! })}
            className="flex items-center gap-1.5 font-mono text-xxs text-accent-amber hover:underline mt-1"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>CASE FIR: {data.caseReference}</span>
          </button>
        )}
      </div>

      {/* Narrative & Details */}
      <div className="p-3 rounded bg-tactical-900/60 border border-tactical-800">
        <div className="text-xxs font-mono text-tactical-400 mb-1">EVIDENCE SUMMARY & ANALYSIS</div>
        <p className="text-tactical-200 leading-relaxed">{data.description}</p>
      </div>

      {/* Linked Entities */}
      <div className="flex flex-col gap-2">
        <div className="text-xxs font-mono text-tactical-400 uppercase tracking-wider">
          Linked Entities ({linkedEntities.length})
        </div>
        <div className="flex flex-col gap-1.5">
          {linkedEntities.map((entityId) => (
            <button
              key={entityId}
              onClick={() => setFocusedEntity(entityId)}
              className="flex items-center justify-between p-2.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-700 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-accent-cyan" />
                <span className="font-mono text-xs text-white">{entityId}</span>
              </div>
              <span className="text-xxs font-mono text-accent-cyan">OPEN DOSSIER →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
