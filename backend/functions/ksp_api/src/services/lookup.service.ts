import type Database from 'better-sqlite3';

/**
 * Real lookup-table data for populating intake form dropdowns — no hardcoded
 * arrays in the frontend. GenderID has no dedicated lookup table in the ER
 * schema (it's a small fixed convention: 1=Male, 2=Female, 3=Transgender per
 * the ER diagram's own "like m, f, t" note), so that one mapping is a genuine
 * enum, not fabricated data.
 */
export function getIntakeLookups(db: Database.Database) {
  const caseCategories = db.prepare('SELECT CaseCategoryID, LookupValue FROM CaseCategory').all();
  const gravityOffences = db.prepare('SELECT GravityOffenceID, LookupValue FROM GravityOffence').all();
  const crimeHeads = db.prepare('SELECT CrimeHeadID, CrimeGroupName FROM CrimeHead WHERE Active = 1 OR Active IS NULL').all();
  const crimeSubHeads = db.prepare('SELECT CrimeSubHeadID, CrimeHeadID, CrimeHeadName as name FROM CrimeSubHead ORDER BY SeqID').all();
  const acts = db.prepare('SELECT ActCode, ActDescription, ShortName FROM Act WHERE Active = 1 OR Active IS NULL').all();

  return {
    caseCategories,
    gravityOffences,
    crimeHeads,
    crimeSubHeads,
    acts,
    genders: [
      { GenderID: 1, label: 'Male' },
      { GenderID: 2, label: 'Female' },
      { GenderID: 3, label: 'Transgender' },
    ],
  };
}

export function getSectionsForAct(db: Database.Database, actCode: string) {
  return db.prepare('SELECT ActCode, SectionCode, SectionDescription FROM Section WHERE ActCode = ? AND (Active = 1 OR Active IS NULL)').all(actCode);
}
