import type { Evidence } from './Evidence';
import type { Reason } from './Reason';
import type { Confidence } from './Confidence';

export interface Inference {
  id: string;
  hypothesis: string;
  confidence: Confidence;
  evidenceIds: string[];
}

export interface Result<T> {
  payload: T;
  confidence: Confidence;
  reasons: Reason[];
  evidence: Evidence[];
}
