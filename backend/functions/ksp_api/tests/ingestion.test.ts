import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { parseAndIngestCSV } from '../src/services/ingestion/csv.service';
import { parseAndIngestPDF } from '../src/services/ingestion/pdf.service';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');

describe('Ingestion Services (PDF & CSV)', () => {
  let db: Database.Database;
  const mockCtx = { employeeId: 1, unitId: 1, districtId: 1 };

  beforeAll(() => {
    db = new Database(dbPath);
    db.pragma('foreign_keys = OFF');
  });

  afterAll(() => {
    if (db) db.close();
  });

  it('successfully parses and ingests valid CSV records into CaseMaster and FTS5', async () => {
    const csvContent = `crimeNo,briefFacts,policeStationId,caseCategoryId,gravityOffenceId,crimeMajorHeadId,crimeMinorHeadId
CSV-TEST-001,Unlawful entry and grand larceny at commercial shop,1,1,1,1,1
CSV-TEST-002,Robbery at highway intersection at midnight,1,1,1,2,3`;

    const result = await parseAndIngestCSV(db, csvContent, mockCtx);
    expect(result.successCount).toBe(2);
    expect(result.errors.length).toBe(0);

    // Verify presence in DB
    const row = db.prepare('SELECT * FROM CaseMaster WHERE CrimeNo = ?').get('CSV-TEST-001') as any;
    expect(row).toBeDefined();
    expect(row.BriefFacts).toContain('grand larceny');

    // Verify FTS5 search indexing
    const fts = db.prepare('SELECT * FROM CaseMaster_fts WHERE CaseMaster_fts MATCH ?').get('larceny') as any;
    expect(fts).toBeDefined();

    // Cleanup mock data
    db.prepare('DELETE FROM CaseMaster WHERE CrimeNo LIKE ?').run('CSV-TEST-%');
  });

  it('successfully extracts FIR attributes from simulated text/PDF payload and ingests case', async () => {
    const rawPdfText = `FIRST INFORMATION REPORT
Crime No: PDF-FIR-909
Police Station ID: 1
Incident Date: 2026-07-25
Brief Facts: Suspect broke into the warehouse stealing electronic components and fleeing in a van.
Accused: Rajesh Kumar, Age 34
Victim: Suresh Gupta, Age 52`;

    const result = await parseAndIngestPDF(db, Buffer.from(rawPdfText, 'utf-8'), mockCtx);
    expect(result.success).toBe(true);
    expect(result.crimeNo).toBe('PDF-FIR-909');

    const row = db.prepare('SELECT * FROM CaseMaster WHERE CrimeNo = ?').get('PDF-FIR-909') as any;
    expect(row).toBeDefined();
    expect(row.BriefFacts).toContain('warehouse');

    // Cleanup mock data
    if (row) {
      db.prepare('DELETE FROM Accused WHERE CaseMasterID = ?').run(row.CaseMasterID);
      db.prepare('DELETE FROM Victim WHERE CaseMasterID = ?').run(row.CaseMasterID);
    }
    db.prepare('DELETE FROM CaseMaster WHERE CrimeNo = ?').run('PDF-FIR-909');
  });
});
