import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');
const db = new Database(dbPath);

console.log('Starting FTS5 migration...');

// Enable WAL for performance
db.pragma('journal_mode = WAL');

// 1. Drop existing if any
db.exec('DROP TABLE IF EXISTS CaseMaster_fts');

// 2. Create FTS5 table
// We index FIRNo, BriefFacts, and an aggregated text column for suspect/victim names
db.exec(`
  CREATE VIRTUAL TABLE CaseMaster_fts USING fts5(
    CrimeNo,
    BriefFacts,
    Names,
    tokenize='porter'
  );
`);

// 3. Create Sync Triggers
db.exec('DROP TRIGGER IF EXISTS CaseMaster_ai');
db.exec('DROP TRIGGER IF EXISTS CaseMaster_ad');
db.exec('DROP TRIGGER IF EXISTS CaseMaster_au');

db.exec(`
  CREATE TRIGGER CaseMaster_ai AFTER INSERT ON CaseMaster BEGIN
    INSERT INTO CaseMaster_fts(rowid, CrimeNo, BriefFacts, Names) 
    VALUES (new.CaseMasterID, new.CrimeNo, new.BriefFacts, '');
  END;

  CREATE TRIGGER CaseMaster_ad AFTER DELETE ON CaseMaster BEGIN
    DELETE FROM CaseMaster_fts WHERE rowid = old.CaseMasterID;
  END;

  CREATE TRIGGER CaseMaster_au AFTER UPDATE ON CaseMaster BEGIN
    DELETE FROM CaseMaster_fts WHERE rowid = old.CaseMasterID;
    INSERT INTO CaseMaster_fts(rowid, CrimeNo, BriefFacts, Names) 
    VALUES (new.CaseMasterID, new.CrimeNo, new.BriefFacts, '');
  END;
`);

// 4. Initial Population
console.log('Populating FTS5 index...');
db.exec(`
  INSERT INTO CaseMaster_fts(rowid, CrimeNo, BriefFacts, Names)
  SELECT 
    c.CaseMasterID, 
    c.CrimeNo, 
    c.BriefFacts, 
    COALESCE(ch.CrimeGroupName, '') || ' ' || 
    COALESCE(csh.CrimeHeadName, '') || ' ' || 
    COALESCE(d.DistrictName, '') || ' ' || 
    COALESCE(u.UnitName, '') || ' ' || 
    COALESCE((SELECT group_concat(AccusedName, ' ') FROM Accused WHERE CaseMasterID = c.CaseMasterID), '') || ' ' || 
    COALESCE((SELECT group_concat(VictimName, ' ') FROM Victim WHERE CaseMasterID = c.CaseMasterID), '') AS Names
  FROM CaseMaster c
  LEFT JOIN CrimeHead ch ON c.CrimeMajorHeadID = ch.CrimeHeadID
  LEFT JOIN CrimeSubHead csh ON c.CrimeMinorHeadID = csh.CrimeSubHeadID
  LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
  LEFT JOIN District d ON u.DistrictID = d.DistrictID;
`);

console.log('Migration complete!');
db.close();
