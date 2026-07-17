import { createApiApp } from '../apps/intelligence-os/server/api/app';
import { SQLiteConnection } from '../apps/intelligence-os/server/adapters/database/SQLiteConnection';
import { InfrastructureContext } from '../apps/intelligence-os/server/adapters/InfrastructureContext';
import { EntityService } from '../apps/intelligence-os/server/services/EntityService';
import { RelationshipService } from '../apps/intelligence-os/server/services/RelationshipService';
import { TimelineService } from '../apps/intelligence-os/server/services/TimelineService';
import { FederatedIntelligenceSearchEngine } from '../apps/intelligence-os/server/engines/search/FederatedIntelligenceSearchEngine';
import { DefaultService, OpenAPI } from '../packages/shared/client/index';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv from 'ajv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as http from 'http';
import * as fs from 'fs';
import { FixtureLoader } from './FixtureLoader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  const dbConnection = new SQLiteConnection(':memory:');
  const context = new InfrastructureContext({ dbPath: ':memory:' }, dbConnection.getDb());
  
  const migrationPath = path.resolve(__dirname, '../apps/intelligence-os/server/adapters/database/migrations/001_initial_schema.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  dbConnection.exec(migrationSql);
  
  // Initialize services
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
  
  const loader = new FixtureLoader(context);
  const fixturePath = path.resolve(__dirname, '../data/fixtures/canonical_investigation.json');
  loader.loadFixture(fixturePath);
  
  const app = createApiApp(searchEngine, entityService, relationshipService, timelineService);
  const server = http.createServer(app);
  
  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
  
  const address = server.address() as import('net').AddressInfo;
  OpenAPI.BASE = `http://localhost:${address.port}`;
  
  console.log(`Server listening on ${OpenAPI.BASE}`);
  
  const openApiPath = path.resolve(__dirname, '../apps/intelligence-os/server/api/openapi.yaml');
  const apiSpec = await SwaggerParser.dereference(openApiPath) as any;
  const ajv = new Ajv({ strict: false, allErrors: true });
  
  let hasErrors = false;
  
  try {
    console.log('Testing /api/search...');
    const searchRes = await DefaultService.getApiSearch('Alex');
    const searchSchema = apiSpec.paths['/api/search'].get.responses['200'].content['application/json'].schema;
    const validateSearch = ajv.compile(searchSchema);
    if (!validateSearch(searchRes)) {
      console.error('Search response failed contract validation:', validateSearch.errors);
      hasErrors = true;
    }
    
    const targetId = searchRes.results?.[0]?.id || 'ent-person-arjun';

    console.log('Testing /api/entities/:id/dossier...');
    const dossierResFound = await DefaultService.getApiEntitiesDossier(targetId);
    const dossierSchema = apiSpec.paths['/api/entities/{id}/dossier'].get.responses['200'].content['application/json'].schema;
    const validateDossier = ajv.compile(dossierSchema);
    if (!validateDossier(dossierResFound)) {
      console.error('Dossier response failed contract validation:', validateDossier.errors);
      hasErrors = true;
    }
    
    console.log('Testing /api/entities/:id/relationships...');
    const relRes = await DefaultService.getApiEntitiesRelationships(targetId);
    const relSchema = apiSpec.paths['/api/entities/{id}/relationships'].get.responses['200'].content['application/json'].schema;
    const validateRel = ajv.compile(relSchema);
    if (!validateRel(relRes)) {
      console.error('Relationships response failed contract validation:', validateRel.errors);
      hasErrors = true;
    }
    
    console.log('Testing /api/entities/locations...');
    const locRes = await DefaultService.getApiEntitiesLocations();
    const locSchema = apiSpec.paths['/api/entities/locations'].get.responses['200'].content['application/json'].schema;
    const validateLoc = ajv.compile(locSchema);
    if (!validateLoc(locRes)) {
      console.error('Locations response failed contract validation:', validateLoc.errors);
      hasErrors = true;
    }

    console.log('Testing /api/events...');
    const eventRes = await DefaultService.getApiEvents(targetId);
    const eventSchema = apiSpec.paths['/api/events'].get.responses['200'].content['application/json'].schema;
    const validateEvent = ajv.compile(eventSchema);
    if (!validateEvent(eventRes)) {
      console.error('Events response failed contract validation:', validateEvent.errors);
      hasErrors = true;
    }
  } catch (err) {
    console.error('Error executing requests:', err);
    hasErrors = true;
  } finally {
    server.close();
    dbConnection.close();
  }
  
  if (hasErrors) {
    console.error('Contract validation FAILED.');
    process.exit(1);
  } else {
    console.log('Contract validation PASSED.');
    process.exit(0);
  }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
