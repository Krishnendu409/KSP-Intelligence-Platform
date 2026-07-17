export interface InvestigationHypothesis {
  id: string;
  investigationId: string;
  statement: string;
  confidenceGrade: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'D1' | 'D2' | 'E1' | 'F6';
  status: 'PROPOSED' | 'TESTING' | 'SUPPORTED' | 'REJECTED' | 'PROVEN';
  supportingEvidenceIds: string[];
  refutingEvidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

class HypothesisServiceImpl {
  private hypotheses: Map<string, InvestigationHypothesis> = new Map();

  createHypothesis(investigationId: string, params: Partial<InvestigationHypothesis> & { statement: string }): InvestigationHypothesis {
    const id = params.id || `HYP-${Math.floor(Math.random() * 100000)}`;
    const hyp: InvestigationHypothesis = {
      id,
      investigationId,
      statement: params.statement,
      confidenceGrade: params.confidenceGrade || 'B2',
      status: params.status || 'PROPOSED',
      supportingEvidenceIds: params.supportingEvidenceIds || [],
      refutingEvidenceIds: params.refutingEvidenceIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.hypotheses.set(id, hyp);
    return hyp;
  }

  getHypothesis(id: string): InvestigationHypothesis | undefined {
    return this.hypotheses.get(id);
  }

  getHypothesesForInvestigation(investigationId: string): InvestigationHypothesis[] {
    return Array.from(this.hypotheses.values()).filter(h => h.investigationId === investigationId);
  }

  updateStatus(id: string, status: InvestigationHypothesis['status'], supportingEvidenceIds?: string[]): InvestigationHypothesis | undefined {
    const existing = this.hypotheses.get(id);
    if (!existing) return undefined;
    const updated: InvestigationHypothesis = {
      ...existing,
      status,
      supportingEvidenceIds: supportingEvidenceIds || existing.supportingEvidenceIds,
      updatedAt: new Date().toISOString()
    };
    this.hypotheses.set(id, updated);
    return updated;
  }

  clearAll() {
    this.hypotheses.clear();
  }
}

export const hypothesisService = new HypothesisServiceImpl();
