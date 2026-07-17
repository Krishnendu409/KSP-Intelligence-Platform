import { describe, it, expect } from 'vitest';
import { performOperationalSearch } from '../lib/operationalSearch';

describe('OperationalSearch Module (TDD)', () => {
  it('searches exact FIR numbers and returns Case result with threat metadata', () => {
    const results = performOperationalSearch('FIR-2026-0889');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe('Case');
    expect(results[0].id).toBe('FIR-2026-0889');
    expect(results[0].subtitle).toContain('CRITICAL RISK');
  });

  it('strips operator prefixes like case: or fir: before searching', () => {
    const results = performOperationalSearch('case: Nightfall');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('FIR-2026-0889');
  });

  it('finds entities by phone number or vehicle plate', () => {
    const results = performOperationalSearch('KA01MF2345');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Toyota Fortuner');
    expect(results[0].caseId).toBe('FIR-2026-0889');
  });

  it('finds evidence exhibits by keyword', () => {
    const results = performOperationalSearch('Tower Dump');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe('Evidence');
    expect(results[0].name).toContain('Tower Dump');
  });
});
