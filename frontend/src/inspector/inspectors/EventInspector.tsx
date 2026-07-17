import React from "react";
import { useInvestigationStore } from "../../workspace/store/useInvestigationStore";
import { Calendar, MapPin, Folder, User } from "lucide-react";

export interface EventInspectorProps {
  data: {
    id: string;
    timestamp: string;
    type: string;
    title?: string;
    description: string;
    coordinates?: [number, number];
    entityId?: string;
    caseId?: string;
    evidenceCount?: number;
  };
}

export const EventInspector: React.FC<EventInspectorProps> = ({ data }) => {
  const { navigateTo, setMapViewport, setFocusedEntity } = useInvestigationStore();

  const handlePanMap = () => {
    if (data.coordinates) {
      setMapViewport({
        longitude: data.coordinates[0],
        latitude: data.coordinates[1],
        zoom: 15
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 text-tactical-200 text-xs">
      {/* Header Info */}
      <div className="flex flex-col gap-1.5 p-3 rounded bg-tactical-800/80 border border-tactical-700">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-xxs font-mono font-bold bg-accent-amber/20 text-accent-amber border border-accent-amber/40">
            {data.type?.toUpperCase() || "EVENT"}
          </span>
          <span className="font-mono text-xxs text-tactical-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(data.timestamp).toLocaleString()}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white mt-1">
          {data.title || data.description || "Intelligence Event"}
        </h4>
      </div>

      {/* Description */}
      <div className="p-3 rounded bg-tactical-900/60 border border-tactical-800">
        <div className="text-xxs font-mono text-tactical-400 mb-1">EVENT NARRATIVE</div>
        <p className="text-tactical-200 leading-relaxed">
          {data.description}
        </p>
      </div>

      {/* Geospatial Action */}
      {data.coordinates && (
        <div className="p-3 rounded bg-tactical-800/60 border border-tactical-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent-cyan" />
            <span className="font-mono text-xxs text-tactical-300">
              GEO: {data.coordinates[1].toFixed(4)}, {data.coordinates[0].toFixed(4)}
            </span>
          </div>
          <button
            onClick={handlePanMap}
            className="px-2.5 py-1 rounded bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan font-mono text-xxs border border-accent-cyan/40 transition-colors"
          >
            PAN MAP →
          </button>
        </div>
      )}

      {/* Links & Pivots */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="text-xxs font-mono text-tactical-400 uppercase tracking-wider">Associated Records</div>
        <div className="grid grid-cols-1 gap-2">
          {data.caseId && (
            <button
              onClick={() => navigateTo({ type: "CASE", id: data.caseId!, label: `Case: ${data.caseId}` })}
              className="flex items-center justify-between p-2.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-700 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-accent-amber" />
                <span className="font-mono text-xs text-white">Case: {data.caseId}</span>
              </div>
              <span className="text-xxs font-mono text-accent-amber">VIEW FIR →</span>
            </button>
          )}

          {data.entityId && (
            <button
              onClick={() => setFocusedEntity(data.entityId!, data.entityId)}
              className="flex items-center justify-between p-2.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-700 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent-cyan" />
                <span className="font-mono text-xs text-white">Entity: {data.entityId}</span>
              </div>
              <span className="text-xxs font-mono text-accent-cyan">OPEN DOSSIER →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
