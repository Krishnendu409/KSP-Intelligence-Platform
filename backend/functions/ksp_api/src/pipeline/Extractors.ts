export interface ExtractedEntity {
    label: string;
    value: string;
    confidence: number;
}

export interface Extractor {
    extract(text: string): Promise<ExtractedEntity[]>; 
}

export interface MOExtractor extends Extractor {
    extract(text: string): Promise<ExtractedEntity[]>;
}
