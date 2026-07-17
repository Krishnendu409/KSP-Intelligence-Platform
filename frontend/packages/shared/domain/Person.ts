import type { BaseEntity } from './BaseEntity';

export interface Person extends BaseEntity {
    aliases: string[];
    riskScore: number;
}
