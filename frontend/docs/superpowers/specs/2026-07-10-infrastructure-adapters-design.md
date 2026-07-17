# Phase 2: Local-First Infrastructure Adapters Design

**Objective:** Validate the Intelligence Operating System entirely in a local environment before integrating with Zoho Catalyst. Catalyst is strictly a deployment/infrastructure platform, not a development dependency.

## Architecture

The project employs a **hybrid local-first architecture**. All interactions with storage, files, scheduling, or other platform services occur through abstract repository or adapter interfaces.

### 1. Primary Local Storage: SQLite
- **Why:** Zero external setup, lightweight, persistent, supports SQL, easy to inspect, and sufficient for hackathon-scale datasets.
- **Role:** The default development database. Will later be replaced by Catalyst Data Store with minimal repository changes.

### 2. Secondary Development Mode: Memory Repositories
- **Why:** Fast execution for unit tests, pipeline tests, engine tests, and quick prototyping.
- **Role:** Implements the exact same interfaces as SQLite repositories but stores data in memory.
- **Structure Example:**
  ```text
  EntityRepository (Interface)
  ├── MemoryEntityRepository
  ├── SQLiteEntityRepository
  └── CatalystEntityRepository (Future)
  ```

### 3. Spatial Data Strategy
- **Rule:** Do NOT use SQL GIS extensions (like PostGIS) for local development to keep code portable.
- **Implementation:** Spatial intelligence remains in the application layer using mature libraries:
  - `Turf.js` for geometry operations.
  - `h3-js` for spatial indexing and clustering.
  - GeoJSON for boundary data (districts, police stations, beats).
  - `Supercluster` (if clustering becomes a bottleneck on the frontend).

### 4. Excluded Technologies (For Now)
- **Docker:** Excluded to avoid additional setup overhead, RAM usage, and onboarding friction.
- **PostgreSQL / PostGIS:** Excluded because current datasets are small and SQLite is sufficient until spatial SQL capabilities become a true bottleneck.

## Local Folder Structure

All development assets must be kept local.

```text
data/
  database.sqlite
  fixtures/
    fir/
    persons/
    vehicles/
    relationships/
  geojson/
    districts.geojson
    police_stations.geojson
    beats.geojson
  exports/
```

## Data Seeding: Fixture Loader

A `FixtureLoader.ts` script must be created in `catalyst/server/fixtures/`.
- **Responsibilities:** 
  - Load sample FIRs.
  - Load Karnataka administrative GeoJSON.
  - Load mock accused, vehicles, and phones.
  - Seed the SQLite database.
- **Execution:** Hooked to `npm run seed` in `package.json` so every developer can instantly have identical local data.

## Migration Strategy (Future Phase)

After local validation is complete, migrating to Zoho Catalyst will require changing **only** the infrastructure modules.

```text
SQLiteEntityRepository -> CatalystEntityRepository
SQLiteCaseRepository -> CatalystCaseRepository
SQLiteEventRepository -> CatalystEventRepository
```
No changes should be required to Domain Models, Intelligence Engines, Pipelines, Services, UI, or Shared State.
