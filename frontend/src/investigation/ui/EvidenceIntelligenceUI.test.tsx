// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DataIngestionWizard } from './DataIngestionWizard';
import { LineageProvenanceExplorer } from './LineageProvenanceExplorer';
import { investigationRepository } from '../services/InvestigationRepository';

describe('Evidence Intelligence UI (Capability Increment 3)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders DataIngestionWizard, validates sample CSV/JSON input, and imports entities with Data Provenance Stamp', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Evidence Case',
      codeName: 'EV-100'
    });

    render(<DataIngestionWizard investigationId={inv.id} officerId="OFFICER-99" onClose={() => {}} />);

    expect(screen.getByText(/Enterprise Data Ingestion Wizard/i)).toBeDefined();
    expect(screen.getByText(/Domain Data Source/i)).toBeDefined();

    // Fill sample tabular rows in JSON text area
    const textarea = screen.getByTestId('raw-dataset-input');
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify([
          { type: 'PERSON', name: 'Rohan Verma', role: 'Financier', phone: '+919845011111' },
          { type: 'PHONE', phoneNumber: '+919845011111', subscriberName: 'Rohan Verma' }
        ])
      }
    });

    const validateBtn = screen.getByText(/Validate & Preview Schema/i);
    fireEvent.click(validateBtn);

    expect(screen.getByText(/Validation Passed: 2 records ready/i)).toBeDefined();

    const importBtn = screen.getByText(/Stamp Provenance & Ingest/i);
    fireEvent.click(importBtn);

    expect(screen.getByText(/Successfully Ingested 2 Entities/i)).toBeDefined();

    const entities = investigationRepository.getEntitiesForInvestigation(inv.id);
    expect(entities.length).toBe(2);
    expect(entities[0].provenance.importedByOfficerId).toBe('OFFICER-99');
    expect(entities[0].provenance.sourceFileHash).toHaveLength(64);
  });

  it('renders LineageProvenanceExplorer showing source file, cryptographic hash, and raw record ref', () => {
    const sampleEntity = {
      id: 'PERSON-101',
      type: 'PERSON',
      name: 'Rohan Verma',
      provenance: {
        sourceFileName: 'CDR_Export_July.csv',
        sourceFileHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
        importedByOfficerId: 'OFFICER-99',
        importTimestamp: '2026-07-12T16:00:00Z',
        rawRecordRef: 'File: CDR_Export_July.csv | Row 1'
      }
    };

    render(<LineageProvenanceExplorer entity={sampleEntity} onClose={() => {}} />);

    expect(screen.getByText(/Data Lineage & Cryptographic Provenance/i)).toBeDefined();
    expect(screen.getAllByText(/CDR_Export_July.csv/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/OFFICER-99/i)).toBeDefined();
    expect(screen.getByText(/a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90/i)).toBeDefined();
  });
});
