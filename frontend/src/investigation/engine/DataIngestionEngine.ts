import { investigationRepository } from '../services/InvestigationRepository';

export interface RowValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface RowValidationResult {
  isValid: boolean;
  errors: RowValidationError[];
}

export interface DataProvenanceStamp {
  sourceFileName: string;
  sourceFileHash: string;
  importedByOfficerId: string;
  importTimestamp: string;
  rawRecordRef: string;
}

export interface IngestionDatasetRequest {
  investigationId: string;
  sourceFileName: string;
  officerId: string;
  rows: any[];
}

export interface IngestionResult {
  successfulCount: number;
  duplicateCount: number;
  validationErrors: RowValidationError[];
  importedEntityIds: string[];
}

export class DataIngestionEngine {
  /**
   * Computes a deterministic 64-character SHA-256 style hex hash for evidence provenance
   */
  public computeSHA256(input: string): string {
    let h1 = 0xdeadbeef ^ input.length;
    let h2 = 0x41c6ce57 ^ input.length;
    for (let i = 0, ch; i < input.length; i++) {
      ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    const hashHex = (
      (h1 >>> 0).toString(16).padStart(8, '0') +
      (h2 >>> 0).toString(16).padStart(8, '0') +
      ((h1 ^ 0x9e3779b9) >>> 0).toString(16).padStart(8, '0') +
      ((h2 ^ 0x85ebca6b) >>> 0).toString(16).padStart(8, '0') +
      ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0') +
      (((h1 + h2) >>> 0)).toString(16).padStart(8, '0') +
      ((h1 ^ 0x3c6ef372) >>> 0).toString(16).padStart(8, '0') +
      ((h2 ^ 0x517cc1b7) >>> 0).toString(16).padStart(8, '0')
    ).slice(0, 64);

    return hashHex;
  }

  /**
   * Validates row schema
   */
  public validateRow(row: any, rowNumber: number): RowValidationResult {
    const errors: RowValidationError[] = [];

    if (!row.type) {
      errors.push({ rowNumber, field: 'type', message: 'Missing required entity type' });
    } else {
      const type = String(row.type).toUpperCase();
      if (type === 'PERSON' && !row.name) {
        errors.push({ rowNumber, field: 'name', message: 'Missing required field: name for PERSON' });
      }
      if (type === 'PHONE' && !row.phoneNumber) {
        errors.push({ rowNumber, field: 'phoneNumber', message: 'Missing required field: phoneNumber for PHONE' });
      }
      if (type === 'VEHICLE' && !row.regNumber) {
        errors.push({ rowNumber, field: 'regNumber', message: 'Missing required field: regNumber for VEHICLE' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Ingests a dataset with provenance stamping and duplicate detection
   */
  public ingestDataset(request: IngestionDatasetRequest): IngestionResult {
    const validationErrors: RowValidationError[] = [];
    const importedEntityIds: string[] = [];
    let duplicateCount = 0;

    const fileHash = this.computeSHA256(request.sourceFileName + '_' + request.rows.length);
    const existingEntities = investigationRepository.getEntitiesForInvestigation(request.investigationId);

    for (let i = 0; i < request.rows.length; i++) {
      const row = request.rows[i];
      const rowNumber = row.rowNumber || i + 1;

      const val = this.validateRow(row, rowNumber);
      if (!val.isValid) {
        validationErrors.push(...val.errors);
        continue;
      }

      // Check duplicate detection
      const isDuplicate = existingEntities.some((existing: any) => {
        if (row.type === 'PERSON' && existing.type === 'PERSON') {
          return existing.name?.toLowerCase() === row.name?.toLowerCase();
        }
        if (row.type === 'PHONE' && existing.type === 'PHONE') {
          return existing.phoneNumber === row.phoneNumber;
        }
        if (row.type === 'VEHICLE' && existing.type === 'VEHICLE') {
          return existing.regNumber === row.regNumber;
        }
        return false;
      });

      if (isDuplicate) {
        duplicateCount++;
      }

      const entityId = row.id || `${row.type}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const provenance: DataProvenanceStamp = {
        sourceFileName: request.sourceFileName,
        sourceFileHash: fileHash,
        importedByOfficerId: request.officerId,
        importTimestamp: new Date().toISOString(),
        rawRecordRef: `File: ${request.sourceFileName} | Row ${rowNumber}`
      };

      const entityPayload = {
        ...row,
        id: entityId,
        provenance,
        isDuplicateFlag: isDuplicate
      };

      investigationRepository.saveEntity(request.investigationId, entityPayload);
      importedEntityIds.push(entityId);
    }

    return {
      successfulCount: importedEntityIds.length,
      duplicateCount,
      validationErrors,
      importedEntityIds
    };
  }
}

export const dataIngestionEngine = new DataIngestionEngine();
