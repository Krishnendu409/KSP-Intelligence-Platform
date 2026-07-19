import type { JurisdictionFilter } from './types';

/**
 * Builds a SQL fragment + bound param for scoping a query joined against a
 * `Unit` table aliased as `unitAlias` (default `u`). Returns an empty clause
 * for state-wide callers (jurisdiction === null).
 */
export function jurisdictionClause(jurisdiction: JurisdictionFilter | null | undefined, unitAlias = 'u'): { clause: string; params: number[] } {
  if (!jurisdiction) return { clause: '', params: [] };
  if (jurisdiction.level === 'unit') {
    return { clause: `AND ${unitAlias}.UnitID = ?`, params: [jurisdiction.unitId] };
  }
  return { clause: `AND ${unitAlias}.DistrictID = ?`, params: [jurisdiction.districtId] };
}

/**
 * Post-fetch ownership check for single-resource routes (e.g. GET /api/cases/:id):
 * state-wide callers (jurisdiction === null) always match; otherwise the resource's
 * own unit/district must equal the caller's scope.
 */
export function matchesJurisdiction(jurisdiction: JurisdictionFilter | null | undefined, resource: { unitId?: number | null; districtId?: number | null }): boolean {
  if (!jurisdiction) return true;
  if (jurisdiction.level === 'unit') return resource.unitId === jurisdiction.unitId;
  return resource.districtId === jurisdiction.districtId;
}
