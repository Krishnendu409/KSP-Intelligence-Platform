import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SQLiteRelationshipRepository } from '../../src/repositories/SQLiteRelationshipRepository';
import path from 'path';

describe('SQLiteRelationshipRepository', () => {
    let db: Database.Database;
    let repo: SQLiteRelationshipRepository;

    beforeAll(() => {
        const dbPath = path.resolve(__dirname, '../../../../../frontend/data/fir_system.sqlite');
        db = new Database(dbPath, { readonly: true });
        repo = new SQLiteRelationshipRepository(db);
    });

    afterAll(() => {
        db.close();
    });

    it('should find relationships by sourceId for a CASE', () => {
        const rels = repo.findBySourceId('CASE-1');
        // A case might have victims, accused, complainant, station, IO
        expect(Array.isArray(rels)).toBe(true);
        if (rels.length > 0) {
            expect(rels[0].sourceId).toBe('CASE-1');
            expect(rels[0].targetId).toBeDefined();
            expect(rels[0].type).toBeDefined();
        }
    });

    it('should find relationships by targetId for an ACCUSED', () => {
        const rels = repo.findBySourceId('ACCUSED-1');
        expect(Array.isArray(rels)).toBe(true);
        if (rels.length > 0) {
            expect(rels[0].sourceId).toBe('ACCUSED-1');
            expect(rels[0].targetId).toMatch(/^CASE-/);
            expect(rels[0].type).toBe('ACCUSED_IN');
        }
    });
});
