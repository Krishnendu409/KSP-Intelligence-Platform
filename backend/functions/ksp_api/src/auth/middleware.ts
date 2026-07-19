import type { Request, Response, NextFunction } from 'express';
import type Database from 'better-sqlite3';
import './types';
import { verifyToken, isStateWide, type Role } from './jwt';
import { insertAuditLog, type AuditOutcome } from '../services/audit.service';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  req.user = token ? verifyToken(token) : null;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid token' });
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: requires role ${roles.join(' or ')}` });
    }
    next();
  };
}

/**
 * Scopes a route's jurisdiction per PRD §13.1: SHO/IO see only their own Unit,
 * Analyst sees their own District, SCRB/SP see state-wide (itself audit-logged
 * via AuditLog.Role). The route/service applies req.jurisdiction to its query
 * or rejects an out-of-scope resource request.
 */
export function scopeJurisdiction(tablesTouched: string[] = []) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next();
    req.auditTables = [...(req.auditTables || []), ...tablesTouched];

    if (isStateWide(req.user.role)) {
      req.jurisdiction = null;
    } else if (req.user.role === 'Analyst') {
      req.jurisdiction = { level: 'district', districtId: req.user.districtId ?? -1 };
    } else {
      req.jurisdiction = { level: 'unit', unitId: req.user.unitId ?? -1 };
    }
    next();
  };
}

export function auditLogger(db: Database.Database) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      let outcome: AuditOutcome = 'SUCCESS';
      if (res.statusCode >= 500) outcome = 'ERROR';
      else if (res.statusCode >= 400) outcome = 'REJECTED';

      try {
        insertAuditLog(db, {
          userId: req.user?.userId ?? null,
          username: req.user?.username ?? null,
          role: req.user?.role ?? null,
          method: req.method,
          path: req.path,
          queryParams: req.query,
          statusCode: res.statusCode,
          outcome,
          tablesTouched: req.auditTables || [],
          durationMs,
          errorMessage: res.locals?.errorMessage ?? null,
        });
      } catch (e) {
        // Audit logging must never crash the request; failures are only surfaced to server logs.
        console.error('[audit] failed to write audit log entry:', e);
      }
    });
    next();
  };
}
