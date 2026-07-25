import { jurisdictionClause } from '../auth/jurisdictionSql';
import type { JurisdictionFilter } from '../auth/types';

export function searchCases(db: any, query: string, limit: number = 20, jurisdiction?: JurisdictionFilter | null) {
    if (!query || query.trim() === '') {
        return [];
    }

    // Sanitize query for FTS5 (escape quotes and match exact terms or prefixes)
    const sanitized = query.replace(/[^\w\s]/gi, '').trim();
    if (!sanitized) return [];

    const terms = sanitized.split(/\s+/).map(t => `"${t}"*`).join(' AND ');

    try {
        if (jurisdiction) {
            const { clause, params } = jurisdictionClause(jurisdiction, 'u');
            const stmt = db.prepare(`
                SELECT 
                    f.rowid AS CaseMasterID, 
                    f.CrimeNo, 
                    f.BriefFacts, 
                    bm25(CaseMaster_fts) as score
                FROM CaseMaster_fts f
                JOIN CaseMaster c ON f.rowid = c.CaseMasterID
                JOIN Unit u ON c.PoliceStationID = u.UnitID
                WHERE CaseMaster_fts MATCH ?
                ${clause}
                ORDER BY bm25(CaseMaster_fts)
                LIMIT ?
            `);
            return stmt.all(terms, ...params, limit);
        } else {
            const stmt = db.prepare(`
                SELECT 
                    rowid AS CaseMasterID, 
                    CrimeNo, 
                    BriefFacts, 
                    bm25(CaseMaster_fts) as score
                FROM CaseMaster_fts
                WHERE CaseMaster_fts MATCH ?
                ORDER BY bm25(CaseMaster_fts)
                LIMIT ?
            `);
            return stmt.all(terms, limit);
        }
    } catch (e: any) {
        console.error("Search error:", e.message);
        return [];
    }
}
