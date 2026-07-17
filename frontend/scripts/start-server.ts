/**
 * Intelligence OS API Server — Dev Startup Script
 * Starts the TypeScript Express API server connected to the SQLite database.
 * 
 * Usage: npm run server
 * Port: 3000 (matches App.tsx OpenAPI.BASE)
 */
import { createApiApp } from '../apps/intelligence-os/server/api/app';
import { SQLiteConnection } from '../apps/intelligence-os/server/adapters/database/SQLiteConnection';
import { InfrastructureContext } from '../apps/intelligence-os/server/adapters/InfrastructureContext';
import { EntityService } from '../apps/intelligence-os/server/services/EntityService';
import { RelationshipService } from '../apps/intelligence-os/server/services/RelationshipService';
import { TimelineService } from '../apps/intelligence-os/server/services/TimelineService';
import { FederatedIntelligenceSearchEngine } from '../apps/intelligence-os/server/engines/search/FederatedIntelligenceSearchEngine';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const dbPath = path.resolve(__dirname, '../data/intelligence.sqlite');
const migrationPath = path.resolve(__dirname, '../apps/intelligence-os/server/adapters/database/migrations/001_initial_schema.sql');

console.log(`[Intelligence OS API] Starting server on port ${PORT}`);
console.log(`[Intelligence OS API] Database: ${dbPath}`);

const dbConnection = new SQLiteConnection(dbPath);

// Run migrations if the DB was just created
const migrationSql = fs.readFileSync(migrationPath, 'utf8');
try {
  dbConnection.exec(migrationSql);
} catch {
  // Migrations already applied — safe to ignore
}

const context = new InfrastructureContext({ dbPath }, dbConnection.getDb());

const entityService = new EntityService(
  context.entitiesRepository!,
  context.metadataRepository!,
  context.eventsRepository!,
  context.relationshipsRepository!,
  context.geoRepository!
);

const relationshipService = new RelationshipService(
  context.relationshipsRepository!,
  context.provenanceRepository!,
  context.entitiesRepository!
);

const timelineService = new TimelineService(
  context.eventsRepository!,
  context.relationshipsRepository!
);

const searchEngine = new FederatedIntelligenceSearchEngine(
  context.entitiesRepository!,
  context.metadataRepository!,
  context.casesRepository!
);

const app = createApiApp(searchEngine, entityService, relationshipService, timelineService);
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[Intelligence OS API] ✓ Server running at http://localhost:${PORT}`);
  console.log(`[Intelligence OS API] ✓ API Docs at http://localhost:${PORT}/api-docs`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    dbConnection.close();
    process.exit(0);
  });
});
