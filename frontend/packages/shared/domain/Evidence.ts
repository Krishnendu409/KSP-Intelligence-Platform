export type EvidenceCategory =
  | 'PHOTO'
  | 'VIDEO'
  | 'STATEMENT'
  | 'FORENSIC'
  | 'DIGITAL'
  | 'FINANCIAL'
  | 'CCTV'
  | 'DOCUMENT';

export interface EvidenceItem {
  id: string;
  title?: string;
  category: EvidenceCategory;
  description: string;
  sourceEntityId: string | null;
  sourceCaseId: string | null;
  sourceFirReference: string | null;
  collectedAt: string;
  collectedBy: string | null;
  fileReference: string | null;
  confidence: number;
  metadata?: Record<string, string>;
  linkedEntityIds?: string[];
}

export type FirstClassEvidence = EvidenceItem;
