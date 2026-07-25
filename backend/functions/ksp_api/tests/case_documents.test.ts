import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initCaseDocumentsTable, getCaseDocuments, saveCaseDocument } from '../src/services/case_documents.service';

describe('Case Documents Storage Service (TDD)', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initCaseDocumentsTable(db);
  });

  it('initializes the CaseDocuments table cleanly', () => {
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='CaseDocuments'").get();
    expect(tableInfo).toBeDefined();
  });

  it('saves and retrieves documents uploaded to a specific case', () => {
    const newDoc = saveCaseDocument(db, {
      caseMasterId: 2005,
      documentTitle: 'Handwritten_FIR_OCR_Transcript.pdf',
      documentType: 'HANDWRITTEN_OCR',
      content: 'Extracted OCR Text from handwritten complaint: On 14-07-2026 at 21:30 hrs near Indiranagar Metro Station...',
      uploadedBy: 'Inspector Ramesh (SHO)',
      fileSize: 15420
    });

    expect(newDoc).toBeDefined();
    expect(newDoc.id).toBeTypeOf('number');

    const docs = getCaseDocuments(db, 2005);
    expect(docs.length).toBe(1);
    expect(docs[0].documentTitle).toBe('Handwritten_FIR_OCR_Transcript.pdf');
    expect(docs[0].documentType).toBe('HANDWRITTEN_OCR');
    expect(docs[0].content).toContain('Indiranagar Metro Station');
    expect(docs[0].uploadedBy).toBe('Inspector Ramesh (SHO)');
  });

  it('returns empty array for case with no uploaded documents', () => {
    const docs = getCaseDocuments(db, 9999);
    expect(docs).toEqual([]);
  });
});
