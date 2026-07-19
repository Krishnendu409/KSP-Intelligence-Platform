import type Database from 'better-sqlite3';

export interface IntakePerson {
  name: string;
  age?: number | null;
  genderId?: number | null;
}

export interface IntakePayload {
  caseCategoryId: number;
  gravityOffenceId: number;
  crimeMajorHeadId: number;
  crimeMinorHeadId: number;
  briefFacts: string;
  incidentDate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accused: IntakePerson[];
  victims: IntakePerson[];
  sections: Array<{ actCode: string; sectionCode: string }>;
}

export class IntakeValidationError extends Error {}

function validate(payload: IntakePayload) {
  if (!payload.briefFacts || !payload.briefFacts.trim()) {
    throw new IntakeValidationError('briefFacts is required');
  }
  if (!payload.caseCategoryId) throw new IntakeValidationError('caseCategoryId is required');
  if (!payload.gravityOffenceId) throw new IntakeValidationError('gravityOffenceId is required');
  if (!payload.crimeMajorHeadId) throw new IntakeValidationError('crimeMajorHeadId is required');
  if (!payload.crimeMinorHeadId) throw new IntakeValidationError('crimeMinorHeadId is required');
  if (payload.accused.some(a => !a.name?.trim())) throw new IntakeValidationError('every accused entry needs a name');
  if (payload.victims.some(v => !v.name?.trim())) throw new IntakeValidationError('every victim entry needs a name');
}

/**
 * Deterministically generates the next CrimeNo/CaseNo for a station+category+year,
 * following the exact format documented in the KSP ER diagram:
 *   CrimeNo = 1-digit category + 4-digit district + 4-digit station(unit) + 4-digit year + 5-digit running serial
 *   CaseNo  = 4-digit year + 5-digit running serial (last 9 digits of CrimeNo)
 * The running serial is derived from a real COUNT of existing registrations in
 * that exact scope — never randomized.
 */
function generateCaseNumbers(db: Database.Database, districtId: number, unitId: number, caseCategoryId: number, year: number) {
  const { cnt } = db.prepare(`
    SELECT COUNT(*) as cnt FROM CaseMaster
    WHERE PoliceStationID = ? AND CaseCategoryID = ? AND strftime('%Y', CrimeRegisteredDate) = ?
  `).get(unitId, caseCategoryId, String(year)) as { cnt: number };

  const serial = cnt + 1;
  const paddedDistrict = String(districtId).padStart(4, '0');
  const paddedUnit = String(unitId).padStart(4, '0');
  const paddedSerial = String(serial).padStart(5, '0');

  const crimeNo = `${caseCategoryId}${paddedDistrict}${paddedUnit}${year}${paddedSerial}`;
  const caseNo = `${year}${paddedSerial}`;
  return { crimeNo, caseNo };
}

export interface CreatedCase {
  caseId: number;
  crimeNo: string;
  caseNo: string;
}

export function createCase(
  db: Database.Database,
  ctx: { unitId: number; districtId: number; employeeId: number },
  payload: IntakePayload
): CreatedCase {
  validate(payload);

  const year = new Date().getFullYear();
  const { crimeNo, caseNo } = generateCaseNumbers(db, ctx.districtId, ctx.unitId, payload.caseCategoryId, year);

  const insertCase = db.prepare(`
    INSERT INTO CaseMaster (
      CrimeNo, CaseNo, BriefFacts, latitude, longitude,
      CrimeRegisteredDate, IncidentFromDate, PolicePersonID, PoliceStationID,
      CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID
    ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const txn = db.transaction((p: IntakePayload) => {
    const info = insertCase.run(
      crimeNo,
      caseNo,
      p.briefFacts.trim(),
      p.latitude ?? null,
      p.longitude ?? null,
      p.incidentDate ?? null,
      ctx.employeeId,
      ctx.unitId,
      p.caseCategoryId,
      p.gravityOffenceId,
      p.crimeMajorHeadId,
      p.crimeMinorHeadId
    );
    const newCaseId = info.lastInsertRowid as number;

    const insertAccused = db.prepare(`
      INSERT INTO Accused (CaseMasterID, AccusedName, AgeYear, GenderID, PersonID) VALUES (?, ?, ?, ?, ?)
    `);
    p.accused.forEach((a, idx) => {
      insertAccused.run(newCaseId, a.name.trim(), a.age ?? null, a.genderId ?? null, `A${idx + 1}`);
    });

    const insertVictim = db.prepare(`
      INSERT INTO Victim (CaseMasterID, VictimName, AgeYear, GenderID) VALUES (?, ?, ?, ?)
    `);
    p.victims.forEach(v => {
      insertVictim.run(newCaseId, v.name.trim(), v.age ?? null, v.genderId ?? null);
    });

    // ActSectionAssociation.SectionID references Section's surrogate SectionID
    // (not SectionCode) in the actual generated schema, so resolve it here.
    const findSection = db.prepare(`SELECT SectionID FROM Section WHERE ActCode = ? AND SectionCode = ?`);
    const insertSection = db.prepare(`
      INSERT INTO ActSectionAssociation (CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID) VALUES (?, ?, ?, ?, ?)
    `);
    p.sections.forEach((s, idx) => {
      const section = findSection.get(s.actCode, s.sectionCode) as { SectionID: number } | undefined;
      if (!section) throw new IntakeValidationError(`Unknown section ${s.actCode} ${s.sectionCode}`);
      insertSection.run(newCaseId, s.actCode, section.SectionID, idx + 1, idx + 1);
    });

    return newCaseId;
  });

  const caseId = txn(payload);
  return { caseId, crimeNo, caseNo };
}
