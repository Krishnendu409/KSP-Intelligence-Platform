import * as fs from 'fs';
import { FixtureLoader } from './FixtureLoader';
import { InfrastructureContext } from '../apps/intelligence-os/server/adapters/InfrastructureContext';
import { SQLiteConnection } from '../apps/intelligence-os/server/adapters/database/SQLiteConnection';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/intelligence.sqlite');
console.log(`Connecting to database at ${dbPath}`);

const dbConnection = new SQLiteConnection(dbPath);
const context = new InfrastructureContext({ dbPath }, dbConnection.getDb());
const loader = new FixtureLoader(context);

const fixturePath = path.resolve(__dirname, '../data/fixtures/canonical_investigation.json');
console.log(`Loading fixture from ${fixturePath}`);

const migrationPath = path.resolve(__dirname, '../apps/intelligence-os/server/adapters/database/migrations/001_initial_schema.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');
dbConnection.exec(migrationSql);

try {
  dbConnection.exec(`
    DELETE FROM Metadata;
    DELETE FROM Geo;
    DELETE FROM Relationships;
    DELETE FROM Events;
    DELETE FROM Entities;
    DELETE FROM Cases;
  `);
  loader.loadFixture(fixturePath);
  console.log('Successfully seeded database with canonical investigation.');
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} finally {
  dbConnection.close();
}
