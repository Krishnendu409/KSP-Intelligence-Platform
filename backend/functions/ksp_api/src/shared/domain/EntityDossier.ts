export interface EntityDossier {
  entityId: string;
  generatedAt: string;
  pipelineVersion: string;
  datasetVersion: string;
  
  // Core Intelligence Aggregates
  profile: {
    type: string;
    name: string;
    aliases: string[];
    identifiers: Record<string, string>;
  };
  
  timeline: {
    firstSeen: string;
    lastSeen: string;
    totalEvents: number;
    events: Array<{
      id: string;
      type: string;
      timestamp: string;
      description: string | null;
    }>;
  };

  relationships: {
    totalEdges: number;
    edges: Array<{
      id: string;
      targetId: string;
      type: string;
    }>;
  };

  spatial: {
    totalLocations: number;
    locations: Array<{
      latitude: number;
      longitude: number;
      locationName: string | null;
    }>;
  };

  riskIndicators?: string[];
}
