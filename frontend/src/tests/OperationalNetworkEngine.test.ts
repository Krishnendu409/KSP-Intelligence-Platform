import { describe, it, expect } from 'vitest';
import {
  OPERATIONAL_SYNDICATE_NODES,
  OPERATIONAL_SYNDICATE_EDGES,
  calculateCentrality,
  findShortestPath
} from '../lib/operationalNetworkEngine';

describe('OperationalNetworkEngine Module (TDD)', () => {
  it('calculates degree centrality and identifies kingpins/bridge nodes', () => {
    const nodesWithCentrality = calculateCentrality(OPERATIONAL_SYNDICATE_NODES, OPERATIONAL_SYNDICATE_EDGES);
    const arjun = nodesWithCentrality.find(n => n.id === 'PER-8832');
    expect(arjun).toBeDefined();
    expect(arjun!.degreeCentrality).toBeGreaterThan(15);
    expect(arjun!.isBridge).toBe(true);
  });

  it('finds shortest evidentiary path between two suspect nodes', () => {
    // Path between Arjun Sharma (PER-8832) and Shell Company (ORG-202)
    const path = findShortestPath('PER-8832', 'ORG-202', OPERATIONAL_SYNDICATE_EDGES);
    expect(path.length).toBeGreaterThan(1);
    expect(path[0]).toBe('PER-8832');
    expect(path[path.length - 1]).toBe('ORG-202');
  });

  it('has financial flows with INR amounts and call records', () => {
    const financialEdge = OPERATIONAL_SYNDICATE_EDGES.find(e => e.relationship === 'FINANCIAL_FLOW');
    expect(financialEdge?.amountINR).toBe(42000000);
  });
});
