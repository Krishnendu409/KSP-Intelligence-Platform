import type Database from 'better-sqlite3';
const pdfParse = require('pdf-parse');
import type { IngestContext } from './csv.service';

export interface PDFIngestResult {
  success: boolean;
  crimeNo?: string;
  caseId?: number;
  error?: string;
}

export async function parseAndIngestPDF(
  db: Database.Database,
  pdfBuffer: Buffer,
  ctx: IngestContext
): Promise<PDFIngestResult> {
  let textContent = '';
  try {
    const parsed = await pdfParse(pdfBuffer);
    textContent = parsed.text || '';
  } catch (err) {
    textContent = pdfBuffer.toString('utf-8');
  }

  if (!textContent.trim()) {
    textContent = pdfBuffer.toString('utf-8');
  }

  try {
    const crimeNoMatch = textContent.match(/Crime\s*No[\s:]+([A-Za-z0-9\-_]+)/i);
    const stationIdMatch = textContent.match(/Police\s*Station\s*ID[\s:]+(\d+)/i);
    const factsMatch = textContent.match(/Brief\s*Facts[\s:]+([^\r\n]+)/i);
    const accusedMatch = textContent.match(/Accused[\s:]+([^\r\n]+)/i);
    const victimMatch = textContent.match(/Victim[\s:]+([^\r\n]+)/i);

    const crimeNo = crimeNoMatch ? crimeNoMatch[1].trim() : `PDF-FIR-${Date.now()}`;
    const stationId = stationIdMatch ? parseInt(stationIdMatch[1], 10) : ctx.unitId || 1;
    const briefFacts = factsMatch ? factsMatch[1].trim() : 'Extracted from FIR PDF Document';

    const insertCase = db.prepare(`
      INSERT INTO CaseMaster (
        CrimeNo, CaseNo, BriefFacts, Latitude, Longitude,
        CrimeRegisteredDate, IncidentFromDate, PolicePersonID, PoliceStationID,
        CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID
      ) VALUES (?, ?, ?, null, null, datetime('now'), datetime('now'), ?, ?, 1, 1, 1, 1, 1)
    `);

    const updateFts = db.prepare(`
      UPDATE CaseMaster_fts SET Names = (
        SELECT 
          COALESCE(ch.CrimeGroupName, '') || ' ' || 
          COALESCE(csh.CrimeHeadName, '') || ' ' || 
          COALESCE(d.DistrictName, '') || ' ' || 
          COALESCE(u.UnitName, '') || ' ' || 
          COALESCE((SELECT group_concat(AccusedName, ' ') FROM Accused WHERE CaseMasterID = c.CaseMasterID), '') || ' ' || 
          COALESCE((SELECT group_concat(VictimName, ' ') FROM Victim WHERE CaseMasterID = c.CaseMasterID), '')
        FROM CaseMaster c
        LEFT JOIN CrimeHead ch ON c.CrimeMajorHeadID = ch.CrimeHeadID
        LEFT JOIN CrimeSubHead csh ON c.CrimeMinorHeadID = csh.CrimeSubHeadID
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        LEFT JOIN District d ON u.DistrictID = d.DistrictID
        WHERE c.CaseMasterID = ?
      ) WHERE rowid = ?
    `);

    const txn = db.transaction(() => {
      const info = insertCase.run(crimeNo, crimeNo, briefFacts, ctx.employeeId, stationId);
      const newCaseId = info.lastInsertRowid as number;

      if (accusedMatch) {
        const accusedName = accusedMatch[1].split(',')[0].trim();
        db.prepare(`INSERT INTO Accused (CaseMasterID, AccusedName, PersonID) VALUES (?, ?, ?)`).run(newCaseId, accusedName, 'A1');
      }

      if (victimMatch) {
        const victimName = victimMatch[1].split(',')[0].trim();
        db.prepare(`INSERT INTO Victim (CaseMasterID, VictimName) VALUES (?, ?)`).run(newCaseId, victimName);
      }

      updateFts.run(newCaseId, newCaseId);

      return newCaseId;
    });

    const caseId = txn();
    return { success: true, crimeNo, caseId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to ingest PDF FIR' };
  }
}
