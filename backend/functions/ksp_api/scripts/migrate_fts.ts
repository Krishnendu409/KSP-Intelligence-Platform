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
    INSERT INTO CaseMaster_fts(CaseMaster_fts, rowid, CrimeNo, BriefFacts, Names) 
    VALUES ('delete', old.CaseMasterID, old.CrimeNo, old.BriefFacts, '');
  END;

  CREATE TRIGGER CaseMaster_au AFTER UPDATE ON CaseMaster BEGIN
    INSERT INTO CaseMaster_fts(CaseMaster_fts, rowid, CrimeNo, BriefFacts, Names) 
    VALUES ('delete', old.CaseMasterID, old.CrimeNo, old.BriefFacts, '');
    INSERT INTO CaseMaster_fts(rowid, CrimeNo, BriefFacts, Names) 
    VALUES (new.CaseMasterID, new.CrimeNo, new.BriefFacts, '');
  END;
`);

// 4. Initial Population
console.log('Populating FTS5 index...');
db.exec(`
  INSERT INTO CaseMaster_fts(rowid, CrimeNo, BriefFacts, Names)
  SELECT CaseMasterID, CrimeNo, BriefFacts, '' FROM CaseMaster;
`);

console.log('Migration complete!');
db.close();
