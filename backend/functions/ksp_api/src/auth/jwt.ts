import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type Role = 'SHO' | 'IO' | 'Analyst' | 'SCRB' | 'SP';

export interface AuthTokenPayload {
  userId: number;
  username: string;
  role: Role;
  employeeId: number;
  unitId: number | null;
  districtId: number | null;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export const STATE_WIDE_ROLES: Role[] = ['SCRB', 'SP'];
export function isStateWide(role: Role): boolean {
  return STATE_WIDE_ROLES.includes(role);
}
