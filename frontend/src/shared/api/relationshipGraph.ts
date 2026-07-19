import type { RelationshipWithEvidence } from '@shared/client';
import { apiFetch } from './apiFetch';

/**
 * The real backend's GET /api/entities/:id/relationships returns Cytoscape
 * graph elements (nodes + edges), not a flat RelationshipWithEvidence[]. This
 * fetches that graph and flattens it into edge-centric records for panels
 * that want a simple relationship list instead of a graph view.
 */
export async function fetchEntityRelationships(entityId: string): Promise<RelationshipWithEvidence[]> {
  const res = await apiFetch(`/api/entities/${encodeURIComponent(entityId)}/relationships`);
  if (!res.ok) return [];
  const graph = await res.json();
  if (!Array.isArray(graph)) return [];

  const nodesById = new Map(
    graph.filter((el: any) => !el.data?.source).map((n: any) => [n.data.id, n.data])
  );

  return graph
    .filter((el: any) => el.data?.source && el.data?.target)
    .map((e: any) => {
      const sourceNode = nodesById.get(e.data.source);
      const targetNode = nodesById.get(e.data.target);
      return {
        relationshipId: e.data.id,
        type: e.data.label || 'LINKED',
        sourceEntity: sourceNode
          ? { id: sourceNode.id, name: sourceNode.label, type: sourceNode.type }
          : { id: e.data.source, name: e.data.source, type: 'UNKNOWN' },
        targetEntity: targetNode
          ? { id: targetNode.id, name: targetNode.label, type: targetNode.type }
          : { id: e.data.target, name: e.data.target, type: 'UNKNOWN' },
        evidence: [],
      };
    });
}
