export function searchCases(db: any, query: string, limit: number = 20) {
    if (!query || query.trim() === '') {
        return [];
    }

    // Sanitize query for FTS5 (escape quotes and match exact terms or prefixes)
    // Basic sanitization: remove special characters that break FTS5 syntax
    const sanitized = query.replace(/[^\w\s]/gi, '').trim();
    if (!sanitized) return [];

    // Split into terms and add prefix matching (*) for the last term or all terms
    const terms = sanitized.split(/\s+/).map(t => `"${t}"*`).join(' AND ');

    try {
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
    } catch (e: any) {
        console.error("Search error:", e.message);
        // Fallback for empty or syntax error if it somehow slips through
        return [];
    }
}
