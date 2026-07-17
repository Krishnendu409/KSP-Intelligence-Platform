import { describe, it, expect, beforeEach } from 'vitest';
import { dataIngestionEngine } from './DataIngestionEngine';
import { investigationRepository } from '../services/InvestigationRepository';

describe('Data Ingestion Engine (Capability Increment 3: Evidence Intelligence)', () => {
  beforeEach(() => {
    investigationRepository.clearAll();
  });

  it('validates row schemas and reports explicit row/column validation errors', () => {
    const invalidPersonRow = {
      type: 'PERSON',
      name: '', // missing required name
      phone: '+919845011223'
    };

    const validation = dataIngestionEngine.validateRow(invalidPersonRow, 1);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0].message).toContain('Missing required field: name');
  });

  it('computes deterministic cryptographic SHA-256 hash for evidence provenance', () => {
    const hash1 = dataIngestionEngine.computeSHA256('CDR_FILE_AIRTEL_ROW_42');
    const hash2 = dataIngestionEngine.computeSHA256('CDR_FILE_AIRTEL_ROW_42');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // 64 hex characters
  });

  it('ingests normalized records into investigation repository with full Data Provenance Stamp and duplicate detection', () => {
    const inv = investigationRepository.createInvestigation({
      title: 'Syndicate CDR Ingestion Case',
      codeName: 'ING-01'
    });

    // Seed existing entity to test duplicate detection
    investigationRepository.saveEntity(inv.id, {
      id: 'PERSON-ARJUN',
      type: 'PERSON',
      name: 'Arjun Sharma',
      phoneIds: ['PHONE-01']
    });

    const importRows = [
      {
        type: 'PERSON',
        name: 'Arjun Sharma',
        role: 'Kingpin',
        sourceFile: 'CDR_Airtel_July.csv',
        rowNumber: 12
      },
      {
        type: 'PHONE',
        phoneNumber: '+919845099887',
        subscriberName: 'Vikram Singh',
        sourceFile: 'CDR_Airtel_July.csv',
        rowNumber: 13
      }
    ];

    const result = dataIngestionEngine.ingestDataset({
      investigationId: inv.id,
      sourceFileName: 'CDR_Airtel_July.csv',
      officerId: 'OFFICER-77',
      rows: importRows
    });

    expect(result.successfulCount).toBe(2);
    expect(result.duplicateCount).toBe(1); // Arjun Sharma flagged as duplicate match

    const entities = investigationRepository.getEntitiesForInvestigation(inv.id);
    const vikramPhone = entities.find(e => e.phoneNumber === '+919845099887');
    expect(vikramPhone).toBeDefined();

    // Verify Data Provenance Stamp
    expect(vikramPhone?.provenance).toBeDefined();
    expect(vikramPhone?.provenance?.sourceFileName).toBe('CDR_Airtel_July.csv');
    expect(vikramPhone?.provenance?.importedByOfficerId).toBe('OFFICER-77');
    expect(vikramPhone?.provenance?.sourceFileHash).toHaveLength(64);
    expect(vikramPhone?.provenance?.rawRecordRef).toContain('Row 13');
  });
});
