import type Database from 'better-sqlite3';

export type AuditOutcome = 'SUCCESS' | 'REJECTED' | 'ERROR';

export interface AuditEntry {
  userId: number | null;
  username: string | null;
  role: string | null;
  method: string;
  path: string;
  queryParams: unknown;
  statusCode: number;
  outcome: AuditOutcome;
  tablesTouched: string[];
  durationMs: number;
  errorMessage?: string | null;
}

export function insertAuditLog(db: Database.Database, entry: AuditEntry): void {
  db.prepare(`
    INSERT INTO AuditLog (
      Timestamp, UserID, Username, Role, Method, Path, QueryParams,
      StatusCode, Outcome, TablesTouched, DurationMs, ErrorMessage
    ) VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.userId,
    entry.username,
    entry.role,
    entry.method,
    entry.path,
    JSON.stringify(entry.queryParams ?? {}),
    entry.statusCode,
    entry.outcome,
    JSON.stringify(entry.tablesTouched ?? []),
    entry.durationMs,
    entry.errorMessage ?? null
  );
}

export function getAuditLogs(db: Database.Database, opts: { from?: string; to?: string; userId?: number; limit?: number }) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts.from) {
    conditions.push('Timestamp >= ?');
    params.push(opts.from);
  }
  if (opts.to) {
    conditions.push('Timestamp <= ?');
    params.push(opts.to);
  }
  if (opts.userId) {
    conditions.push('UserID = ?');
    params.push(opts.userId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Math.min(opts.limit ?? 200, 1000);

  return db.prepare(`
    SELECT * FROM AuditLog ${where} ORDER BY AuditID DESC LIMIT ?
  `).all(...params, limit);
}
