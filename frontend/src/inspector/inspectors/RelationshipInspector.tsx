import React from "react";
import { useInvestigationStore } from "../../workspace/store/useInvestigationStore";
import { ArrowRight, FileText } from "lucide-react";

export interface RelationshipInspectorProps {
  data: {
    id: string;
    sourceId: string;
    sourceName?: string;
    targetId: string;
    targetName?: string;
    type: string;
    confidence: number;
    evidence?: string[];
  };
}

export const RelationshipInspector: React.FC<RelationshipInspectorProps> = ({ data }) => {
  const { setFocusedEntity } = useInvestigationStore();

  const confidencePercent = Math.round((data.confidence || 0.85) * 100);
  const evidenceList = data.evidence || [
    "Call Detail Record (CDR) Tower Handshake — 2026-03-14",
    "CCTV Co-presence outside Metro Station — 2026-03-12"
  ];

  return (
    <div className="flex flex-col gap-4 text-tactical-200 text-xs">
      {/* Link Header */}
      <div className="flex flex-col gap-3 p-3 rounded bg-tactical-800/80 border border-tactical-700">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-xxs font-mono font-bold bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
            {data.type?.toUpperCase() || "ASSOCIATE"}
          </span>
          <span className="font-mono text-xxs text-tactical-400">
            CONFIDENCE: {confidencePercent}%
          </span>
        </div>

        {/* Directed Link */}
        <div className="flex items-center justify-between bg-tactical-900/80 p-2.5 rounded border border-tactical-700">
          <button
            onClick={() => setFocusedEntity(data.sourceId)}
            className="flex flex-col text-left hover:text-accent-cyan transition-colors"
          >
            <span className="font-mono text-xxs text-tactical-400">SOURCE</span>
            <span className="font-semibold text-white text-xs">{data.sourceName || data.sourceId}</span>
          </button>

          <ArrowRight className="w-4 h-4 text-accent-cyan shrink-0 mx-2" />

          <button
            onClick={() => setFocusedEntity(data.targetId)}
            className="flex flex-col text-right hover:text-accent-cyan transition-colors"
          >
            <span className="font-mono text-xxs text-tactical-400">TARGET</span>
            <span className="font-semibold text-white text-xs">{data.targetName || data.targetId}</span>
          </button>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="flex flex-col gap-1.5 p-3 rounded bg-tactical-900/60 border border-tactical-800">
        <div className="flex items-center justify-between font-mono text-xxs">
          <span className="text-tactical-400">INTELLIGENCE CONFIDENCE SCORE</span>
          <span className="text-accent-cyan font-bold">{confidencePercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-tactical-800 rounded overflow-hidden">
          <div
            className="h-full bg-accent-cyan"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Supporting Evidence List */}
      <div className="flex flex-col gap-2">
        <div className="text-xxs font-mono text-tactical-400 uppercase tracking-wider">
          Supporting Evidence ({evidenceList.length})
        </div>
        <div className="flex flex-col gap-1.5">
          {evidenceList.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded bg-tactical-800 border border-tactical-700 flex items-start gap-2.5"
            >
              <FileText className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
              <span className="text-tactical-200 leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
