export interface OperationalGraphNode {
  id: string;
  label: string;
  type: 'PERSON' | 'ORGANIZATION' | 'PHONE' | 'VEHICLE' | 'BANK_ACCOUNT' | 'LOCATION';
  role: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  caseIds: string[];
  degreeCentrality?: number;
  isBridge?: boolean;
  avatar?: string;
}

export interface OperationalGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'FINANCIAL_FLOW' | 'COMMUNICATION' | 'CO_ACCUSED' | 'LOGISTICS_SUPPORT' | 'OWNERSHIP';
  label: string;
  weight: number; // 1 to 10
  evidenceRef: string;
  amountINR?: number;
  callCount?: number;
}

export const OPERATIONAL_SYNDICATE_NODES: OperationalGraphNode[] = [
  // Syndicate Kingpins & Core Suspects
  { id: "PER-8832", label: "Arjun Sharma", type: "PERSON", role: "Syndicate Kingpin", threatLevel: "CRITICAL", caseIds: ["FIR-2026-0889", "FIR-2026-0901"] },
  { id: "PER-9910", label: "Vikram Desai", type: "PERSON", role: "Primary Hawala Financier", threatLevel: "CRITICAL", caseIds: ["FIR-2026-0889", "FIR-2026-1104"] },
  { id: "PER-4412", label: "Rohan Varma", type: "PERSON", role: "Darknet Cyber Specialist", threatLevel: "HIGH", caseIds: ["FIR-2026-0412", "FIR-2026-1104"] },
  { id: "PER-3321", label: "Kabir Khan", type: "PERSON", role: "Contraband Logistics Coordinator", threatLevel: "HIGH", caseIds: ["FIR-2026-0901", "FIR-2026-0155"] },
  { id: "PER-5501", label: "Meera Nair", type: "PERSON", role: "Shell Company Director", threatLevel: "MEDIUM", caseIds: ["FIR-2026-0889", "FIR-2026-1104"] },

  // Key Organizations & Shell Companies
  { id: "ORG-101", label: "Apex Logistics Ltd", type: "ORGANIZATION", role: "Front Cargo Operation", threatLevel: "HIGH", caseIds: ["FIR-2026-0901"] },
  { id: "ORG-202", label: "Zodiac FinTech Shell", type: "ORGANIZATION", role: "Crypto Mixing Shell", threatLevel: "CRITICAL", caseIds: ["FIR-2026-1104"] },

  // Communication & Digital Nodes
  { id: "PH-9880123456", label: "+91 98801 23456", type: "PHONE", role: "Arjun Burner Handset", threatLevel: "CRITICAL", caseIds: ["FIR-2026-0889"] },
  { id: "PH-9845099112", label: "+91 98450 99112", type: "PHONE", role: "Vikram Encrypted Line", threatLevel: "HIGH", caseIds: ["FIR-2026-0889", "FIR-2026-1104"] },

  // Financial Accounts
  { id: "ACC-HDFC-9921", label: "HDFC Acc *9921", type: "BANK_ACCOUNT", role: "Primary Hawala Pool", threatLevel: "CRITICAL", caseIds: ["FIR-2026-0889", "FIR-2026-1104"] },
  { id: "ACC-ICICI-4410", label: "ICICI Acc *4410", type: "BANK_ACCOUNT", role: "Cyber Fraud Escrow", threatLevel: "HIGH", caseIds: ["FIR-2026-0412"] },

  // Physical Assets & Locations
  { id: "KA01MF2345", label: "Fortuner KA01MF2345", type: "VEHICLE", role: "Weapons Transport SUV", threatLevel: "CRITICAL", caseIds: ["FIR-2026-0889"] },
  { id: "LOC-IND-WH1", label: "Indiranagar Godown #14", type: "LOCATION", role: "Weapons Staging Cache", threatLevel: "CRITICAL", caseIds: ["FIR-2026-0889"] }
];

