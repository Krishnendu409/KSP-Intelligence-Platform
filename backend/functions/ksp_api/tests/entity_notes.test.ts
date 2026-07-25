import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { getEntityNotes, addEntityNote } from '../src/services/entity_notes.service';

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');

describe('Entity Notes & Surveillance Logs Persistence (TDD)', () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database(dbPath);
  });

  afterAll(() => {
    if (db) db.close();
  });

  it('persists and retrieves entity investigative notes and surveillance logs', () => {
    const testEntityId = 'TEST-CASE-999';
    const testEntityType = 'Case';

    // Add a surveillance log
    const noteEntry = {
      entityType: testEntityType,
      entityId: testEntityId,
      author: 'INSPECTOR.RAJU',
      text: 'Surveillance camera ANPR #44 identified vehicle matching description at 23:45 hours.',
      noteType: 'SURVEILLANCE',
    };

    const addResult = addEntityNote(db, noteEntry);
    expect(addResult.success).toBe(true);
    expect(addResult.noteId).toBeDefined();

    // Retrieve notes
    const notes = getEntityNotes(db, testEntityType, testEntityId);
    expect(notes.length).toBeGreaterThanOrEqual(1);
    expect(notes[0].text).toContain('Surveillance camera ANPR #44');
    expect(notes[0].author).toBe('INSPECTOR.RAJU');
    expect(notes[0].noteType).toBe('SURVEILLANCE');

    // Clean up test data
    db.prepare('DELETE FROM EntityNotes WHERE EntityID = ?').run(testEntityId);
  });
});
