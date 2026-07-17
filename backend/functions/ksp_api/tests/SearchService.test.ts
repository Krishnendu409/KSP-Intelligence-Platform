import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { searchCases } from '../src/services/SearchService';

describe('SearchService', () => {
    let db: any;

    beforeAll(() => {
        const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');
        db = new Database(dbPath);
    });

    afterAll(() => {
        if(db) db.close();
    });

    it('returns empty array when query is empty', () => {
        const results = searchCases(db, '');
        expect(results).toEqual([]);
    });

    it('returns valid search results with a score for a valid query', () => {
        const results = searchCases(db, 'murder'); // Using murder since it's likely to match BriefFacts
        expect(Array.isArray(results)).toBe(true);
        if (results.length > 0) {
            expect(results[0]).toHaveProperty('CaseMasterID');
            expect(results[0]).toHaveProperty('CrimeNo');
            expect(results[0]).toHaveProperty('BriefFacts');
            expect(results[0]).toHaveProperty('score');
            expect(typeof results[0].score).toBe('number');
            // BM25 score should be negative (better-sqlite3 standard for bm25)
            expect(results[0].score).toBeLessThanOrEqual(0);
        }
    });

    it('cleans up malicious/invalid queries without crashing', () => {
        const results = searchCases(db, 'SELECT * FROM "CaseMaster"');
        expect(Array.isArray(results)).toBe(true);
    });
});
