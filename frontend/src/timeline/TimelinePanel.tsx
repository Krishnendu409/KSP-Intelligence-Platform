
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { Loader2, CalendarClock, ChevronDown, Filter, Calendar, ExternalLink, Zap } from "lucide-react";
import { Badge } from "../components/common/Badge";
import { useTimelineData } from "./useTimelineData";

const filterCategories = [
  { id: "ALL", label: "All" },
  { id: "INCIDENT_OCCURRED", label: "Incidents" },
  { id: "FIR_REGISTERED", label: "FIRs" },
  { id: "ARREST", label: "Arrests" },
  { id: "COMMUNICATION", label: "Comms" },
  { id: "FINANCIAL", label: "Financial" },
];

export function TimelinePanel() {
  const { focusedEntity, setFocusedEntity, openInspector } = useInvestigationStore();
  const {
    loading,
    groupBy,
    setGroupBy,
    isGroupDropdownOpen,
    setIsGroupDropdownOpen,
    activeFilter,
    setActiveFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredEvents,
    groupedEvents
  } = useTimelineData();

  if (!focusedEntity) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-tactical-500 font-mono text-sm p-4 text-center">
        <CalendarClock className="w-8 h-8 mb-4 opacity-50" />
        Select an entity to view investigation timeline.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-tactical-800">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-2 border-b border-tactical-600 bg-tactical-900/50 gap-2">
        <div className="flex items-center gap-2 text-tactical-300 font-mono text-xs uppercase">
          <CalendarClock className="w-4 h-4 text-accent-cyan" />
          <span>Timeline ({filteredEvents.length})</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Group By selector */}
          <div className="relative">
            <button
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className="flex items-center gap-1.5 bg-tactical-700 border border-tactical-600 px-2 py-1 rounded text-xs font-mono hover:bg-tactical-600 text-tactical-100 transition-colors"
            >
              <span className="text-tactical-400">Group:</span>
              <span className="text-accent-cyan font-bold">{groupBy}</span>
              <ChevronDown className="w-3 h-3 text-tactical-400" />
            </button>

            {isGroupDropdownOpen && (
              <div className="absolute right-0 mt-1 bg-tactical-900 border border-tactical-600 rounded shadow-lg z-30 py-1 min-w-[100px] font-mono text-xs">
                {(["None", "Day", "Month", "Type"] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setGroupBy(option);
                      setIsGroupDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-tactical-800 transition-colors ${
                      groupBy === option ? "text-accent-cyan bg-tactical-800/50" : "text-tactical-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-tactical-900/30 border-b border-tactical-700 font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-tactical-400 mr-1 shrink-0" />
          {filterCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-2 py-0.5 rounded text-xxs tracking-wider transition-colors shrink-0 ${
                activeFilter === cat.id
                  ? "bg-accent-cyan/20 border border-accent-cyan text-accent-cyan"
                  : "bg-tactical-800 text-tactical-400 hover:text-tactical-200 border border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center gap-2 text-xxs text-tactical-400">
          <Calendar className="w-3.5 h-3.5" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-tactical-900 border border-tactical-600 rounded px-1.5 py-0.5 text-tactical-200 focus:border-accent-cyan outline-none"
            placeholder="From"
          />
          <span>–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-tactical-900 border border-tactical-600 rounded px-1.5 py-0.5 text-tactical-200 focus:border-accent-cyan outline-none"
            placeholder="To"
          />
        </div>
      </div>

      {/* Events Stream */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-accent-cyan">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-6 text-center font-mono text-xs mt-4 border border-tactical-800 rounded bg-tactical-900/40 max-w-md mx-auto flex flex-col items-center gap-3">
            <span className="text-tactical-300">No chronological events match the current filter or selection.</span>
            {(activeFilter !== "ALL" || startDate || endDate) ? (
              <button
                onClick={() => {
                  setActiveFilter("ALL");
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-2.5 py-1 rounded bg-accent-cyan/20 border border-accent-cyan text-accent-cyan font-bold hover:bg-accent-cyan/30 transition-colors"
              >
                Clear Filters →
              </button>
            ) : (
              <span className="text-xxs text-tactical-500">Select an entity with recorded activity or open a Case file to view its timeline.</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groupedEvents.map((group, groupIdx) => (
              <div key={groupIdx}>
                {group.groupTitle && (
                  <div className="sticky top-0 z-10 flex items-center gap-2 py-1 mb-3 bg-tactical-800/90 backdrop-blur">
                    <span className="font-mono text-xxs uppercase tracking-wider text-accent-cyan bg-tactical-900 border border-tactical-600 px-2 py-0.5 rounded">
                      {group.groupTitle}
                    </span>
                    <div className="flex-1 h-px bg-tactical-600/50" />
                  </div>
                )}

                <div className="flex flex-col gap-0 border-l-2 border-tactical-600 ml-3 pl-4">
                  {group.items.map((event: any, idx: number) => (
                    <div key={idx} className="relative py-3 group">
                      <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 bg-accent-cyan rounded-full ring-4 ring-tactical-800 group-hover:scale-125 transition-transform" />
                      
                      <div 
                        onClick={() => openInspector("EVENT", event)}
                        className="flex flex-col bg-tactical-900/80 border border-tactical-600/80 rounded p-3.5 hover:border-accent-cyan/80 hover:bg-tactical-900 transition-all cursor-pointer shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs text-tactical-300">
                            {new Date(event.timestamp || Date.now()).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {event.confidenceGrade && (
                              <span className="font-mono text-xxs px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                                GRADE {event.confidenceGrade}
                              </span>
                            )}
                            <Badge variant={event.type === "Crime" ? "danger" : "outline"}>
                              {event.actionType || event.type || "Event"}
                            </Badge>
                          </div>
                        </div>

                        <h4 className="text-sm font-semibold text-tactical-100 mb-1">
                          {event.title || (event.type ? `${event.type} Record` : "Unknown Event")}
                        </h4>
                        <p className="text-xs text-tactical-300 mb-3">{event.details || event.description}</p>

                        {event.evidenceRef && (
                          <div className="flex items-center gap-1.5 mb-3 px-2 py-1 rounded bg-tactical-950/80 border border-tactical-700/60 font-mono text-xxs text-tactical-300">
                            <span className="text-accent-cyan font-semibold">SOURCE EVIDENCE:</span>
                            <span>{event.evidenceRef}</span>
                          </div>
                        )}

                        {/* Interactive Related Entities */}
                        {event.relatedEntities && event.relatedEntities.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mb-2">
                            <span className="text-xxs font-mono text-tactical-400 mr-1">Involved:</span>
                            {event.relatedEntities.map((rel: any, ridx: number) => (
                              <button
                                key={ridx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rel.id && setFocusedEntity(rel.id);
                                }}
                                className="text-xxs font-mono bg-tactical-800 hover:bg-tactical-700 text-accent-cyan border border-tactical-600 px-1.5 py-0.5 rounded transition-colors"
                              >
                                {rel.name || rel.id} →
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Actionable Launch Button */}
                        {event.actionLabel ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInspector("EVENT", event);
                            }}
                            className="w-full mt-1 px-3 py-1.5 rounded bg-accent-cyan/15 hover:bg-accent-cyan/30 border border-accent-cyan/50 text-accent-cyan font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>{event.actionLabel}</span>
                          </button>
                        ) : null}

                        <div className="text-xxs font-mono text-tactical-400 mt-2 border-t border-tactical-700/60 pt-2 flex items-center justify-between">
                          <span>Event ID: {event.id || "N/A"}</span>
                          {event.relatedEntityId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFocusedEntity(event.relatedEntityId);
                              }}
                              className="text-accent-cyan hover:text-white flex items-center gap-1 transition-colors underline"
                            >
                              <span>Pivot to Entity</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
