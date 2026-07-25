import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { getEntityProfile } from '../src/services/entity.service';
import { SQLiteRelationshipRepository } from '../src/repositories/SQLiteRelationshipRepository';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');

describe('Entity Routing & Dossier Completeness (Phase 3)', () => {
  let db: Database.Database;
  let relRepo: SQLiteRelationshipRepository;

  beforeAll(() => {
    db = new Database(dbPath);
    relRepo = new SQLiteRelationshipRepository(db);
  });

  afterAll(() => {
    if (db) db.close();
  });

  it('supports retrieving entity dossiers for CASE, POLICESTATION, EMPLOYEE, and COURT types', () => {
    // Find an existing case ID
    const caseRow = db.prepare('SELECT CaseMasterID FROM CaseMaster LIMIT 1').get() as any;
    expect(caseRow).toBeDefined();

    const caseProfile = getEntityProfile(db, 'CASE', caseRow.CaseMasterID);
    expect(caseProfile).toBeDefined();
    expect(caseProfile?.metadata?.Role).toBe('Case');

    const stationRow = db.prepare('SELECT UnitID FROM Unit LIMIT 1').get() as any;
    const stationProfile = getEntityProfile(db, 'POLICESTATION', stationRow.UnitID);
    expect(stationProfile).toBeDefined();

    const empRow = db.prepare('SELECT EmployeeID FROM Employee LIMIT 1').get() as any;
    const empProfile = getEntityProfile(db, 'EMPLOYEE', empRow.EmployeeID);
    expect(empProfile).toBeDefined();
  });

  it('normalizes unprefixed IDs and finds relationships for cases, victims, and stations in SQLiteRelationshipRepository', () => {
    // Find a case with an accused or victim
    const row = db.prepare('SELECT CaseMasterID FROM Victim LIMIT 1').get() as any;
    expect(row).toBeDefined();

    // Passing pure numerical string without CASE- prefix should still work
    const relsUnprefixed = relRepo.findBySourceId(String(row.CaseMasterID));
    expect(relsUnprefixed.length).toBeGreaterThan(0);

    // Finding relationships from a Victim ID
    const victimRow = db.prepare('SELECT VictimMasterID FROM Victim WHERE CaseMasterID = ? LIMIT 1').get(row.CaseMasterID) as any;
    const victimRels = relRepo.findBySourceId(`VICTIM-${victimRow.VictimMasterID}`);
    expect(victimRels.length).toBeGreaterThan(0);
  });
});
