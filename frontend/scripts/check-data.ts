import { InfrastructureContext } from '../apps/intelligence-os/server/adapters/InfrastructureContext';
import { SQLiteConnection } from '../apps/intelligence-os/server/adapters/database/SQLiteConnection';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/intelligence.sqlite');
const dbConnection = new SQLiteConnection(dbPath);
const db = dbConnection.getDb();
const context = new InfrastructureContext({ dbPath }, db);

try {
  const cases = context.casesRepository?.findAll() || [];
  const entities = context.entitiesRepository?.findAll() || [];
  const events = context.eventsRepository?.findAll() || [];
  
  const relCount = db.prepare('SELECT COUNT(*) as count FROM Relationships').get() as { count: number };
  const relationshipsCount = relCount.count;
  
  console.log('Data Check Summary:');
  console.log(`Cases: ${cases.length}`);
  console.log(`Entities: ${entities.length}`);
  console.log(`Events: ${events.length}`);
  console.log(`Relationships: ${relationshipsCount}`);
  
  if (cases.length === 0 && entities.length === 0) {
    console.log('Database is empty.');
  } else {
    console.log('Database has data.');
  }
} catch (error) {
  console.error('Error checking data:', error);
  process.exit(1);
} finally {
  dbConnection.close();
}
