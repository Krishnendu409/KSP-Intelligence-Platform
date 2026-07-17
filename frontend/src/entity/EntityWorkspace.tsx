import { useEffect, useState } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { DefaultService } from "@shared/client";
import type { EntityDossier, RelationshipWithEvidence } from "@shared/client";
import { Loader2, Fingerprint, Activity, Users, Clock, Phone, Car, ExternalLink, Eye, Trash2, Plus, MapPin, CalendarDays, FileText } from "lucide-react";
import { IdentityCard } from "./IdentityCard";
import { RiskCard } from "./RiskCard";
import { getFallbackEntityDossier, getFallbackEntityRelationships } from "../lib/operationalEntityFallback";

type EntityTab = "overview" | "identity" | "relationships" | "timeline" | "assets" | "surveillance";

interface SurveillanceLogEntry {
  id: string;
  timestamp: string;
  type: 'PHYSICAL' | 'CCTV' | 'DIGITAL' | 'CDR' | 'ANPR' | 'FINANCIAL' | 'HUMINT';
  location: string;
  notes: string;
  officer: string;
}

export function EntityWorkspace() {
  const { focusedEntity, setFocusedEntity, selection, clearMultiSelect } = useInvestigationStore();
  const [dossier, setDossier] = useState<EntityDossier | null>(null);
  const [relationships, setRelationships] = useState<RelationshipWithEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<EntityTab>("overview");
  const [fieldNote, setFieldNote] = useState("");
  const [fieldNotesList, setFieldNotesList] = useState<string[]>([
    "Primary subject under active surveillance — Operation Nightfall (FIR-2026-0889)",
    "Verified high-reliability link to vehicle KA-01-AB-1234 and phone +91 98765 43210"
  ]);

  // Surveillance Log State
  const [survLogs, setSurvLogs] = useState<SurveillanceLogEntry[]>([
    { id: 'SL-001', timestamp: '2026-07-08T09:12:00', type: 'PHYSICAL', location: 'Indiranagar 100ft Road, Opp. Apollo Hospital', notes: 'Subject observed entering apartment complex. Wearing grey kurta. Carrying black duffel bag (suspected contraband). 2 associates present (unidentified).', officer: 'HC Ramesh K.' },
    { id: 'SL-002', timestamp: '2026-07-08T18:45:00', type: 'CCTV', location: 'Indiranagar Junction CCTV Cam #402', notes: 'Target vehicle KA-01-MF-2345 (Fortuner) captured entering Zone 4. Cross-referenced ANPR hit at 18:42. Plate confirmed match.', officer: 'Insp. R. Krishnan' },
    { id: 'SL-003', timestamp: '2026-07-09T22:30:00', type: 'CDR', location: 'Cell Tower BLR-IND-7 (Indiranagar Sector)', notes: 'Target phone IMEI 35291234 active on tower. 12 outgoing calls to +971-XXXX (Dubai routing). Total call duration 47 min. Handset geo-fence triggered.', officer: 'SI Deepak M.' },
    { id: 'SL-004', timestamp: '2026-07-10T14:15:00', type: 'ANPR', location: 'Outer Ring Road Tollbooth - KR Puram', notes: 'Vehicle KA-01-MF-2345 flagged at ORR tollbooth. Direction: East (towards Whitefield). Driver consistent with primary suspect profile. Not intercepted — surveillance maintained.', officer: 'HC Ramesh K.' },
    { id: 'SL-005', timestamp: '2026-07-11T11:00:00', type: 'FINANCIAL', location: 'HDFC Bank Indiranagar Branch', notes: 'Banker subpoena response received. Acc *9921 shows Rs 14.2L cash deposit on 07-Jul. Wire transfer Rs 1.8 Crore to Zodiac FinTech Dubai on 08-Jul. Flagged as hawala-linked.', officer: 'Sub-Insp. Priya N.' },
    { id: 'SL-006', timestamp: '2026-07-12T08:30:00', type: 'HUMINT', location: 'Confidential (CI: KSP-INF-02)', notes: 'Confidential informant reports meeting scheduled at Whitefield godown tonight 22:00 hrs. Subject expected to transfer contraband package. Corroborated by SIGINT.', officer: 'Insp. R. Krishnan' }
  ]);
  const [newSurvLog, setNewSurvLog] = useState<Omit<SurveillanceLogEntry, 'id'>>({ timestamp: new Date().toISOString().slice(0, 16), type: 'PHYSICAL', location: '', notes: '', officer: '' });
  const [showAddSurvForm, setShowAddSurvForm] = useState(false);

  useEffect(() => {
    if (!focusedEntity) {
      setDossier(null);
      setRelationships([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    if (focusedEntity.startsWith("CASE-")) {
      const caseId = focusedEntity.replace("CASE-", "");
      fetch(`/api/cases/CASE-${caseId}`)
        .then(res => res.json())
        .then((caseData) => {
          if (!isMounted) return;
          if (caseData.error) throw new Error(caseData.error);
          
          const caseDossier: EntityDossier = {
            entityId: focusedEntity,
            type: "Case",
            profile: {
              name: `FIR ${caseData.CaseNo} / Crime No: ${caseData.CrimeNo}`,
              status: caseData.CaseStatusID === 1 ? "OPEN" : "CLOSED",
              threatLevel: "ELEVATED",
              natoGrade: "A1",
              notes: caseData.BriefFacts,
              address: caseData.UnitName,
              nationalId: caseData.CaseMasterID.toString()
            },
            aliases: [],
            riskIndicators: [
              `Victims: ${caseData.victims?.map((v: any) => v.VictimName).join(', ') || 'None'}`,
              `Accused: ${caseData.accused?.map((a: any) => a.AccusedName).join(', ') || 'None'}`,
              `Acts: ${caseData.acts?.map((a: any) => 'Act ' + a.ActID + ' Sec ' + a.SectionID).join(', ') || 'None'}`
            ],
            activityTimeline: []
          };
          
          setDossier(caseDossier);
          // Set relationships
          const accusedRels = caseData.accused?.map((a: any) => ({
             id: `rel-acc-${a.AccusedMasterID}`,
             type: 'ACCUSED_IN',
             sourceEntity: { id: `ent-person-${a.AccusedMasterID}`, name: a.AccusedName, type: 'Person' },
             targetEntity: { id: focusedEntity, name: `FIR ${caseData.CaseNo}`, type: 'Case' },
             confidence: 95
          })) || [];
          
          const victimRels = caseData.victims?.map((v: any) => ({
             id: `rel-vic-${v.VictimMasterID}`,
             type: 'VICTIM_OF',
             sourceEntity: { id: `ent-person-vic-${v.VictimMasterID}`, name: v.VictimName, type: 'Person' },
             targetEntity: { id: focusedEntity, name: `FIR ${caseData.CaseNo}`, type: 'Case' },
             confidence: 95
          })) || [];
          
          setRelationships([...accusedRels, ...victimRels]);
        })
        .catch((err) => {
          console.warn("Using offline dossier fallback for case:", err?.message || err);
          setDossier(getFallbackEntityDossier(focusedEntity));
          setRelationships(getFallbackEntityRelationships(focusedEntity));
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      // Normal Entity Fetch
      const currentNavFrame = useInvestigationStore.getState().navigation.stack[useInvestigationStore.getState().navigation.currentIndex];
      const navLabel = currentNavFrame?.id === focusedEntity ? currentNavFrame.label : undefined;
      
      setDossier(getFallbackEntityDossier(focusedEntity, navLabel));
      setRelationships(getFallbackEntityRelationships(focusedEntity));

      DefaultService.getApiEntitiesDossier(focusedEntity)
        .then((data: EntityDossier) => {
          if (isMounted && data && data.entityId) {
            setDossier(data);
          }
        })
        .catch((err) => {
          console.warn("Using offline dossier fallback:", err?.message || err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      DefaultService.getApiEntitiesRelationships(focusedEntity)
        .then((data: RelationshipWithEvidence[]) => {
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setRelationships(data);
          }
        })
        .catch(() => {
          // Retain offline fallback relationships silently
        });
    }

    return () => {
      isMounted = false;
    };
  }, [focusedEntity]);

  if (!focusedEntity) {
    if (selection.multiSelected && selection.multiSelected.length > 0) {
      return (
        <div className="flex flex-col h-full bg-tactical-950 p-4 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-tactical-800 pb-3 mb-4">
            <div>
              <div className="font-mono text-xxs uppercase tracking-widest text-accent-cyan">
                SPATIAL SECTOR SWEEP
              </div>
              <h2 className="font-mono text-base font-bold text-white mt-1">
                {selection.multiSelected.length} ENTITIES CAPTURED IN SECTOR
              </h2>
            </div>
            <button
              onClick={() => clearMultiSelect()}
              className="font-mono text-xs text-tactical-400 hover:text-white underline"
            >
              CLEAR SELECTION
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selection.multiSelected.map((entityId) => (
              <div
                key={entityId}
                onClick={() => setFocusedEntity(entityId, entityId)}
                className="bg-tactical-900/80 border border-tactical-700 hover:border-accent-cyan p-3 rounded cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-white group-hover:text-accent-cyan">
                    {entityId}
                  </div>
                  <div className="font-mono text-xxs text-tactical-400 mt-0.5">
                    Click to load full Dossier
                  </div>
                </div>
                <span className="font-mono text-xxs text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  INSPECT →
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-tactical-400 font-mono text-sm p-6 text-center max-w-lg mx-auto">
        <Fingerprint className="w-10 h-10 mb-4 text-accent-cyan opacity-80" />
        <div className="font-bold text-white mb-2">No Entity Selected</div>
        <p className="text-xs text-tactical-400 mb-6">
          Press <kbd className="px-1.5 py-0.5 bg-tactical-800 border border-tactical-600 rounded text-accent-cyan">Ctrl+K</kbd> to search the intelligence database or select a suggested dossier below:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setFocusedEntity("ent-person-arjun", "Arjun Sharma")}
            className="px-3 py-1.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 hover:border-accent-cyan text-xs text-tactical-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
            Suggested: Arjun Sharma (PER-2026-001) →
          </button>
          <button
            onClick={() => setFocusedEntity("ent-person-vikram", "Vikram 'Vicky' Desai")}
            className="px-3 py-1.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 hover:border-accent-cyan text-xs text-tactical-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            Suggested: Vikram Desai (PER-2026-002) →
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-accent-cyan">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const activeDossier = dossier || getFallbackEntityDossier(focusedEntity || "ent-person-arjun");

  const profile = activeDossier.profile || {};
  const timelineEvents = activeDossier.activityTimeline || [];

  const phoneRels = relationships.filter(r =>
    r.targetEntity?.type === "Phone" || r.sourceEntity?.type === "Phone"
  );
  const vehicleRels = relationships.filter(r =>
    r.targetEntity?.type === "Vehicle" || r.sourceEntity?.type === "Vehicle"
  );


  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Entity Workspace Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-tactical-700 bg-tactical-900/80 shrink-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-xxs transition-all ${
            activeTab === "overview"
              ? "bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30"
              : "text-tactical-400 hover:text-tactical-200 hover:bg-tactical-800/50 border border-transparent"
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("identity")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-xxs transition-all ${
            activeTab === "identity"
              ? "bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30"
              : "text-tactical-400 hover:text-tactical-200 hover:bg-tactical-800/50 border border-transparent"
          }`}
        >
          <Fingerprint className="w-3 h-3" />
          <span>Identity</span>
        </button>

        <button
          onClick={() => setActiveTab("relationships")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-xxs transition-all ${
            activeTab === "relationships"
              ? "bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30"
              : "text-tactical-400 hover:text-tactical-200 hover:bg-tactical-800/50 border border-transparent"
          }`}
        >
          <Users className="w-3 h-3" />
          <span>Network ({relationships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-xxs transition-all ${
            activeTab === "timeline"
              ? "bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30"
              : "text-tactical-400 hover:text-tactical-200 hover:bg-tactical-800/50 border border-transparent"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Timeline ({timelineEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("assets")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-xxs transition-all ${
            activeTab === "assets"
              ? "bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30"
              : "text-tactical-400 hover:text-tactical-200 hover:bg-tactical-800/50 border border-transparent"
          }`}
        >
          <Car className="w-3 h-3" />
          <span>Assets</span>
        </button>

        <button
          onClick={() => setActiveTab("surveillance")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-xxs transition-all ${
            activeTab === "surveillance"
              ? "bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30"
              : "text-tactical-400 hover:text-tactical-200 hover:bg-tactical-800/50 border border-transparent"
          }`}
        >
          <FileText className="w-3 h-3" />
          <span>Surveillance Logs</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="flex flex-col">
            {/* Police Operational Threat & Source Reliability Banner */}
            <div className="px-3 py-2 bg-tactical-900/90 border-b border-tactical-700 flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-accent-red/20 border border-accent-red/60 text-accent-red font-bold uppercase text-xxs">
                  THREAT: PRIORITY TARGET
                </span>
                <span className="px-2 py-0.5 rounded bg-accent-cyan/20 border border-accent-cyan/60 text-accent-cyan font-bold uppercase text-xxs">
                  RELIABILITY: A1
                </span>
              </div>
              <span className="text-xxs text-tactical-400">MAJOR CRIMES DIV.</span>
            </div>

            <IdentityCard dossier={activeDossier} />
            <RiskCard dossier={activeDossier} />

            {/* Police Digital & Financial Footprint Matrix */}
            <div className="p-4 border-b border-tactical-600 bg-tactical-900/30">
              <span className="text-xxs font-mono text-tactical-400 uppercase tracking-widest mb-2.5 block font-bold text-accent-cyan">
                DIGITAL & FINANCIAL FOOTPRINT MATRIX
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-tactical-800/50 border border-tactical-700 flex items-center justify-between">
                  <span className="text-tactical-300">Active Phones (IMEI/SIM)</span>
                  <span className="text-accent-cyan font-bold">{phoneRels.length || 2} Connected</span>
                </div>
                <div className="p-2.5 rounded bg-tactical-800/50 border border-tactical-700 flex items-center justify-between">
                  <span className="text-tactical-300">Vehicles (ANPR Tracked)</span>
                  <span className="text-accent-amber font-bold">{vehicleRels.length || 1} Linked</span>
                </div>
                <div className="p-2.5 rounded bg-tactical-800/50 border border-tactical-700 flex items-center justify-between">
                  <span className="text-tactical-300">UPI / Financial Accounts</span>
                  <span className="text-tactical-100 font-bold">3 Monitored</span>
                </div>
                <div className="p-2.5 rounded bg-tactical-800/50 border border-tactical-700 flex items-center justify-between">
                  <span className="text-tactical-300">Associated FIR Cases</span>
                  <span className="text-accent-red font-bold">FIR-2026-0889</span>
                </div>
              </div>
            </div>

            {/* Investigator Field Notes & Tactical Log */}
            <div className="p-4 border-b border-tactical-600">
              <span className="text-xxs font-mono text-tactical-400 uppercase tracking-widest mb-2 block font-bold">
                INVESTIGATOR FIELD NOTES & HYPOTHESIS LOG
              </span>
              <div className="flex flex-col gap-1.5 mb-3">
                {fieldNotesList.map((note, idx) => (
                  <div key={idx} className="p-2 rounded bg-tactical-900/80 border-l-2 border-l-accent-cyan text-xs text-tactical-200 font-mono">
                    <span className="text-xxs text-tactical-400 block mb-0.5">[OFFICER ENTRY — MAJOR CRIMES UNIT]</span>
                    {note}
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (fieldNote.trim()) {
                    setFieldNotesList([...fieldNotesList, fieldNote.trim()]);
                    setFieldNote("");
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={fieldNote}
                  onChange={(e) => setFieldNote(e.target.value)}
                  placeholder="Add tactical field note or alibi verification update..."
                  className="flex-1 px-3 py-1.5 rounded bg-tactical-800 border border-tactical-600 text-xs text-tactical-100 placeholder:text-tactical-500 focus:outline-none focus:border-accent-cyan font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-tactical-700 hover:bg-tactical-600 text-accent-cyan text-xs font-mono font-bold transition-colors"
                >
                  ADD NOTE
                </button>
              </form>
            </div>
            
            {/* Network Summary Widget */}
            {activeDossier.networkSummary && (
              <div className="p-4 border-b border-tactical-600">
                <span className="text-xxs font-mono text-tactical-500 uppercase tracking-widest mb-2 block">Network Summary</span>
                <div className="flex gap-4">
                  <div className="bg-tactical-900/50 p-3 border border-tactical-600 rounded flex-1 text-center">
                    <div className="text-xl font-bold text-tactical-100">{activeDossier.networkSummary.directConnections || 0}</div>
                    <div className="text-xxs font-mono text-tactical-500 uppercase">Direct Connections</div>
                  </div>
                  <div className="bg-tactical-900/50 p-3 border border-tactical-600 rounded flex-1 text-center">
                    <div className="text-xl font-bold text-accent-cyan">{activeDossier.networkSummary.degreesOfSeparation || 1}</div>
                    <div className="text-xxs font-mono text-tactical-500 uppercase">Degrees of Separation</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Pivot Top Associates */}
            {relationships.length > 0 && (
              <div className="p-4 border-b border-tactical-600">
                <span className="text-xxs font-mono text-tactical-500 uppercase tracking-widest mb-2.5 block">Immediate Associates</span>
                <div className="flex flex-col gap-1.5">
                  {relationships.slice(0, 5).map((rel) => {
                    const target = rel.targetEntity?.id === focusedEntity ? rel.sourceEntity : rel.targetEntity;
                    if (!target) return null;
                    return (
                      <button
                        key={rel.relationshipId}
                        onClick={() => setFocusedEntity(target.id, target.name || target.id)}
                        className="flex items-center justify-between p-2 rounded bg-tactical-800/40 hover:bg-tactical-800 border border-tactical-700/60 hover:border-accent-cyan text-left transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-tactical-200 group-hover:text-accent-cyan font-bold">
                            {target.name || target.id}
                          </span>
                          <span className="text-xxs font-mono px-1.5 py-0.5 rounded bg-tactical-900 text-tactical-400">
                            {target.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xxs font-mono text-tactical-400">
                          <span>{rel.type}</span>
                          <ExternalLink className="w-3 h-3 text-tactical-500 group-hover:text-accent-cyan" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IDENTITY TAB */}
        {activeTab === "identity" && (
          <div className="p-4 flex flex-col gap-4">
            <div className="border border-tactical-600 rounded bg-tactical-800/30 p-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-cyan font-bold mb-3">
                Biographical & Identity Profile
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-tactical-400 block text-xxs uppercase">Full Name</span>
                  <span className="text-tactical-100">{profile.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-tactical-400 block text-xxs uppercase">Entity ID</span>
                  <span className="text-tactical-100">{activeDossier.entityId}</span>
                </div>
                <div>
                  <span className="text-tactical-400 block text-xxs uppercase">Entity Type</span>
                  <span className="text-tactical-100">{activeDossier.type}</span>
                </div>
                <div>
                  <span className="text-tactical-400 block text-xxs uppercase">National / Gov ID</span>
                  <span className="text-tactical-100">{profile.nationalId || "Unrecorded"}</span>
                </div>
                {profile.dob && (
                  <div>
                    <span className="text-tactical-400 block text-xxs uppercase">Date of Birth</span>
                    <span className="text-tactical-100">{profile.dob}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div>
                    <span className="text-tactical-400 block text-xxs uppercase">Nationality</span>
                    <span className="text-tactical-100">{profile.nationality}</span>
                  </div>
                )}
              </div>
            </div>

            {activeDossier.aliases && activeDossier.aliases.length > 0 && (
              <div className="border border-tactical-600 rounded bg-tactical-800/30 p-4">
                <h3 className="font-mono text-xs uppercase tracking-wider text-tactical-300 font-bold mb-2">
                  Documented Aliases & Monikers
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeDossier.aliases.map((alias, idx) => (
                    <span key={idx} className="bg-tactical-900 text-tactical-200 px-2.5 py-1 rounded font-mono text-xs border border-tactical-600">
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RELATIONSHIPS TAB */}
        {activeTab === "relationships" && (
          <div className="p-3 flex flex-col gap-2">
            {relationships.length === 0 ? (
              <div className="p-4 rounded border border-tactical-800 bg-tactical-900/40 text-tactical-400 font-mono text-xs flex flex-col items-start gap-2">
                <span>No direct relationships recorded. This entity may be isolated or unlinked.</span>
                <button
                  onClick={() => setActiveTab("assets")}
                  className="text-accent-cyan hover:underline text-xxs flex items-center gap-1"
                >
                  Check associated communication devices & aliases →
                </button>
              </div>
            ) : (
              relationships.map((rel) => {
                const target = rel.targetEntity?.id === focusedEntity ? rel.sourceEntity : rel.targetEntity;
                if (!target) return null;
                return (
                  <div
                    key={rel.relationshipId}
                    className="p-3 rounded bg-tactical-800/40 border border-tactical-700/80 hover:border-tactical-500 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setFocusedEntity(target.id, target.name || target.id)}
                        className="flex items-center gap-2 hover:text-accent-cyan text-left font-bold text-sm text-tactical-100 transition-colors"
                      >
                        <span>{target.name || target.id}</span>
                        <span className="text-xxs font-mono px-1.5 py-0.5 rounded bg-tactical-900 text-accent-cyan border border-tactical-700">
                          {target.type}
                        </span>
                      </button>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-tactical-700/60 text-tactical-300">
                        {rel.type}
                      </span>
                    </div>

                    {rel.evidence && rel.evidence.length > 0 && (
                      <div className="text-xxs font-mono text-tactical-400 bg-tactical-900/60 p-2 rounded border border-tactical-800 flex items-center justify-between">
                        <span>Evidence Ref: {(rel.evidence[0] as any).title || (rel.evidence[0] as any).source || "Investigation Log"}</span>
                        <span className="text-tactical-500">{rel.evidence.length} item(s)</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <div className="p-3 flex flex-col gap-2">
            {timelineEvents.length === 0 ? (
              <div className="p-4 rounded border border-tactical-800 bg-tactical-900/40 text-tactical-400 font-mono text-xs flex flex-col items-start gap-2">
                <span>No chronological activity events recorded for this entity.</span>
                <button
                  onClick={() => setActiveTab("overview")}
                  className="text-accent-cyan hover:underline text-xxs flex items-center gap-1"
                >
                  Return to Overview & check related case references →
                </button>
              </div>
            ) : (
              timelineEvents.map((evt: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-tactical-800/30 border-l-2 border-l-accent-cyan border-y border-r border-tactical-700/60 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-mono text-xxs text-tactical-400">
                    <span className="text-accent-cyan font-bold uppercase">{evt.type || "Event"}</span>
                    <span>{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "Undated"}</span>
                  </div>
                  <div className="text-xs text-tactical-100 mt-1">
                    {evt.description || evt.summary || "Recorded activity event"}
                  </div>
                  {evt.location && (
                    <div className="text-xxs font-mono text-tactical-400 mt-1">
                      LOC: {evt.location}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ASSETS & COMMS TAB */}
        {activeTab === "assets" && (
          <div className="p-4 flex flex-col gap-6">
            {/* Communication Hardware / Phones */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-cyan font-bold mb-2.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>Associated Communication Devices</span>
              </h3>
              <div className="flex flex-col gap-1.5">
                {phoneRels.length === 0 && !profile.phoneNumber ? (
                  <div className="p-3 rounded border border-tactical-800 bg-tactical-900/40 text-xs font-mono text-tactical-400 flex items-center justify-between">
                    <span>No phones recorded.</span>
                    <span className="text-xxs text-accent-cyan">Add from metadata or cellular intercepts →</span>
                  </div>
                ) : (
                  phoneRels.map((rel) => {
                    const target = rel.targetEntity?.id === focusedEntity ? rel.sourceEntity : rel.targetEntity;
                    if (!target) return null;
                    return (
                      <button
                        key={rel.relationshipId}
                        onClick={() => setFocusedEntity(target.id, target.name || target.id)}
                        className="p-2.5 rounded bg-tactical-800/40 hover:bg-tactical-800 border border-tactical-700 flex items-center justify-between text-left transition-all"
                      >
                        <span className="font-mono text-xs text-tactical-100 font-bold">{target.name || target.id}</span>
                        <span className="text-xxs font-mono text-tactical-400">{rel.type} → Pivot</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Vehicles / Physical Assets */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-cyan font-bold mb-2.5 flex items-center gap-2">
                <Car className="w-3.5 h-3.5" />
                <span>Registered / Observed Vehicles</span>
              </h3>
              <div className="flex flex-col gap-1.5">
                {vehicleRels.length === 0 && !profile.vehiclePlate ? (
                  <span className="text-xs font-mono text-tactical-500">No vehicles linked.</span>
                ) : (
                  vehicleRels.map((rel) => {
                    const target = rel.targetEntity?.id === focusedEntity ? rel.sourceEntity : rel.targetEntity;
                    if (!target) return null;
                    return (
                      <button
                        key={rel.relationshipId}
                        onClick={() => setFocusedEntity(target.id, target.name || target.id)}
                        className="p-2.5 rounded bg-tactical-800/40 hover:bg-tactical-800 border border-tactical-700 flex items-center justify-between text-left transition-all"
                      >
                        <span className="font-mono text-xs text-tactical-100 font-bold">{target.name || target.id}</span>
                        <span className="text-xxs font-mono text-tactical-400">{rel.type} → Pivot</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* SURVEILLANCE LOGS TAB */}
        {activeTab === "surveillance" && (
          <div className="p-4 flex flex-col gap-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs font-bold text-accent-amber uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  SURVEILLANCE LOG — {survLogs.length} ENTRIES
                </h3>
                <p className="text-xxs font-mono text-tactical-400 mt-0.5">Timestamped operational surveillance observations. Editable by authorized officers only.</p>
              </div>
              <button
                onClick={() => setShowAddSurvForm(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-amber/10 hover:bg-accent-amber/20 border border-accent-amber/40 text-accent-amber font-mono text-xxs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD LOG ENTRY
              </button>
            </div>

            {/* Add New Entry Form */}
            {showAddSurvForm && (
              <div className="bg-tactical-900 border border-accent-amber/30 rounded p-3 flex flex-col gap-2">
                <span className="text-xxs font-mono font-bold text-accent-amber uppercase">NEW SURVEILLANCE LOG ENTRY</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-mono text-tactical-400">TIMESTAMP</label>
                    <input
                      type="datetime-local"
                      value={newSurvLog.timestamp}
                      onChange={e => setNewSurvLog(p => ({ ...p, timestamp: e.target.value }))}
                      className="bg-tactical-800 border border-tactical-600 rounded px-2 py-1 text-xxs font-mono text-white focus:border-accent-amber focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-mono text-tactical-400">TYPE</label>
                    <select
                      value={newSurvLog.type}
                      onChange={e => setNewSurvLog(p => ({ ...p, type: e.target.value as SurveillanceLogEntry['type'] }))}
                      className="bg-tactical-800 border border-tactical-600 rounded px-2 py-1 text-xxs font-mono text-white focus:border-accent-amber focus:outline-none"
                    >
                      {(['PHYSICAL','CCTV','DIGITAL','CDR','ANPR','FINANCIAL','HUMINT'] as const).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-mono text-tactical-400">LOCATION / SITE</label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar 100ft Road, Cam #402..."
                    value={newSurvLog.location}
                    onChange={e => setNewSurvLog(p => ({ ...p, location: e.target.value }))}
                    className="bg-tactical-800 border border-tactical-600 rounded px-2 py-1 text-xxs font-mono text-white focus:border-accent-amber focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-mono text-tactical-400">OBSERVATION NOTES</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed surveillance observation..."
                    value={newSurvLog.notes}
                    onChange={e => setNewSurvLog(p => ({ ...p, notes: e.target.value }))}
                    className="bg-tactical-800 border border-tactical-600 rounded px-2 py-1 text-xxs font-mono text-white focus:border-accent-amber focus:outline-none resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-mono text-tactical-400">OFFICER NAME / BADGE</label>
                  <input
                    type="text"
                    placeholder="e.g. Insp. R. Krishnan"
                    value={newSurvLog.officer}
                    onChange={e => setNewSurvLog(p => ({ ...p, officer: e.target.value }))}
                    className="bg-tactical-800 border border-tactical-600 rounded px-2 py-1 text-xxs font-mono text-white focus:border-accent-amber focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddSurvForm(false)}
                    className="px-3 py-1 rounded bg-tactical-700 hover:bg-tactical-600 text-tactical-300 font-mono text-xxs transition-colors"
                  >CANCEL</button>
                  <button
                    onClick={() => {
                      if (!newSurvLog.notes.trim()) return;
                      const entry: SurveillanceLogEntry = {
                        ...newSurvLog,
                        id: `SL-${Date.now()}`,
                        location: newSurvLog.location || 'Unspecified'
                      };
                      setSurvLogs(prev => [entry, ...prev]);
                      setNewSurvLog({ timestamp: new Date().toISOString().slice(0, 16), type: 'PHYSICAL', location: '', notes: '', officer: '' });
                      setShowAddSurvForm(false);
                    }}
                    className="px-3 py-1 rounded bg-accent-amber hover:bg-accent-amber/90 text-tactical-950 font-mono text-xxs font-bold transition-colors"
                  >SAVE LOG ENTRY</button>
                </div>
              </div>
            )}

            {/* Log Entries List */}
            <div className="flex flex-col gap-2">
              {survLogs.map((log) => {
                const typeColors: Record<string, string> = {
                  PHYSICAL: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  CCTV: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                  DIGITAL: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                  CDR: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                  ANPR: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  FINANCIAL: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                  HUMINT: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                };
                return (
                  <div key={log.id} className="bg-tactical-900/70 border border-tactical-700 rounded p-3 flex flex-col gap-2 group hover:border-accent-amber/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded border text-xxs font-mono font-bold ${typeColors[log.type] || 'text-tactical-300'}`}>
                          {log.type}
                        </span>
                        <span className="text-xxs font-mono text-tactical-400 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <button
                        onClick={() => setSurvLogs(prev => prev.filter(l => l.id !== log.id))}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent-red/20 rounded text-tactical-500 hover:text-accent-red transition-all"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {log.location && (
                      <div className="flex items-center gap-1.5 text-xxs font-mono text-tactical-300">
                        <MapPin className="w-3 h-3 text-tactical-500" />
                        <span>{log.location}</span>
                      </div>
                    )}
                    <p className="text-xs font-mono text-tactical-100 leading-relaxed">{log.notes}</p>
                    <div className="text-xxs font-mono text-tactical-500 border-t border-tactical-800 pt-1.5 mt-0.5">
                      Logged by: <span className="text-accent-amber">{log.officer || 'Unknown Officer'}</span> · Ref: {log.id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
