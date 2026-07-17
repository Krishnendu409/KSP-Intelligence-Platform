export interface EntityCandidate {
  id: string;
  type: string;
  name: string;
  metadata: Record<string, string>;
}

export interface NormalizedFIR {
  case: {
    id: string; // Usually mapped from FIR ID
    title: string;
    description: string;
    status: string;
  };
  event: {
    id: string;
    caseId: string;
    type: string;
    description: string;
    timestamp: string;
    location: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  entityCandidates: EntityCandidate[];
}
