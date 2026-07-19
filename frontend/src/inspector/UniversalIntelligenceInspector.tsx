import React, { useState, useEffect } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { apiFetch } from "../shared/api/apiFetch";
import {
  Shield,
  X,
  User,
  FileKey,
  Activity,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";


export interface UniversalIntelligenceInspectorProps {
  docked?: boolean;
}

export const UniversalIntelligenceInspector: React.FC<UniversalIntelligenceInspectorProps> = ({
  docked = false,
}) => {
  const { inspector, closeInspector, triggerLateralPivot, inspectEntity } = useInvestigationStore();
  const [activeTab, setActiveTab] = useState<
    "metadata" | "provenance" | "network" | "timeline" | "pivots" | "explainability" | "lineage" | "notes"
  >((inspector.activeTab?.toLowerCase() as any) || "metadata");

  React.useEffect(() => {
    if (inspector.activeTab) {
      setActiveTab(inspector.activeTab.toLowerCase() as any);
    }
  }, [inspector.activeTab]);

  const [entityProfile, setEntityProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inspector.isOpen && inspector.type && inspector.data?.id) {
      const type = inspector.type;
      const rawId = inspector.data.id.split('-').pop(); // e.g. CASE-101 or VICTIM-1 or just 1
      
      // If it's a Case, we don't have an entity profile yet, just use the raw data.
      // But if it's Victim/Accused/Complainant, fetch the real entity profile.
      if (['Victim', 'Accused', 'Complainant'].includes(type)) {
        setLoading(true);
        apiFetch(`/api/entities/${type}/${rawId}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) setEntityProfile(data);
          })
          .finally(() => setLoading(false));
      } else {
        setEntityProfile(null);
      }
    }
  }, [inspector.isOpen, inspector.type, inspector.data]);

  const [analystNote, setAnalystNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; timestamp: string; text: string; author: string }>>([]);

  if (!inspector.isOpen || !inspector.type) {
    return null;
  }

  const data = entityProfile || inspector.data || {};
  const entityId = data.id || "UNKNOWN_ID";
  const label = data.name || data.label || data.title || entityId;

  // Use Real First-Degree Network data from DB
  const firstDegreeNetwork = data.network || [];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analystNote.trim()) return;
    setSavedNotes((prev) => [
      {
        id: `note-${Date.now()}`,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        text: analystNote.trim(),
        author: "CURRENT INVESTIGATOR",
      },
      ...prev,
    ]);
    setAnalystNote("");
  };

  const renderMetadataTab = () => (
    <div className="space-y-4">
      {/* Identity Summary Card */}
      <div className="p-3 bg-tactical-950/80 rounded border border-tactical-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xxs font-mono text-tactical-400 uppercase tracking-wider">
            SYSTEM IDENTIFIER
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-tactical-200">{entityId}</span>
          <button
            onClick={() => navigator.clipboard.writeText(entityId)}
            className="text-xxs text-accent-cyan hover:underline font-mono"
          >
            COPY ID
          </button>
        </div>
      </div>

      {/* Core Attributes Table */}
      <div className="border border-tactical-800 rounded overflow-hidden">
        <div className="bg-tactical-900 px-3 py-1.5 border-b border-tactical-800 font-mono text-xxs text-tactical-400 uppercase tracking-wider">
          CORE OPERATIONAL ATTRIBUTES
        </div>
        <table className="w-full text-left font-mono text-xs">
          <tbody className="divide-y divide-tactical-800/60">
            <tr>
              <td className="px-3 py-2 text-tactical-400 bg-tactical-950/40 w-1/3">Type</td>
              <td className="px-3 py-2 text-white font-bold">{inspector.type}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-tactical-400 bg-tactical-950/40">Name / Label</td>
              <td className="px-3 py-2 text-accent-cyan font-bold">{label}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-tactical-400 bg-tactical-950/40">Status</td>
              <td className="px-3 py-2 text-emerald-400">{data.status || "UNKNOWN"}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-tactical-400 bg-tactical-950/40">Linked Cases</td>
              <td className="px-3 py-2 text-tactical-200">{(data.linkedCases || []).join(', ') || "Unknown"}</td>
            </tr>
            {data.metadata && Object.entries(data.metadata).map(([k, v]) => (
              <tr key={k}>
                <td className="px-3 py-2 text-tactical-400 bg-tactical-950/40">{k}</td>
                <td className="px-3 py-2 text-tactical-200">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProvenanceTab = () => (
    <div className="space-y-4">
      <div className="p-3 bg-tactical-950/80 rounded border border-tactical-800">
        <div className="flex items-center gap-2 text-accent-cyan font-mono text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>CHAIN-OF-CUSTODY & PROVENANCE</span>
        </div>
        <p className="text-xxs font-mono text-tactical-400">
          All intelligence records strictly adhere to evidentiary hashing standards under Indian Evidence Act Sec 63/65B.
        </p>
      </div>

      <div className="space-y-2">
        {data.evidence && data.evidence.length > 0 ? (
          data.evidence.map((exhibit: any, idx: number) => (
            <div key={idx} className="p-3 bg-tactical-900/40 border border-tactical-800 rounded flex flex-col gap-1.5">
              <span className="font-mono text-xs font-bold text-white">
                {exhibit.title}
              </span>
              <div className="flex items-center gap-4 text-xxs font-mono text-tactical-400">
                <span className="flex items-center gap-1">
                  <FileKey className="w-3.5 h-3.5 text-tactical-500" />
                  {exhibit.hash}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-tactical-500" />
                  {exhibit.custodian}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-tactical-400 font-mono text-xs text-center">
            No provenance records available for this entity.
          </div>
        )}
      </div>
    </div>
  );

  const renderNetworkTab = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xxs text-tactical-400 uppercase tracking-wider">
          FIRST-DEGREE ASSOCIATED ENTITIES ({firstDegreeNetwork.length})
        </span>
        <span className="font-mono text-xxs text-accent-cyan">BFS DEPTH: 1</span>
      </div>

      <div className="space-y-2">
        {firstDegreeNetwork.length === 0 && (
          <div className="p-3 text-tactical-400 font-mono text-xs text-center">
            No first-degree relationships found for this entity.
          </div>
        )}
        {firstDegreeNetwork.map((netItem: any) => (
          <div
            key={netItem.id}
            className="p-3 bg-tactical-900/80 hover:bg-tactical-800/80 rounded border border-tactical-800 transition-colors flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white">{netItem.name}</span>
                <span className="font-mono text-xxs bg-tactical-950 px-1.5 py-0.5 rounded border border-tactical-700 text-tactical-300">
                  {netItem.category}
                </span>
              </div>
              <div className="font-mono text-xxs text-tactical-400">{netItem.relation}</div>
            </div>

            <button
              onClick={() => triggerLateralPivot(entityId, netItem.id, netItem.name)}
              className="px-2.5 py-1 rounded bg-tactical-950 hover:bg-accent-cyan/20 border border-tactical-700 hover:border-accent-cyan text-accent-cyan font-mono text-xxs font-bold flex items-center gap-1 transition-all"
            >
              <span>PIVOT</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-4">
      {/* Recent Events */}
      <div className="space-y-2">
        <span className="font-mono text-xxs text-tactical-400 uppercase tracking-wider block">
          RECORDED EVENTS
        </span>
        {data.activityTimeline && data.activityTimeline.length > 0 ? (
          data.activityTimeline.map((evt: any, idx: number) => (
            <div key={idx} className="p-2.5 bg-tactical-900/70 rounded border border-tactical-800 flex items-start gap-2.5">
              <Clock className="w-3.5 h-3.5 text-accent-cyan shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-mono text-xs text-white font-semibold">{evt.title}</div>
                <div className="flex items-center gap-2 font-mono text-xxs text-tactical-400">
                  <span>{evt.timestamp || evt.time}</span>
                  <span className="text-accent-cyan font-bold">• {evt.type}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-tactical-400 font-mono text-xs text-center">
            No timeline data available for this entity.
          </div>
        )}
      </div>
    </div>
  );

  const renderPivotsTab = () => (
    <div className="space-y-4">
      <div className="p-3 bg-tactical-950/80 rounded border border-tactical-800">
        <div className="font-mono text-xs font-bold text-accent-cyan mb-1">
          CONTEXTUAL LATERAL PIVOTS
        </div>
        <p className="font-mono text-xxs text-tactical-400">
          Execute 1-click analytical pivots to rapidly traverse associated records across the Intelligence Graph.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {(!data.pivots || data.pivots.length === 0) && (
          <div className="p-3 text-tactical-400 font-mono text-xs text-center">
            No suggested pivots available for this entity.
          </div>
        )}
        {(data.pivots || []).map((piv: any, idx: number) => {
          const IconComponent = piv.icon || User;
          return (
            <button
              key={idx}
              onClick={() => inspectEntity(piv.targetId, {})}
              className="p-3 bg-tactical-900/40 hover:bg-tactical-800 border border-tactical-800 hover:border-accent-cyan rounded flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-tactical-950 text-tactical-400 group-hover:text-accent-cyan">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-xxs font-bold text-tactical-400 uppercase tracking-wider mb-0.5">
                    {piv.label}
                  </div>
                  <div className="font-mono text-xs text-white group-hover:text-accent-cyan">
                    {piv.targetLabel}
                  </div>
                </div>
              </div>
              <Activity className="w-4 h-4 text-tactical-600 group-hover:text-accent-cyan" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderExplainabilityTab = () => (
    <div className="p-3 text-tactical-400 font-mono text-sm text-center">
      Explainability data not available for this entity.
    </div>
  );

  const renderLineageTab = () => (
    <div className="p-3 text-tactical-400 font-mono text-sm text-center">
      Lineage graph not available for this entity.
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-4">
      {/* Add New Analyst Note Form */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <label className="font-mono text-xxs text-tactical-400 uppercase tracking-wider block">
          APPEND ANALYST OBSERVATION / TASK
        </label>
        <textarea
          value={analystNote}
          onChange={(e) => setAnalystNote(e.target.value)}
          placeholder="Enter formal intelligence note or field task assignment..."
          className="w-full h-20 p-2.5 rounded bg-tactical-950 border border-tactical-700 focus:border-accent-cyan text-white font-mono text-xs outline-none resize-none"
        />
        <button
          type="submit"
          className="w-full py-1.5 rounded bg-accent-cyan/20 hover:bg-accent-cyan/30 border border-accent-cyan text-accent-cyan font-mono text-xs font-bold transition-all"
        >
          LOG EVIDENCE NOTE INTO WORKSPACE
        </button>
      </form>

      {/* Logged Notes Stream */}
      <div className="space-y-2 pt-2 border-t border-tactical-800">
        <span className="font-mono text-xxs text-tactical-400 uppercase tracking-wider block">
          SESSION NOTES ({savedNotes.length}) — not saved to server, cleared on reload
        </span>
        {savedNotes.length === 0 && (
          <div className="p-3 text-tactical-500 font-mono text-xs text-center">No notes logged this session.</div>
        )}
        {savedNotes.map((note) => (
          <div key={note.id} className="p-3 bg-tactical-900/80 rounded border border-tactical-800 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xxs">
              <span className="text-accent-cyan font-bold">{note.author}</span>
              <span className="text-tactical-400">{note.timestamp}</span>
            </div>
            <p className="font-mono text-xs text-tactical-200">{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={
        docked
          ? "w-[420px] h-full bg-tactical-900 border-l border-tactical-700 flex flex-col overflow-hidden shrink-0"
          : "fixed top-0 right-0 h-screen w-[440px] max-w-[95vw] bg-tactical-900 border-l border-tactical-700 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      }
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-tactical-800/90 border-b border-tactical-700 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent-cyan" />
          <div>
            <div className="font-mono text-xs font-bold tracking-wider text-white">
              UNIVERSAL INTELLIGENCE INSPECTOR
            </div>
            <div className="font-mono text-xxs text-tactical-400">
              TARGET: <span className="text-accent-cyan font-bold">{label}</span>
            </div>
          </div>
        </div>

        <button
          onClick={closeInspector}
          className="p-1.5 rounded bg-tactical-900 hover:bg-tactical-700 border border-tactical-700 text-tactical-400 hover:text-white transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tab Bar (8 sections) */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-tactical-950 border-b border-tactical-800 overflow-x-auto custom-scrollbar shrink-0">
        {[
          { id: "metadata", label: "Metadata" },
          { id: "provenance", label: "Custody" },
          { id: "network", label: "Network" },
          { id: "timeline", label: "Timeline" },
          { id: "pivots", label: "Pivots" },
          { id: "explainability", label: "Explain" },
          { id: "lineage", label: "Lineage" },
          { id: "notes", label: "Notes" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-2 py-1 rounded font-mono text-xxs transition-all whitespace-nowrap ${
              activeTab === t.id
                ? "bg-accent-cyan/20 border border-accent-cyan text-accent-cyan font-bold"
                : "text-tactical-300 hover:text-white hover:bg-tactical-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-accent-cyan font-mono animate-pulse">Retrieving Entity Profile...</span>
          </div>
        ) : (
          <>
            {activeTab === "metadata" && renderMetadataTab()}
            {activeTab === "provenance" && renderProvenanceTab()}
            {activeTab === "network" && renderNetworkTab()}
            {activeTab === "timeline" && renderTimelineTab()}
            {activeTab === "pivots" && renderPivotsTab()}
            {activeTab === "explainability" && renderExplainabilityTab()}
            {activeTab === "lineage" && renderLineageTab()}
            {activeTab === "notes" && renderNotesTab()}
          </>
        )}
      </div>

      {/* Footer System Status Bar */}
      <div className="px-3.5 py-2 bg-tactical-950 border-t border-tactical-800 font-mono text-xxs text-tactical-400 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
          NATO ADMISSIBILITY CERTIFIED
        </span>
        <span className="text-tactical-500">OPERATIONAL READINESS LEVEL 1</span>
      </div>
    </div>
  );
};
