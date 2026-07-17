/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Evidence = {
    id?: string;
    category?: Evidence.category;
    description?: string;
    sourceEntityId?: string | null;
    sourceCaseId?: string | null;
    sourceFirReference?: string | null;
    collectedAt?: string;
    collectedBy?: string | null;
    fileReference?: string | null;
    confidence?: number;
};
export namespace Evidence {
    export enum category {
        PHOTO = 'PHOTO',
        VIDEO = 'VIDEO',
        STATEMENT = 'STATEMENT',
        FORENSIC = 'FORENSIC',
        DIGITAL = 'DIGITAL',
        FINANCIAL = 'FINANCIAL',
        CCTV = 'CCTV',
        DOCUMENT = 'DOCUMENT',
    }
}

