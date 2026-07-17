import { randomUUID } from 'crypto';
import type { NormalizedFIR } from '@shared/domain/NormalizedFIR';
import type { RawFIR } from '@shared/domain/RawFIR';
import type { GeoRow, MetadataRow } from '@shared/repositories/IRepositories';

export interface ExtractedFeatures {
  geoFeatures: GeoRow[];
  metadataFeatures: MetadataRow[];
}

export class FeatureExtractionStage {
  /**
   * Generates reusable features (Search Features, Spatial Features, Temporal Features).
   * Performs NO analytics. It only prepares inputs for Phase 4.
   */
  public static execute(canonicalFir: RawFIR, normalized: NormalizedFIR): ExtractedFeatures {
    const geoFeatures: GeoRow[] = [];
    const metadataFeatures: MetadataRow[] = [];
    const now = new Date().toISOString();

    // 1. Spatial Features (from Incident)
    if (normalized.event.coordinates) {
      geoFeatures.push({
        id: `geo-${randomUUID()}`,
        entityId: normalized.event.id, // Linking geo feature to the event
        latitude: normalized.event.coordinates.lat,
        longitude: normalized.event.coordinates.lng,
        locationName: normalized.event.location,
        createdAt: now,
        updatedAt: now
      });
    }

    // 2. Metadata Features (Sections, District, PS)
    canonicalFir.sections.forEach(section => {
      metadataFeatures.push({
        id: `meta-${randomUUID()}`,
        entityId: normalized.case.id,
        key: 'CRIME_SECTION',
        value: section,
        createdAt: now,
        updatedAt: now
      });
    });

    metadataFeatures.push({
      id: `meta-${randomUUID()}`,
      entityId: normalized.case.id,
      key: 'DISTRICT',
      value: canonicalFir.district,
      createdAt: now,
      updatedAt: now
    });

    metadataFeatures.push({
      id: `meta-${randomUUID()}`,
      entityId: normalized.case.id,
      key: 'POLICE_STATION',
      value: canonicalFir.policeStation,
      createdAt: now,
      updatedAt: now
    });

    return { geoFeatures, metadataFeatures };
  }
}