export const OPERATIONAL_SYNDICATE_EDGES: OperationalGraphEdge[] = [
  { id: "EDG-101", source: "PER-8832", target: "PER-9910", relationship: "FINANCIAL_FLOW", label: "₹4.2 Cr Hawala Transfer", weight: 9, evidenceRef: "EVID-889-FIN01", amountINR: 42000000 },
  { id: "EDG-102", source: "PER-8832", target: "PH-9880123456", relationship: "OWNERSHIP", label: "Registered Burner IMEI", weight: 8, evidenceRef: "EVID-889-CDR04" },
  { id: "EDG-103", source: "PH-9880123456", target: "PH-9845099112", relationship: "COMMUNICATION", label: "84 Encrypted Calls (7 Days)", weight: 7, evidenceRef: "EVID-889-CDR09", callCount: 84 },
  { id: "EDG-104", source: "PER-9910", target: "ACC-HDFC-9921", relationship: "OWNERSHIP", label: "Signatory Authority", weight: 10, evidenceRef: "EVID-889-BNK02" },
  { id: "EDG-105", source: "ACC-HDFC-9921", target: "ORG-202", relationship: "FINANCIAL_FLOW", label: "₹1.8 Cr Crypto Liquidation", weight: 9, evidenceRef: "EVID-1104-LEDG" },
  { id: "EDG-106", source: "PER-4412", target: "ORG-202", relationship: "LOGISTICS_SUPPORT", label: "Darknet Infrastructure Host", weight: 8, evidenceRef: "EVID-1104-SERVER" },
  { id: "EDG-107", source: "PER-8832", target: "KA01MF2345", relationship: "OWNERSHIP", label: "Primary User / ANPR Hit", weight: 9, evidenceRef: "EVID-889-ANPR12" },
  { id: "EDG-108", source: "KA01MF2345", target: "LOC-IND-WH1", relationship: "LOGISTICS_SUPPORT", label: "Frequent Night Arrivals", weight: 8, evidenceRef: "EVID-889-CCTV" },
  { id: "EDG-109", source: "PER-3321", target: "ORG-101", relationship: "CO_ACCUSED", label: "Logistics Hub Manager", weight: 7, evidenceRef: "EVID-901-TRANS" },
  { id: "EDG-110", source: "PER-8832", target: "PER-3321", relationship: "CO_ACCUSED", label: "Co-Conspirators FIR-0901", weight: 9, evidenceRef: "EVID-901-FIR" },
  { id: "EDG-111", source: "PER-5501", target: "ORG-202", relationship: "OWNERSHIP", label: "Proxy Shareholder", weight: 6, evidenceRef: "EVID-1104-REG" }
];

export function calculateCentrality(nodes: OperationalGraphNode[], edges: OperationalGraphEdge[]): OperationalGraphNode[] {
  const degreeMap = new Map<string, number>();
  nodes.forEach(n => degreeMap.set(n.id, 0));

  edges.forEach(e => {
    degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + e.weight);
    degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + e.weight);
  });

  return nodes.map(node => {
    const deg = degreeMap.get(node.id) || 0;
    // Bridge nodes connect financial or cross-case edges
    const isBridge = edges.some(e =>
      (e.source === node.id || e.target === node.id) &&
      (e.relationship === 'FINANCIAL_FLOW' || node.caseIds.length > 1)
    );
    return {
      ...node,
      degreeCentrality: deg,
      isBridge
    };
  });
}

export function findShortestPath(sourceId: string, targetId: string, edges: OperationalGraphEdge[]): string[] {
  if (sourceId === targetId) return [sourceId];
  const adj = new Map<string, string[]>();

  edges.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  });

  const queue: string[][] = [[sourceId]];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    const neighbors = adj.get(node) || [];
    for (const next of neighbors) {
      if (next === targetId) {
        return [...path, next];
      }
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }
  return [];
}
