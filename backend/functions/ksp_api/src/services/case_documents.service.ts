import { Database } from 'better-sqlite3';

export interface CaseDocumentInput {
  caseMasterId: number | string;
  documentTitle: string;
  documentType: string;
  content?: string;
  uploadedBy: string;
  fileSize?: number;
}

export interface CaseDocumentRecord extends CaseDocumentInput {
  id: number;
  uploadedAt: string;
}

export function initCaseDocumentsTable(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS CaseDocuments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caseMasterId TEXT NOT NULL,
      documentTitle TEXT NOT NULL,
      documentType TEXT NOT NULL,
      content TEXT,
      uploadedBy TEXT NOT NULL,
      uploadedAt TEXT NOT NULL,
      fileSize INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_casedocuments_caseMasterId ON CaseDocuments(caseMasterId);
  `);
}

export function saveCaseDocument(db: Database, input: CaseDocumentInput): CaseDocumentRecord {
  initCaseDocumentsTable(db);
  const now = new Date().toISOString();
  const caseIdStr = String(input.caseMasterId).replace(/^CASE-/i, '');

  const stmt = db.prepare(`
    INSERT INTO CaseDocuments (caseMasterId, documentTitle, documentType, content, uploadedBy, uploadedAt, fileSize)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const res = stmt.run(
    caseIdStr,
    input.documentTitle,
    input.documentType,
    input.content || '',
    input.uploadedBy || 'System Inspector',
    now,
    input.fileSize || 0
  );

  return {
    id: Number(res.lastInsertRowid),
    caseMasterId: caseIdStr,
    documentTitle: input.documentTitle,
    documentType: input.documentType,
    content: input.content || '',
    uploadedBy: input.uploadedBy || 'System Inspector',
    uploadedAt: now,
    fileSize: input.fileSize || 0
  };
}

export function getCaseDocuments(db: Database, caseMasterId: number | string): CaseDocumentRecord[] {
  initCaseDocumentsTable(db);
  const caseIdStr = String(caseMasterId).replace(/^CASE-/i, '');
  
  const stmt = db.prepare(`
    SELECT id, caseMasterId, documentTitle, documentType, content, uploadedBy, uploadedAt, fileSize
    FROM CaseDocuments
    WHERE caseMasterId = ?
    ORDER BY uploadedAt DESC
  `);

  return stmt.all(caseIdStr) as CaseDocumentRecord[];
}
