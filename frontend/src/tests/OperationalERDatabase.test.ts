import { describe, it, expect } from 'vitest';
import { 
  getAllCaseMasters, 
  getCaseByCrimeNo, 
  getActSectionsForCase,
  getAccusedForCase 
} from '../lib/operationalERDatabase';

describe('Operational ER Database Schema Adherence (Police_FIR_ER_Diagram.pdf)', () => {
  it('enforces strict 18-digit CrimeNo and YYYY+serial CaseNo format on CaseMaster records', () => {
    const cases = getAllCaseMasters();
    expect(cases.length).toBeGreaterThanOrEqual(5);

    for (const c of cases) {
      // CrimeNo format: 1 digit category + 4 digit district + 4 digit station + 4 digit year + 5 digit serial = 18 digits
      expect(c.CrimeNo).toMatch(/^[0-9]{18}$/);
      expect(c.CaseNo).toMatch(/^2026[0-9]{5}$/);
      expect(typeof c.CaseMasterID).toBe('number');
      expect(c.latitude).toBeGreaterThan(12.8);
      expect(c.latitude).toBeLessThan(13.2);
      expect(c.longitude).toBeGreaterThan(77.4);
      expect(c.longitude).toBeLessThan(77.8);
    }
  });

  it('links CaseMaster records to ActSectionAssociation (IPC/BNS/NDPS) and Accused records', () => {
    const fir = getCaseByCrimeNo('104430006202600001');
    expect(fir).toBeDefined();

    const acts = getActSectionsForCase(fir!.CaseMasterID);
    expect(acts.length).toBeGreaterThanOrEqual(1);
    expect(acts[0].ActCode).toBe('IPC');
    expect(acts[0].SectionCode).toBeDefined();

    const accused = getAccusedForCase(fir!.CaseMasterID);
    expect(accused.length).toBeGreaterThanOrEqual(1);
    expect(accused[0].AccusedName).toBeDefined();
  });
});
