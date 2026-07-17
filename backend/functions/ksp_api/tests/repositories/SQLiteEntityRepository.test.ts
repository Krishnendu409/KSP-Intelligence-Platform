import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SQLiteEntityRepository } from '../../src/repositories/SQLiteEntityRepository';
import path from 'path';

describe('SQLiteEntityRepository', () => {
    let db: Database.Database;
    let repo: SQLiteEntityRepository;

    beforeAll(() => {
        const dbPath = path.resolve(__dirname, '../../../../../frontend/data/fir_system.sqlite');
        db = new Database(dbPath, { readonly: true });
        repo = new SQLiteEntityRepository(db);
    });

    afterAll(() => {
        db.close();
    });

    it('should find a Case entity by CASE- id', () => {
        const entity = repo.findById('CASE-1');
        if (entity) {
            expect(entity.id).toBe('CASE-1');
            expect(entity.type).toBe('Case');
            expect(entity.name).toBeDefined();
        } else {
            expect(entity).toBeUndefined();
        }
    });

    it('should find an Accused entity by ACCUSED- id', () => {
        const entity = repo.findById('ACCUSED-1');
        if (entity) {
            expect(entity.id).toBe('ACCUSED-1');
            expect(entity.type).toBe('Accused');
            expect(entity.name).toBeDefined();
        }
    });

    it('should return undefined for unknown prefix', () => {
        const entity = repo.findById('UNKNOWN-999');
        expect(entity).toBeUndefined();
    });
});
