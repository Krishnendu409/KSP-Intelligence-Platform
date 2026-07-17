import { SQLiteConnection } from '../apps/intelligence-os/server/adapters/database/SQLiteConnection';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/intelligence.sqlite');
console.log(`Connecting to database at ${dbPath}`);

const dbConnection = new SQLiteConnection(dbPath);
const db = dbConnection.getDb();

try {
  console.log('Resetting database...');
  db.exec('PRAGMA foreign_keys = OFF;');
  
  const tables = ['Provenance', 'Metadata', 'SpatialCache', 'Geo', 'Relationships', 'Events', 'Cases', 'Entities'];
  
  for (const table of tables) {
    db.exec(`DROP TABLE IF EXISTS ${table};`);
  }
  
  const migrationPath = path.resolve(__dirname, '../apps/intelligence-os/server/adapters/database/migrations/001_initial_schema.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  db.exec(migrationSql);
  
  db.exec('PRAGMA foreign_keys = ON;');
  console.log('Database reset and schema recreated successfully.');
} catch (error) {
  console.error('Error resetting database:', error);
  process.exit(1);
} finally {
  dbConnection.close();
}
