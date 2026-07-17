import type { BaseEntity } from '@shared/domain/BaseEntity';

export interface RawFIR {
    firNumber: string;
    text: string;
    date: string;
    policeStation: string;
}

export interface NormalizationPipeline {
    ingest(raw: RawFIR): Promise<string>; // Returns job ID
    validate(raw: RawFIR): Promise<boolean>;
    extractEntities(text: string): Promise<Partial<BaseEntity>[]>;
    normalize(entities: Partial<BaseEntity>[]): Promise<BaseEntity[]>;
}
