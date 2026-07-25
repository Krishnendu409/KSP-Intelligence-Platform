import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { parseAndIngestCSV } from '../src/services/ingestion/csv.service';
import { parseAndIngestPDF } from '../src/services/ingestion/pdf.service';
import { saveCaseDocument, getCaseDocuments } from '../src/services/case_documents.service';
import { verifyPassword } from '../src/auth/password';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');

describe('Critical Multi-Credential & Pipeline E2E Test Suite', () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database(dbPath);
    db.pragma('foreign_keys = OFF');
  });

  afterAll(() => {
    if (db) db.close();
  });

  it('1. Verifies authentic login capability for all seeded role credentials', () => {
    const accounts = [
      { user: 'sho.guntur', pass: 'ksp-sho-2026', expectedRole: 'SHO' },
      { user: 'io.pilibanga', pass: 'ksp-io-2026', expectedRole: 'IO' },
      { user: 'analyst.modinagar', pass: 'ksp-analyst-2026', expectedRole: 'Analyst' },
      { user: 'scrb.state', pass: 'ksp-scrb-2026', expectedRole: 'SCRB' },
      { user: 'sp.state', pass: 'ksp-sp-2026', expectedRole: 'SP' }
    ];

    for (const acc of accounts) {
      const row = db.prepare('SELECT * FROM Users WHERE Username = ? AND IsActive = 1').get(acc.user) as any;
      expect(row).toBeDefined();
      expect(verifyPassword(acc.pass, row.PasswordHash)).toBe(true);
      expect(row.Role).toBe(acc.expectedRole);
    }
  });

  it('2. Ingests realistic multi-case CCTNS batch CSV file and verifies FTS5 search index', async () => {
    const csvPath = 'C:/Users/krish/Downloads/KSP/sample_data/cctns_batch_firs.csv';
    expect(fs.existsSync(csvPath)).toBe(true);
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const mockCtx = { employeeId: 2004, unitId: 1, districtId: 1 }; // SCRB officer context
    const res = await parseAndIngestCSV(db, csvContent, mockCtx);
    expect(res.errors).toEqual([]);
    expect(res.successCount).toBe(5);

    // Verify FTS5 keyword query matches new robbery and timber seizure reports
    const searchRes = db.prepare(`SELECT * FROM CaseMaster_fts WHERE CaseMaster_fts MATCH ?`).all('Scorpio') as any[];
    expect(searchRes.length).toBeGreaterThanOrEqual(1);

    // Verify presence in CaseMaster
    const checkCase = db.prepare('SELECT * FROM CaseMaster WHERE CrimeNo = ?').get('FIR-2026-BLR-0401') as any;
    expect(checkCase).toBeDefined();
    expect(checkCase.BriefFacts).toContain('Lakshmi Gold Palace');

    // Cleanup
    db.prepare('DELETE FROM CaseMaster WHERE CrimeNo LIKE ?').run('FIR-2026-BLR-%');
  });

  it('3. Ingests simulated handwritten complaint OCR text PDF file into structured database tables', async () => {
    const txtPath = 'C:/Users/krish/Downloads/KSP/sample_data/handwritten_complaint_ocr_sample.txt';
    expect(fs.existsSync(txtPath)).toBe(true);
    const txtContent = fs.readFileSync(txtPath, 'utf8');

    const mockCtx = { employeeId: 2001, unitId: 1, districtId: 1 }; // SHO officer context
    const res = await parseAndIngestPDF(db, Buffer.from(txtContent, 'utf-8'), mockCtx);
    expect(res.success).toBe(true);
    expect(res.crimeNo).toBe('FIR-2026-HAND-8809');

    // Verify structured CaseMaster extraction
    const createdCase = db.prepare('SELECT * FROM CaseMaster WHERE CrimeNo = ?').get('FIR-2026-HAND-8809') as any;
    expect(createdCase).toBeDefined();
    expect(createdCase.BriefFacts).toContain('Indiranagar Metro Station Pillar 142');

    // Verify structured Accused and Victim entity insertion
    const victim = db.prepare('SELECT * FROM Victim WHERE CaseMasterID = ?').get(createdCase.CaseMasterID) as any;
    expect(victim).toBeDefined();
    expect(victim.VictimName).toContain('Ananya Rao');

    const accused = db.prepare('SELECT * FROM Accused WHERE CaseMasterID = ?').get(createdCase.CaseMasterID) as any;
    expect(accused).toBeDefined();
    expect(accused.AccusedName).toContain('Unknown Pillion Rider');

    // 4. Test uploading this document directly as Case Evidence Document
    const savedDoc = saveCaseDocument(db, {
      caseMasterId: createdCase.CaseMasterID,
      documentTitle: 'Handwritten_FIR_Complaint_Form.txt',
      documentType: 'HANDWRITTEN_OCR',
      content: txtContent,
      uploadedBy: 'SHO Guntur (Badge #4042)',
      fileSize: txtContent.length
    });

    expect(savedDoc.id).toBeGreaterThan(0);

    const docs = getCaseDocuments(db, createdCase.CaseMasterID);
    expect(docs.length).toBeGreaterThanOrEqual(1);
    expect(docs[0].documentTitle).toBe('Handwritten_FIR_Complaint_Form.txt');
    expect(docs[0].content).toContain('Indiranagar Metro Station');

    // Cleanup
    if (createdCase) {
      db.prepare('DELETE FROM Accused WHERE CaseMasterID = ?').run(createdCase.CaseMasterID);
      db.prepare('DELETE FROM Victim WHERE CaseMasterID = ?').run(createdCase.CaseMasterID);
      db.prepare('DELETE FROM CaseDocuments WHERE caseMasterId = ?').run(String(createdCase.CaseMasterID));
      db.prepare('DELETE FROM CaseMaster WHERE CaseMasterID = ?').run(createdCase.CaseMasterID);
    }
  });
});
