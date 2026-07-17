import { describe, it, expect } from 'vitest';
const MULTI_CASE_DATABASE: any[] = [];

describe('Operational Search Indexing (TDD)', () => {
  it('should match FIR number exact and substring queries across all cases', () => {
    const query = 'FIR-2026-0889';
    const qLower = query.toLowerCase();
    const matches = Object.values(MULTI_CASE_DATABASE).filter(c =>
      c.id.toLowerCase().includes(qLower) ||
      c.title.toLowerCase().includes(qLower) ||
      c.summary.toLowerCase().includes(qLower)
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].id).toBe('FIR-2026-0889');
  });

  it('should match case codename (e.g. Nightfall)', () => {
    const query = 'Nightfall';
    const qLower = query.toLowerCase();
    const matches = Object.values(MULTI_CASE_DATABASE).filter(c =>
      c.id.toLowerCase().includes(qLower) ||
      c.title.toLowerCase().includes(qLower) ||
      c.summary.toLowerCase().includes(qLower)
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].id).toBe('FIR-2026-0889');
  });

  it('should index and match entities inside any case (e.g. Arjun Sharma, KA01AB1234, 98765)', () => {
    const query = 'Arjun';
    const qLower = query.toLowerCase();
    const allEntities = Object.values(MULTI_CASE_DATABASE).flatMap(c =>
      c.entities.map((e: any) => ({ ...e, caseId: c.id }))
    );
    const matches = allEntities.filter(e =>
      e.name.toLowerCase().includes(qLower) ||
      e.role.toLowerCase().includes(qLower) ||
      e.type.toLowerCase().includes(qLower)
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].name).toContain('Arjun');
  });
});
