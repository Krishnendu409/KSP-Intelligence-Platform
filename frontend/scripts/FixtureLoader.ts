import { readFileSync } from 'fs';
import { InfrastructureContext } from '../apps/intelligence-os/server/adapters/InfrastructureContext';

export class FixtureLoader {
  private context: InfrastructureContext;
  
  constructor(context: InfrastructureContext) {
    this.context = context;
  }
  
  public loadFixture(filePath: string): void {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    
    if (data.cases && this.context.casesRepository) {
      for (const c of data.cases) {
        this.context.casesRepository.create(c);
      }
    }
    
    if (data.entities && this.context.entitiesRepository) {
      for (const e of data.entities) {
        this.context.entitiesRepository.create(e);
      }
    }
    
    if (data.events && this.context.eventsRepository) {
      for (const ev of data.events) {
        this.context.eventsRepository.create(ev);
      }
    }
    
    if (data.relationships && this.context.relationshipsRepository) {
      for (const r of data.relationships) {
        this.context.relationshipsRepository.create(r);
      }
    }
    
    if (data.geos && this.context.geoRepository) {
      for (const g of data.geos) {
        this.context.geoRepository.create(g);
      }
    }
    
    if (data.metadata && this.context.metadataRepository) {
      for (const m of data.metadata) {
        this.context.metadataRepository.create(m);
      }
    }
  }
}
