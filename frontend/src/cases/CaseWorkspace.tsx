import { useEffect, useState } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { Shield, FolderOpen, Users, Clock, FileText, Briefcase } from "lucide-react";

type CaseTab = "overview" | "entities" | "timeline" | "evidence" | "notes";

export function CaseWorkspace({ caseId }: { caseId: string }) {
  const { setFocusedEntity, activeCase, setActiveCase, inspectEntity } = useInvestigationStore();
  const [activeTab, setActiveTab] = useState<CaseTab>("overview");
  const [entityFilter] = useState("ALL");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [caseRecord, setCaseRecord] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);

  const effectiveCaseId = caseId || activeCase || "CASE-1";

  useEffect(() => {
    let isMounted = true;
    
    // Fetch Recent Cases for the Switcher
    fetch('/api/firs')
      .then(res => res.json())
      .then(data => {
        if(isMounted) {
          setRecentCases(data.slice(0, 5));
        }
      })
      .catch(console.error);

    return () => { isMounted = false };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const savedNotes = localStorage.getItem(`intel_os_case_notes_${effectiveCaseId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes(`[ANALYST WORKING THEORY FOR ${effectiveCaseId}]\nInitial Observations: Surveillance active. Reviewing link analysis DAG.`);
    }

    // Fetch Full Case Details
    fetch(`/api/cases/${effectiveCaseId}`)
      .then(res => res.json())
      .then(data => {
         if (!isMounted) return;
         setCaseRecord(data);
      })
      .catch(console.error);

    // Fetch Case Timeline
    fetch(`/api/cases/${effectiveCaseId}/timeline`)
      .then(res => res.json())
      .then(data => {
         if (isMounted) setEvents(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => {
         if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveCaseId]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem(`intel_os_case_notes_${effectiveCaseId}`, val);
  };

  if (loading || !caseRecord) {
     return <div className="p-8 text-tactical-400 font-mono text-sm text-center flex-1">Loading Case Record {effectiveCaseId}...</div>;
  }

  const caseEntities = [
     ...(caseRecord.victims || []).map((v: any) => ({
        id: `VICTIM-${v.VictimMasterID}`, name: v.VictimName, type: 'Person', role: 'Victim'
     })),
     ...(caseRecord.accused || []).map((a: any) => ({
        id: `ACCUSED-${a.AccusedMasterID}`, name: a.AccusedName, type: 'Person', role: 'Accused'
     }))
  ];

  const caseEvidence = [
     ...(caseRecord.acts || []).map((a: any) => ({
        id: `ACT-${a.ActID}-${a.SectionID}`, title: `Act ${a.ActID} / Sec ${a.SectionID}`, category: 'Document', source: 'KSP FIR Record'
     }))
  ];

  const filteredEntities =
    entityFilter === "ALL"
      ? caseEntities
      : caseEntities.filter((e) => e.type.toUpperCase() === entityFilter);

  return (
    <div className="flex flex-col h-full bg-tactical-900 text-tactical-100 overflow-hidden">
      {/* Top Multi-Case Switcher Bar */}
      <div className="px-3 py-2 bg-tactical-950 border-b border-tactical-800 flex items-center justify-between shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-accent-amber shrink-0" />
          <span className="font-mono text-xxs font-bold text-tactical-400 mr-2 shrink-0">ACTIVE INVESTIGATION CASES:</span>
          {recentCases.map((c) => {
            const cid = `CASE-${c.CaseMasterID}`;
            const isSelected = cid === effectiveCaseId;
            return (
              <button
                key={cid}
                onClick={() => setActiveCase(cid)}
                className={`px-2.5 py-1 rounded font-mono text-xxs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-accent-amber text-tactical-950 border border-accent-amber shadow"
                    : "bg-tactical-900/80 hover:bg-tactical-800 text-tactical-300 border border-tactical-700"
                }`}
              >
                <span>{cid}</span>
                <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-tactical-950/20 text-tactical-950" : "bg-tactical-950 text-tactical-400"}`}>
                  {c.CaseMasterID}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Case Header Chrome */}
      <div className="p-4 border-b border-tactical-700 bg-tactical-800/60 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-accent-amber" />
            <span className="font-mono text-xs text-tactical-400">FIR / CASE DOSSIER:</span>
            <span className="font-mono text-sm font-bold text-accent-amber">{effectiveCaseId}</span>
            <span className="font-mono text-xxs px-2 py-0.5 rounded bg-tactical-950 border border-tactical-600 text-accent-cyan">
              CRIME NO: {caseRecord.CrimeNo}
            </span>
            <span className="font-mono text-xxs px-2 py-0.5 rounded bg-tactical-950 border border-tactical-600 text-tactical-300">
              STATION: {caseRecord.UnitName}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-accent-amber/20 border border-accent-amber text-accent-amber font-mono text-xxs uppercase font-bold">
            {caseRecord.CaseStatusID === 1 ? "ACTIVE INVESTIGATION" : "CLOSED/RESOLVED"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-tactical-900/60 p-2 rounded border border-tactical-700">
            <span className="text-xxs text-tactical-500 uppercase block">Title</span>
            <span className="text-tactical-200 font-bold truncate block">{caseRecord.CaseNo}</span>
          </div>
          <div className="bg-tactical-900/60 p-2 rounded border border-tactical-700">
            <span className="text-xxs text-tactical-500 uppercase block">Assigned Unit</span>
            <span className="text-tactical-200 truncate block">{caseRecord.UnitName}</span>
          </div>
          <div className="bg-tactical-900/60 p-2 rounded border border-tactical-700">
            <span className="text-xxs text-tactical-500 uppercase block">Date Opened</span>
            <span className="text-tactical-200">{caseRecord.CrimeRegisteredDate}</span>
          </div>
          <div className="bg-tactical-900/60 p-2 rounded border border-tactical-700">
            <span className="text-xxs text-tactical-500 uppercase block">Risk Threat Level</span>
            <span className="font-bold text-accent-cyan">ELEVATED</span>
          </div>
        </div>
      </div>

      {/* Case Tabs */}
      <div className="flex items-center border-b border-tactical-700 bg-tactical-900/80 px-2 shrink-0 overflow-x-auto">
        <button onClick={() => setActiveTab("overview")} className={`flex items-center gap-1.5 px-3 py-2.5 font-mono text-xs border-b-2 transition-all ${activeTab === "overview" ? "border-accent-amber text-accent-amber font-bold bg-tactical-800/40" : "border-transparent text-tactical-400 hover:text-tactical-200"}`}>
          <Shield className="w-3.5 h-3.5" /><span>Overview</span>
        </button>
        <button onClick={() => setActiveTab("entities")} className={`flex items-center gap-1.5 px-3 py-2.5 font-mono text-xs border-b-2 transition-all ${activeTab === "entities" ? "border-accent-amber text-accent-amber font-bold bg-tactical-800/40" : "border-transparent text-tactical-400 hover:text-tactical-200"}`}>
          <Users className="w-3.5 h-3.5" /><span>Entities ({caseEntities.length})</span>
        </button>
        <button onClick={() => setActiveTab("timeline")} className={`flex items-center gap-1.5 px-3 py-2.5 font-mono text-xs border-b-2 transition-all ${activeTab === "timeline" ? "border-accent-amber text-accent-amber font-bold bg-tactical-800/40" : "border-transparent text-tactical-400 hover:text-tactical-200"}`}>
          <Clock className="w-3.5 h-3.5" /><span>Timeline ({events.length})</span>
        </button>
        <button onClick={() => setActiveTab("evidence")} className={`flex items-center gap-1.5 px-3 py-2.5 font-mono text-xs border-b-2 transition-all ${activeTab === "evidence" ? "border-accent-amber text-accent-amber font-bold bg-tactical-800/40" : "border-transparent text-tactical-400 hover:text-tactical-200"}`}>
          <FileText className="w-3.5 h-3.5" /><span>Evidence/Acts ({caseEvidence.length})</span>
        </button>
        <button onClick={() => setActiveTab("notes")} className={`flex items-center gap-1.5 px-3 py-2.5 font-mono text-xs border-b-2 transition-all ${activeTab === "notes" ? "border-accent-amber text-accent-amber font-bold bg-tactical-800/40" : "border-transparent text-tactical-400 hover:text-tactical-200"}`}>
          <span>Notes</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 border border-tactical-700 rounded bg-tactical-800/30">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-amber font-bold mb-2">Executive Case Summary</h3>
              <p className="text-xs text-tactical-200 leading-relaxed font-sans">{caseRecord.BriefFacts || 'No brief facts provided.'}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-tactical-800/30 border border-tactical-700 rounded text-center">
                <span className="text-2xl font-bold text-tactical-100">{caseEntities.length}</span>
                <span className="text-xxs font-mono text-tactical-400 uppercase block mt-1">Involved Entities</span>
              </div>
              <div className="p-3 bg-tactical-800/30 border border-tactical-700 rounded text-center">
                <span className="text-2xl font-bold text-accent-cyan">{events.length}</span>
                <span className="text-xxs font-mono text-tactical-400 uppercase block mt-1">Logged Events</span>
              </div>
              <div className="p-3 bg-tactical-800/30 border border-tactical-700 rounded text-center">
                <span className="text-2xl font-bold text-accent-amber">{caseEvidence.length}</span>
                <span className="text-xxs font-mono text-tactical-400 uppercase block mt-1">Legal Acts</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === "entities" && (
          <div className="flex flex-col gap-3">
            {filteredEntities.map((ent) => (
              <div key={ent.id} className="p-3 rounded bg-tactical-800/40 hover:bg-tactical-800 border border-tactical-700 hover:border-accent-amber flex items-center justify-between text-left transition-all group">
                <div className="cursor-pointer flex-1" onClick={() => setFocusedEntity(ent.id, ent.name)}>
                  <div className="text-sm font-bold text-tactical-100 group-hover:text-accent-amber">{ent.name}</div>
                  <div className="text-xxs font-mono text-tactical-400 mt-0.5">Role: {ent.role} • ID: {ent.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xxs font-mono px-2 py-0.5 rounded bg-tactical-900 text-accent-amber border border-tactical-700">{ent.type}</span>
                  <button onClick={() => inspectEntity(ent.id, { name: ent.name })} className="px-2.5 py-1 rounded bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-mono text-xxs font-bold transition-all" title="Inspect in 8-Tab NATO Inspector">INSPECT →</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-2">
            {events.length === 0 ? (
              <div className="text-center py-6 text-tactical-500 font-mono text-xs">No timeline events logged for Case {effectiveCaseId}.</div>
            ) : (
              events.map((evt, idx) => (
                <div key={idx} className="p-3 rounded bg-tactical-800/30 border-l-2 border-l-accent-amber border border-tactical-700">
                  <div className="flex items-center justify-between text-xxs font-mono text-tactical-400">
                    <span className="text-accent-amber font-bold">{evt.title || evt.type || "Case Activity"}</span>
                    <span>{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "Undated"}</span>
                  </div>
                  <div className="text-xs text-tactical-100 mt-1">{evt.details || evt.description || evt.summary}</div>
                  {evt.relatedEntities && evt.relatedEntities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {evt.relatedEntities.map((re: any, ridx: number) => (
                        <div key={ridx} className="flex items-center gap-1 bg-tactical-900/60 border border-tactical-600 rounded px-2 py-0.5 text-[10px] font-mono text-tactical-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${re.type === 'Accused' ? 'bg-accent-red' : 'bg-accent-cyan'}`} />
                          <span className="font-bold">{re.name}</span>
                          <span className="text-tactical-500">({re.type})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "evidence" && (
          <div className="flex flex-col gap-2.5">
            {caseEvidence.map((ev) => (
              <div key={ev.id} className="p-3 rounded bg-tactical-800/40 border border-tactical-700 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-tactical-100">{ev.title}</span>
                  <span className="px-2 py-0.5 rounded font-mono text-xxs bg-tactical-900 text-accent-cyan border border-tactical-700">{ev.category}</span>
                </div>
                <div className="flex items-center justify-between text-xxs font-mono text-tactical-400">
                  <span>Source: {ev.source}</span>
                  <span>Record #{ev.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-2 h-full">
            <span className="text-xxs font-mono text-tactical-400">Persisted Investigation Notes for Case {effectiveCaseId}</span>
            <textarea value={notes} onChange={(e) => handleNotesChange(e.target.value)} placeholder="Type confidential operational notes..." className="w-full h-48 bg-tactical-950 border border-tactical-700 rounded p-3 text-xs font-mono text-tactical-100 focus:border-accent-amber outline-none resize-y" />
          </div>
        )}
      </div>
    </div>
  );
}
