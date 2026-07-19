import Database from 'better-sqlite3';
import * as path from 'path';
import { runMigrations } from '../src/db/migrate';
import { hashPassword } from '../src/auth/password';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');
const db = new Database(dbPath);
runMigrations(db);

// Extra Designation/Rank rows for non-station roles not present in the base ER seed data.
const ensureDesignation = db.prepare(`
  INSERT INTO Designation (DesignationID, DesignationName, Active, SortOrder)
  SELECT ?, ?, 1, ? WHERE NOT EXISTS (SELECT 1 FROM Designation WHERE DesignationID = ?)
`);
ensureDesignation.run(3, 'District Crime Analyst', 3, 3);
ensureDesignation.run(4, 'SCRB Intelligence Officer', 4, 4);
ensureDesignation.run(5, 'Superintendent of Police', 5, 5);

const ensureRank = db.prepare(`
  INSERT INTO Rank (RankID, RankName, Hierarchy, Active)
  SELECT ?, ?, ?, 1 WHERE NOT EXISTS (SELECT 1 FROM Rank WHERE RankID = ?)
`);
ensureRank.run(3, 'Superintendent of Police', 0, 3);

// Real Units (confirmed to have live CaseMaster rows) used so jurisdiction scoping and
// PII masking are visibly testable across different SHO/IO/Analyst accounts.
const DEMO_ACCOUNTS: Array<{
  username: string;
  password: string;
  role: 'SHO' | 'IO' | 'Analyst' | 'SCRB' | 'SP';
  firstName: string;
  unitId: number;
  districtId: number;
  rankId: number;
  designationId: number;
}> = [
  { username: 'sho.guntur', password: 'ksp-sho-2026', role: 'SHO', firstName: 'Demo SHO Officer', unitId: 112, districtId: 12, rankId: 2, designationId: 2 },
  { username: 'io.pilibanga', password: 'ksp-io-2026', role: 'IO', firstName: 'Demo Investigating Officer', unitId: 7, districtId: 1, rankId: 1, designationId: 1 },
  { username: 'analyst.modinagar', password: 'ksp-analyst-2026', role: 'Analyst', firstName: 'Demo District Analyst', unitId: 84, districtId: 9, rankId: 1, designationId: 3 },
  { username: 'scrb.state', password: 'ksp-scrb-2026', role: 'SCRB', firstName: 'Demo SCRB Intelligence Officer', unitId: 228, districtId: 23, rankId: 1, designationId: 4 },
  { username: 'sp.state', password: 'ksp-sp-2026', role: 'SP', firstName: 'Demo Superintendent of Police', unitId: 214, districtId: 22, rankId: 3, designationId: 5 },
];

const insertEmployee = db.prepare(`
  INSERT INTO Employee (DistrictID, UnitID, RankID, DesignationID, KGID, FirstName, GenderID, AppointmentDate)
  VALUES (?, ?, ?, ?, ?, ?, 1, date('now'))
`);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO Users (EmployeeID, Username, PasswordHash, Role)
  VALUES (?, ?, ?, ?)
`);

const existingUser = db.prepare(`SELECT UserID FROM Users WHERE Username = ?`);

const seeded: Array<{ username: string; password: string; role: string }> = [];

for (const acc of DEMO_ACCOUNTS) {
  if (existingUser.get(acc.username)) {
    console.log(`[seed-auth] ${acc.username} already exists, skipping.`);
    continue;
  }

  const kgid = `KGID-DEMO-${acc.role.toUpperCase()}`;
  const empInfo = insertEmployee.run(acc.districtId, acc.unitId, acc.rankId, acc.designationId, kgid, acc.firstName);
  const employeeId = empInfo.lastInsertRowid as number;

  const passwordHash = hashPassword(acc.password);
  insertUser.run(employeeId, acc.username, passwordHash, acc.role);
  seeded.push({ username: acc.username, password: acc.password, role: acc.role });
}

if (seeded.length > 0) {
  console.log('\n[seed-auth] Seeded demo accounts (local dev only — change/remove before any real deployment):');
  console.table(seeded);
} else {
  console.log('[seed-auth] No new accounts created — all demo users already exist.');
}

db.close();
