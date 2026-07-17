import type { BaseEntity } from '@shared/domain/BaseEntity';

export interface EntityResolver {
    resolve(entity: Partial<BaseEntity>): Promise<BaseEntity>;
    calculateSimilarity(a: BaseEntity, b: BaseEntity): number;
    merge(primaryId: string, secondaryId: string): Promise<BaseEntity>;
}
