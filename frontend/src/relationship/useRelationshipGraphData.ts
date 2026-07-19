import { useState, useEffect } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { apiFetch } from "../shared/api/apiFetch";

export interface SelectedNodeInfo {
  id: string;
  label: string;
  type: string;
  pinned: boolean;
  role?: string;
  threatLevel?: string;
  degreeCentrality?: number;
  isBridge?: boolean;
}

export function useRelationshipGraphData() {
  const { focusedEntity, activeCase } = useInvestigationStore();
  const [elements, setElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    const currentId = activeCase || focusedEntity || 'CASE-1';

    setLoading(true);

    apiFetch(`/api/entities/${currentId}/relationships`)
      .then(res => {
        if (!res.ok) throw new Error("Network request failed");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setElements(data);
      })
      .catch((err) => {
        console.error("Graph error:", err);
        if (isMounted) setElements([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [focusedEntity, activeCase]);

  return {
    elements,
    loading,
    selectedNode,
    setSelectedNode,
    setElements
  };
}
