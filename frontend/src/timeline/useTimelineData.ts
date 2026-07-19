import { useState, useMemo, useEffect } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { apiFetch } from "../shared/api/apiFetch";

const ENTITY_PREFIX_TO_TYPE: Record<string, string> = {
  ACCUSED: "accused",
  VICTIM: "victim",
  COMP: "complainant",
};

/** Fetches the real case-level timeline for a CASE-N id, or falls back to
 * resolving a generic entity's linked cases and merging their timelines. */
async function fetchTimelineForTarget(id: string): Promise<any[]> {
  if (id.startsWith("CASE-")) {
    const caseId = id.replace("CASE-", "");
    const res = await apiFetch(`/api/cases/CASE-${caseId}/timeline`);
    return res.ok ? res.json() : [];
  }

  const [prefix, rawId] = id.split("-");
  const entityType = ENTITY_PREFIX_TO_TYPE[prefix];
  if (!entityType) return [];

  const profileRes = await apiFetch(`/api/entities/${entityType}/${rawId}`);
  if (!profileRes.ok) return [];
  const profile = await profileRes.json();
  const linkedCases: string[] = profile.linkedCases || [];

  const caseTimelines = await Promise.all(
    linkedCases.map((caseId) =>
      apiFetch(`/api/cases/${caseId}/timeline`).then((r) => (r.ok ? r.json() : [])).catch(() => [])
    )
  );
  return caseTimelines.flat();
}

export function useTimelineData() {
  const { focusedEntity, selection } = useInvestigationStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<"None" | "Day" | "Month" | "Type">("Day");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const targetIds = selection.multiSelected && selection.multiSelected.length > 0
      ? selection.multiSelected
      : (focusedEntity ? [focusedEntity] : []);

    if (targetIds.length === 0) {
      setEvents([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all(targetIds.map((id) => fetchTimelineForTarget(id).catch(() => [])))
      .then((results) => {
        if (!isMounted) return;
        const seen = new Set<string>();
        const merged: any[] = [];
        for (const list of results) {
          for (const ev of (Array.isArray(list) ? list : [])) {
            if (ev.id && !seen.has(ev.id)) {
              seen.add(ev.id);
              merged.push(ev);
            }
          }
        }
        setEvents(merged);
      })
      .catch((err: any) => {
        console.error("Failed to load timeline:", err);
        if (isMounted) setEvents([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [focusedEntity, selection.multiSelected]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (activeFilter !== "ALL" && e.type?.toUpperCase() !== activeFilter && e.actionType?.toUpperCase() !== activeFilter) {
        return false;
      }
      if (startDate && e.timestamp && new Date(e.timestamp) < new Date(startDate)) {
        return false;
      }
      if (endDate && e.timestamp && new Date(e.timestamp) > new Date(endDate)) {
        return false;
      }
      return true;
    });
  }, [events, activeFilter, startDate, endDate]);

  const groupedEvents = useMemo(() => {
    if (groupBy === "None") {
      return [{ groupTitle: null, items: filteredEvents }];
    }

    const groups: { [key: string]: any[] } = {};

    filteredEvents.forEach(e => {
      let key = "Other";
      if (groupBy === "Type") {
        key = e.type || e.actionType || "Event";
      } else if (e.timestamp) {
        const date = new Date(e.timestamp);
        if (groupBy === "Day") {
          key = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } else if (groupBy === "Month") {
          key = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
        }
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    return Object.entries(groups).map(([groupTitle, items]) => ({
      groupTitle,
      items
    }));
  }, [filteredEvents, groupBy]);

  return {
    events,
    filteredEvents,
    groupedEvents,
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
    setEndDate
  };
}
