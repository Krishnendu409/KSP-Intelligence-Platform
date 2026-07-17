export type SearchProfile = 'EXACT' | 'FUZZY' | 'INVESTIGATION' | 'FORENSIC';

export interface SearchQuery {
  text: string;
  profile: SearchProfile;
  entityTypes?: string[];
  filters?: Record<string, string>;
  limit: number;
  offset: number;
}

export interface SearchExplanation {
  factor: string;
  weight: number;
  details: string;
}

export interface SearchResult {
  score: number;
  matchedFields: string[];
  matchedTokens: string[];
  explanation: SearchExplanation[];
  entityType: string;
  entityId: string;
}
