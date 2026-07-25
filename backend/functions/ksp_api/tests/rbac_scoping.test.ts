import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { searchCases } from '../src/services/SearchService';
import { getAnomalyAlerts } from '../src/services/trend.service';
import type { JurisdictionFilter } from '../src/auth/types';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');

describe('RBAC Scoping Enforcement (Phase 2)', () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database(dbPath);
  });

  afterAll(() => {
    if (db) db.close();
  });

  it('restricts searchCases results according to provided unit/district jurisdiction', () => {
    const statewideResults = searchCases(db, 'Theft', 50, null);
    expect(statewideResults.length).toBeGreaterThan(0);

    const firstCase = db.prepare(`
      SELECT u.UnitID, u.DistrictID 
      FROM CaseMaster c 
      JOIN Unit u ON c.PoliceStationID = u.UnitID 
      WHERE c.CaseMasterID = ?
    `).get(statewideResults[0].CaseMasterID) as { UnitID: number; DistrictID: number };

    // Scoping to a non-existent unit should filter out all results
    const bogusJurisdiction: JurisdictionFilter = { level: 'unit', unitId: 999999, districtId: 999999 };
    const restrictedResults = searchCases(db, 'Theft', 50, bogusJurisdiction);
    expect(restrictedResults.length).toBe(0);

    // Scoping to the matching unit should return at least the first case
    const validJurisdiction: JurisdictionFilter = { level: 'unit', unitId: firstCase.UnitID, districtId: firstCase.DistrictID };
    const unitResults = searchCases(db, 'Theft', 50, validJurisdiction);
    expect(unitResults.some((r: any) => r.CaseMasterID === statewideResults[0].CaseMasterID)).toBe(true);
  });

  it('restricts getAnomalyAlerts results according to provided jurisdiction', () => {
    const statewideAnomalies = getAnomalyAlerts(db, 8, null);

    // Scoping to bogus district should yield 0 anomalies
    const bogusJurisdiction: JurisdictionFilter = { level: 'district', districtId: 999999 };
    const restrictedAnomalies = getAnomalyAlerts(db, 8, bogusJurisdiction);
    expect(restrictedAnomalies.length).toBe(0);
  });
});
