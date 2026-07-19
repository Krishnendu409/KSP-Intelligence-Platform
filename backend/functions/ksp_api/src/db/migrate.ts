import type Database from 'better-sqlite3';

/**
 * Idempotent schema migration for the auth/audit tables layered on top of the
 * official KSP FIR schema. Never touches CaseMaster/Accused/Victim/etc — those
 * mirror the immutable government ER diagram and are seeded separately.
 */
export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      EmployeeID INTEGER NOT NULL REFERENCES Employee(EmployeeID),
      Username TEXT UNIQUE NOT NULL,
      PasswordHash TEXT NOT NULL,
      Role TEXT NOT NULL CHECK(Role IN ('SHO','IO','Analyst','SCRB','SP')),
      IsActive INTEGER NOT NULL DEFAULT 1,
      CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      LastLoginAt TEXT
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
      AuditID INTEGER PRIMARY KEY AUTOINCREMENT,
      Timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      UserID INTEGER,
      Username TEXT,
      Role TEXT,
      Method TEXT NOT NULL,
      Path TEXT NOT NULL,
      QueryParams TEXT,
      StatusCode INTEGER,
      Outcome TEXT CHECK(Outcome IN ('SUCCESS','REJECTED','ERROR')),
      TablesTouched TEXT,
      DurationMs INTEGER,
      ErrorMessage TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_auditlog_timestamp ON AuditLog(Timestamp);
    CREATE INDEX IF NOT EXISTS idx_auditlog_userid ON AuditLog(UserID);
  `);
}
