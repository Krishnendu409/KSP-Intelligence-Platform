import type { AuthTokenPayload } from './jwt';

export type JurisdictionFilter =
  | { level: 'unit'; unitId: number }
  | { level: 'district'; districtId: number };

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload | null;
      jurisdiction?: JurisdictionFilter | null;
      auditTables?: string[];
    }
  }
}

export {};
