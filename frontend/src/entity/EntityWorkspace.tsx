import { useEffect, useState } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import type { EntityDossier, RelationshipWithEvidence } from "@shared/client";
import { Loader2, Fingerprint, Activity, Users, Clock, ExternalLink, MapPin } from "lucide-react";
import { IdentityCard } from "./IdentityCard";
import { RiskCard } from "./RiskCard";
import { apiFetch } from "../shared/api/apiFetch";
import { fetchEntityRelationships } from "../shared/api/relationshipGraph";

type EntityTab = "overview" | "identity" | "relationships" | "timeline";

const ENTITY_PREFIX_TO_TYPE: Record<string, string> = {
  ACCUSED: "accused",
  VICTIM: "victim",
  COMP: "complainant",
};

export function EntityWorkspace() {
  const { focusedEntity, setFocusedEntity, selection, clearMultiSelect } = useInvestigationStore();
  const [dossier, setDossier] = useState<EntityDossier | null>(null);
  const [relationships, setRelationships] = useState<RelationshipWithEvidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<EntityTab>("overview");
  const [fieldNote, setFieldNote] = useState("");
  const [fieldNotesList, setFieldNotesList] = useState<string[]>([]);

  useEffect(() => {
    if (!focusedEntity) {
      setDossier(null);
      setRelationships([]);
      setLoadError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    async function load() {
      try {
        if (focusedEntity!.startsWith("CASE-")) {
          const caseId = focusedEntity!.replace("CASE-", "");
          const res = await apiFetch(`/api/cases/CASE-${caseId}`);
          const caseData = await res.json();
          if (!res.ok) throw new Error(caseData.error || "Failed to load case");

          const isHeinous = caseData.GravityOffenceID === 1;
          const caseDossier: EntityDossier = {
            entityId: focusedEntity!,
            type: "Case",
            profile: {
              name: `FIR ${caseData.CaseNo} / Crime No: ${caseData.CrimeNo}`,
              status: caseData.CaseStatusID === 1 ? "OPEN" : "CLOSED",
              threatLevel: isHeinous ? "HEINOUS" : "NON-HEINOUS",
              notes: caseData.BriefFacts,
              address: caseData.UnitName,
              nationalId: caseData.CaseMasterID?.toString(),
            },
            aliases: [],
            riskIndicators: isHeinous ? ["Classified as a heinous offence (GravityOffenceID = 1)"] : [],
            activityTimeline: [],
          };

          if (!isMounted) return;
          setDossier(caseDossier);

          const accusedRels: RelationshipWithEvidence[] = (caseData.accused || []).map((a: any) => ({
            relationshipId: `rel-acc-${a.AccusedMasterID}`,
            type: "ACCUSED_IN",
            sourceEntity: { id: `ACCUSED-${a.AccusedMasterID}`, name: a.AccusedName, type: "Person" },
            targetEntity: { id: focusedEntity, name: `FIR ${caseData.CaseNo}`, type: "Case" },
            evidence: [],
          }));
          const victimRels: RelationshipWithEvidence[] = (caseData.victims || []).map((v: any) => ({
            relationshipId: `rel-vic-${v.VictimMasterID}`,
            type: "VICTIM_OF",
            sourceEntity: { id: `VICTIM-${v.VictimMasterID}`, name: v.VictimName, type: "Person" },
            targetEntity: { id: focusedEntity, name: `FIR ${caseData.CaseNo}`, type: "Case" },
            evidence: [],
          }));
          setRelationships([...accusedRels, ...victimRels]);
          return;
        }

        // Generic entity: parse the ID prefix (ACCUSED-/VICTIM-/COMP-/UNIT-/EMP-) to
        // resolve a profile via the real /api/entities/:type/:id endpoint.
        const [prefix, rawId] = focusedEntity!.split("-");
        const entityType = ENTITY_PREFIX_TO_TYPE[prefix];

        const relPromise = fetchEntityRelationships(focusedEntity!);

        if (entityType) {
          const profileRes = await apiFetch(`/api/entities/${entityType}/${rawId}`);
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (isMounted) {
              setDossier({
                entityId: focusedEntity!,
                type: profile.metadata?.Role || entityType,
                profile: {
                  name: profile.name,
                  age: profile.metadata?.Age,
                  gender: profile.metadata?.Gender,
                },
                aliases: [],
                riskIndicators: [],
                networkSummary: { directConnections: profile.network?.length || 0 },
                activityTimeline: [],
              });
            }
          } else if (isMounted) {
            setDossier(null);
            setLoadError("No profile record found for this entity.");
          }
        } else if (isMounted) {
          setDossier({ entityId: focusedEntity!, type: prefix || "Entity", profile: {} });
        }

        const rels = await relPromise;
        if (isMounted) setRelationships(rels);
      } catch (err: any) {
        if (isMounted) setLoadError(err?.message || "Failed to load entity data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

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
        <p className="text-xs text-tactical-400">
          Press <kbd className="px-1.5 py-0.5 bg-tactical-800 border border-tactical-600 rounded text-accent-cyan">Ctrl+K</kbd> to search the intelligence database, or select a case/entity from the map or FIR database.
        </p>
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

  if (!dossier) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-tactical-400 font-mono text-sm p-6 text-center">
        <Fingerprint className="w-10 h-10 mb-4 text-tactical-600" />
        <div className="font-bold text-white mb-2">Entity Not Found</div>
        <p className="text-xs text-tactical-500">{loadError || `No record exists for ${focusedEntity}.`}</p>
      </div>
    );
  }

  const activeDossier = dossier;
  const profile = activeDossier.profile || {};
  const timelineEvents = activeDossier.activityTimeline || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="flex flex-col">
            <IdentityCard dossier={activeDossier} />
            <RiskCard dossier={activeDossier} />

            <div className="p-4 border-b border-tactical-600">
              <span className="text-xxs font-mono text-tactical-400 uppercase tracking-widest mb-2 block font-bold">
                SESSION NOTES (not saved to server — cleared on reload)
              </span>
              <div className="flex flex-col gap-1.5 mb-3">
                {fieldNotesList.length === 0 ? (
                  <span className="text-xs font-mono text-tactical-500">No session notes yet.</span>
                ) : (
                  fieldNotesList.map((note, idx) => (
                    <div key={idx} className="p-2 rounded bg-tactical-900/80 border-l-2 border-l-accent-cyan text-xs text-tactical-200 font-mono">
                      {note}
                    </div>
                  ))
                )}
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
                  placeholder="Add a working note for this session..."
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

            {activeDossier.networkSummary && (
              <div className="p-4 border-b border-tactical-600">
                <span className="text-xxs font-mono text-tactical-500 uppercase tracking-widest mb-2 block">Network Summary</span>
                <div className="flex gap-4">
                  <div className="bg-tactical-900/50 p-3 border border-tactical-600 rounded flex-1 text-center">
                    <div className="text-xl font-bold text-tactical-100">{activeDossier.networkSummary.directConnections || 0}</div>
                    <div className="text-xxs font-mono text-tactical-500 uppercase">Direct Connections</div>
                  </div>
                </div>
              </div>
            )}

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

        {activeTab === "identity" && (
          <div className="p-4 flex flex-col gap-4">
            <div className="border border-tactical-600 rounded bg-tactical-800/30 p-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-cyan font-bold mb-3">
                Identity Profile
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
                {profile.age != null && (
                  <div>
                    <span className="text-tactical-400 block text-xxs uppercase">Age</span>
                    <span className="text-tactical-100">{profile.age}</span>
                  </div>
                )}
                {profile.gender && (
                  <div>
                    <span className="text-tactical-400 block text-xxs uppercase">Gender</span>
                    <span className="text-tactical-100">{profile.gender}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "relationships" && (
          <div className="p-3 flex flex-col gap-2">
            {relationships.length === 0 ? (
              <div className="p-4 rounded border border-tactical-800 bg-tactical-900/40 text-tactical-400 font-mono text-xs">
                No direct relationships recorded. This entity may be isolated or unlinked.
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
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="p-3 flex flex-col gap-2">
            {timelineEvents.length === 0 ? (
              <div className="p-4 rounded border border-tactical-800 bg-tactical-900/40 text-tactical-400 font-mono text-xs flex flex-col items-start gap-2">
                <span>No chronological activity events recorded for this entity.</span>
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
                    <div className="text-xxs font-mono text-tactical-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {evt.location}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
