import type Database from 'better-sqlite3';
import { parse } from 'csv-parse/sync';

export interface CSVIngestResult {
  successCount: number;
  errors: string[];
}

export interface IngestContext {
  employeeId: number;
  unitId: number;
  districtId?: number;
}

export async function parseAndIngestCSV(
  db: Database.Database,
  csvContent: string,
  ctx: IngestContext
): Promise<CSVIngestResult> {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  let successCount = 0;
  const errors: string[] = [];

  const insertCase = db.prepare(`
    INSERT INTO CaseMaster (
      CrimeNo, CaseNo, BriefFacts, Latitude, Longitude,
      CrimeRegisteredDate, IncidentFromDate, PolicePersonID, PoliceStationID,
      CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID
    ) VALUES (?, ?, ?, null, null, datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, 1)
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
    for (let i = 0; i < records.length; i++) {
      const row = records[i] as any;
      try {
        const crimeNo = row.crimeNo || `CSV-${Date.now()}-${i}`;
        const caseNo = row.caseNo || crimeNo;
        const briefFacts = row.briefFacts || 'Imported via bulk CSV dataset';
        const stationId = parseInt(row.policeStationId, 10) || ctx.unitId || 1;
        const catId = parseInt(row.caseCategoryId, 10) || 1;
        const gravId = parseInt(row.gravityOffenceId, 10) || 1;
        const majorId = parseInt(row.crimeMajorHeadId, 10) || 1;
        const minorId = parseInt(row.crimeMinorHeadId, 10) || 1;

        const info = insertCase.run(
          crimeNo, caseNo, briefFacts, ctx.employeeId, stationId,
          catId, gravId, majorId, minorId
        );
        const caseId = info.lastInsertRowid as number;

        updateFts.run(caseId, caseId);

        successCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message || 'Unknown error'}`);
      }
    }
  });

  txn();

  return { successCount, errors };
}
