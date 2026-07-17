import { useEffect, useState } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { DefaultService } from "@shared/client";
import type { RelationshipWithEvidence } from "@shared/client";
import { Loader2, Share2, FileText } from "lucide-react";
import { DataGrid } from "../components/common/DataGrid";
import type { Column } from "../components/common/DataGrid";

export function RelationshipPanel() {
  const { focusedEntity, selection, openInspector, setFocusedEntity } = useInvestigationStore();
  const [relationships, setRelationships] = useState<RelationshipWithEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const targetIds = selection.multiSelected && selection.multiSelected.length > 0 
      ? selection.multiSelected 
      : (focusedEntity ? [focusedEntity] : []);

    if (targetIds.length === 0) {
      setRelationships([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all(targetIds.map(id => DefaultService.getApiEntitiesRelationships(id).catch(() => [])))
      .then((results) => {
        if (!isMounted) return;
        const seen = new Set<string>();
        const merged: RelationshipWithEvidence[] = [];
        for (const list of results) {
          for (const rel of (list || [])) {
            if (rel.relationshipId && !seen.has(rel.relationshipId)) {
              seen.add(rel.relationshipId);
              merged.push(rel);
            }
          }
        }
        setRelationships(merged);
      })
      .catch((err: any) => {
        console.error("Relationships error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [focusedEntity, selection.multiSelected]);

  const columns: Column<RelationshipWithEvidence>[] = [
    {
      key: "targetEntity",
      header: "Related Entity (Click to Pivot)",
      cell: (val) => {
        const otherEntity = val.sourceEntity?.id === focusedEntity ? val.targetEntity : val.sourceEntity;
        return (
          <span className="font-mono text-xs text-accent-cyan underline cursor-pointer hover:text-white transition-colors">
            {otherEntity?.name || otherEntity?.id || "Unknown"} →
          </span>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      cell: (val) => (
        <span className="font-mono text-xs uppercase tracking-wider text-accent-cyan">
          {val.type}
        </span>
      ),
    },
    {
      key: "evidence",
      header: "Evidence",
      cell: (val) => (
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-tactical-500" />
          <span className="font-mono text-xs text-tactical-300">
            {Array.isArray(val.evidence) ? `${val.evidence.length} records` : "0 records"}
          </span>
        </div>
      ),
    }
  ];

  if (!focusedEntity) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-tactical-500 font-mono text-sm p-4 text-center">
        <Share2 className="w-8 h-8 mb-4 opacity-50" />
        Select an entity to view its immediate network.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-tactical-800">
      <div className="flex items-center justify-between p-2 border-b border-tactical-600 bg-tactical-900/50">
        <div className="flex items-center gap-2 text-tactical-400 font-mono text-xs uppercase">
          <Share2 className="w-4 h-4" />
          <span>One-Hop Relationships</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-accent-cyan">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : relationships.length === 0 ? (
          <div className="p-6 text-center font-mono text-xs mt-4 border border-tactical-800 rounded bg-tactical-900/40 max-w-md mx-auto flex flex-col items-center gap-2">
            <span className="text-tactical-300">No relationships recorded. This entity may be isolated.</span>
            <span className="text-xxs text-accent-cyan">Check aliased phone numbers or use the graph above to explore secondary links →</span>
          </div>
        ) : (
          <DataGrid 
            data={relationships} 
            columns={columns}
            keyExtractor={(row: any) => row.relationshipId || String(Math.random())}
            onRowClick={(row: any) => {
              const otherEntity = row.sourceEntity?.id === focusedEntity ? row.targetEntity : row.sourceEntity;
              // Pivot the workspace to the related entity immediately
              if (otherEntity?.id) {
                setFocusedEntity(
                  otherEntity.id,
                  otherEntity.name || otherEntity.id
                );
              }
              // Also open the relationship inspector for evidence review
              openInspector("RELATIONSHIP", {
                id: row.relationshipId || row.id || "REL-001",
                sourceId: row.sourceId || focusedEntity || "SOURCE",
                targetId: row.targetId || otherEntity?.id || "TARGET",
                targetName: otherEntity?.name,
                type: row.type || "ASSOCIATE",
                confidence: row.confidence || 0.85,
                evidence: row.evidence
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
