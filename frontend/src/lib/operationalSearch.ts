const MULTI_CASE_DATABASE: any[] = [];

export interface OperationalSearchResult {
  id: string;
  name: string;
  type: string;
  subtitle?: string;
  caseId?: string;
  score: number;
}

export function performOperationalSearch(rawQuery: string): OperationalSearchResult[] {
  if (!rawQuery || !rawQuery.trim()) return [];

  // Strip operator prefixes like case:, fir:, person:, phone:, vehicle:, evidence:
  const cleaned = rawQuery
    .replace(/^(case|fir|person|phone|vehicle|evidence|threat):\s*/i, "")
    .trim()
    .toLowerCase();

  if (!cleaned) return [];

  const results: OperationalSearchResult[] = [];

  // 1. Search across all cases in MULTI_CASE_DATABASE
  Object.values(MULTI_CASE_DATABASE).forEach((caseItem) => {
    const caseMatch =
      caseItem.id.toLowerCase().includes(cleaned) ||
      caseItem.title.toLowerCase().includes(cleaned) ||
      caseItem.summary.toLowerCase().includes(cleaned) ||
      caseItem.lead.toLowerCase().includes(cleaned);

    if (caseMatch) {
      results.push({
        id: caseItem.id,
        name: `${caseItem.id} — ${caseItem.title}`,
        type: "Case",
        subtitle: `${caseItem.threatLevel} | Lead: ${caseItem.lead}`,
        caseId: caseItem.id,
        score: caseItem.id.toLowerCase().includes(cleaned) ? 1.0 : 0.95,
      });
    }

    // 2. Search entities inside this case
    caseItem.entities.forEach((entity: any) => {
      const entityMatch =
        entity.name.toLowerCase().includes(cleaned) ||
        entity.id.toLowerCase().includes(cleaned) ||
        entity.role.toLowerCase().includes(cleaned) ||
        entity.type.toLowerCase().includes(cleaned);

      if (entityMatch) {
        results.push({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          subtitle: `${entity.role} (Case: ${caseItem.id})`,
          caseId: caseItem.id,
          score: entity.name.toLowerCase().includes(cleaned) ? 0.96 : 0.88,
        });
      }
    });

    // 3. Search evidence inside this case
    caseItem.evidence.forEach((ev: any) => {
      const evMatch =
        ev.title.toLowerCase().includes(cleaned) ||
        ev.id.toLowerCase().includes(cleaned) ||
        ev.source.toLowerCase().includes(cleaned) ||
        ev.category.toLowerCase().includes(cleaned);

      if (evMatch) {
        results.push({
          id: ev.id,
          name: ev.title,
          type: "Evidence",
          subtitle: `[${ev.category}] ${ev.source} — Case ${caseItem.id}`,
          caseId: caseItem.id,
          score: 0.85,
        });
      }
    });
  });

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
