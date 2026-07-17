// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { EvidentiaryPathTrace } from './EvidentiaryPathTrace';
import { RelationshipConfidenceExplorer } from '../relationship/RelationshipConfidenceExplorer';

describe('Evidentiary Path Trace & Relationship Confidence Explorer (i2/Gotham Parity)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders complete evidentiary path trace for an entity or edge with FIRs, evidence tags, and challenge button', () => {
    const mockOnChallenge = vi.fn();
    render(
      <EvidentiaryPathTrace
        subjectId="PERSON-ARJUN"
        conclusion="HIGH_RISK_SYNDICATE_OPERATIVE"
        confidenceGrade="A1"
        supportingFIRs={['FIR-2026-089', 'FIR-2026-104']}
        evidenceIds={['EVD-CDR-8819', 'EVD-ANPR-9921']}
        reasons={[
          '90-day CDR co-location with Dubai clearing node',
          'ANPR vehicle checkpoint capture along border route'
        ]}
        onChallenge={mockOnChallenge}
      />
    );

    expect(screen.getByText(/PERSON-ARJUN/i)).toBeDefined();
    expect(screen.getByText(/FIR-2026-089/i)).toBeDefined();
    expect(screen.getByText(/EVD-CDR-8819/i)).toBeDefined();
    expect(screen.getByText(/90-day CDR co-location/i)).toBeDefined();

    const challengeBtn = screen.getByText(/Challenge Intelligence/i);
    fireEvent.click(challengeBtn);
    expect(mockOnChallenge).toHaveBeenCalledTimes(1);
  });

  it('renders RelationshipConfidenceExplorer showing why two entities are linked and allows challenging the edge', () => {
    const mockChallengeEdge = vi.fn();
    render(
      <RelationshipConfidenceExplorer
        sourceId="PERSON-ARJUN"
        sourceName="Arjun Sharma"
        targetId="PERSON-VIKRAM"
        targetName="Vikram Desai"
        relationType="HAWALA_CLEARING"
        confidenceGrade="A1"
        firId="FIR-2026-089"
        evidenceRef="EVD-FIN-4421"
        rationale="Ledger entry #99182 links Arjun to Vikram shell account"
        onChallengeEdge={mockChallengeEdge}
      />
    );

    expect(screen.getByText(/HAWALA_CLEARING/i)).toBeDefined();
    expect(screen.getByText(/Arjun Sharma/i)).toBeDefined();
    expect(screen.getByText(/Vikram Desai/i)).toBeDefined();
    expect(screen.getByText(/Ledger entry #99182/i)).toBeDefined();

    const challengeBtn = screen.getByText(/Challenge Relationship/i);
    fireEvent.click(challengeBtn);
    expect(mockChallengeEdge).toHaveBeenCalledTimes(1);
  });
});
