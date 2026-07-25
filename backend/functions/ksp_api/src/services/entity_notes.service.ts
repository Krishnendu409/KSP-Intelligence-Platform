import type Database from 'better-sqlite3';

export interface NoteEntry {
  entityType: string;
  entityId: string;
  author: string;
  text: string;
  noteType?: 'NOTE' | 'SURVEILLANCE';
}

export function ensureEntityNotesTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS EntityNotes (
      NoteID INTEGER PRIMARY KEY AUTOINCREMENT,
      EntityType TEXT NOT NULL,
      EntityID TEXT NOT NULL,
      Author TEXT NOT NULL,
      Timestamp TEXT NOT NULL,
      Text TEXT NOT NULL,
      NoteType TEXT DEFAULT 'NOTE'
    );
    CREATE INDEX IF NOT EXISTS idx_entity_notes ON EntityNotes (EntityType, EntityID);
  `);
}

export function addEntityNote(db: Database.Database, entry: NoteEntry): { success: boolean; noteId?: number; error?: string } {
  try {
    ensureEntityNotesTable(db);
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const stmt = db.prepare(`
      INSERT INTO EntityNotes (EntityType, EntityID, Author, Timestamp, Text, NoteType)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      entry.entityType.toUpperCase(),
      entry.entityId.toString(),
      entry.author || 'INVESTIGATOR',
      timestamp,
      entry.text,
      entry.noteType || 'NOTE'
    );
    return { success: true, noteId: Number(info.lastInsertRowid) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function getEntityNotes(db: Database.Database, entityType: string, entityId: string): Array<{
  id: string;
  timestamp: string;
  author: string;
  text: string;
  noteType: string;
}> {
  ensureEntityNotesTable(db);
  const rows = db.prepare(`
    SELECT NoteID as id, Timestamp as timestamp, Author as author, Text as text, NoteType as noteType
    FROM EntityNotes
    WHERE UPPER(EntityType) = UPPER(?) AND EntityID = ?
    ORDER BY NoteID DESC
  `).all(entityType.toUpperCase(), entityId.toString()) as any[];

  return rows.map(row => ({
    id: String(row.id),
    timestamp: row.timestamp,
    author: row.author,
    text: row.text,
    noteType: row.noteType || 'NOTE'
  }));
}
