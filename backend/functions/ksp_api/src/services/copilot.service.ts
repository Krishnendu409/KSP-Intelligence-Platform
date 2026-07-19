import type Database from 'better-sqlite3';
import { searchCases } from './SearchService';
import { getDistrictDrillDownStats } from './network.service';
import { getAnomalyAlerts, getDistrictTrend } from './trend.service';
import { findRepeatOffenders } from './identity.service';
import type { JurisdictionFilter } from '../auth/types';

/**
 * Deterministic copilot (ADR 0007: zero non-deterministic LLMs in the analytical
 * path). Rather than free-text generation, the question is routed by rule-based
 * intent detection to the same search/analytics services the rest of the app
 * uses, and the answer is composed from a template — every fact traces back to
 * a real query, and the response always carries the filters used and a
 * confidence score, mirroring the PRD's explainability fields.
 */

export interface CopilotResponse {
  answer: string;
  intent: string;
  tablesUsed: string[];
  filtersUsed: Record<string, unknown>;
  confidence: number;
  reasoningSummary: string;
  visualizationType: 'map' | 'list' | 'table' | 'text';
  data: unknown;
}

interface CopilotContext {
  jurisdiction: JurisdictionFilter | null;
}

const DISTRICT_NAME_PATTERN = /\b(?:in|for|at)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\b/;

function extractDistrictName(db: Database.Database, question: string): string | null {
  const districts = db.prepare('SELECT DistrictName FROM District').all() as { DistrictName: string }[];
  const lower = question.toLowerCase();
  for (const d of districts) {
    if (d.DistrictName && lower.includes(d.DistrictName.toLowerCase())) return d.DistrictName;
  }
  return null;
}

export function answerQuestion(db: Database.Database, question: string, ctx: CopilotContext): CopilotResponse {
  const q = question.trim();
  const lower = q.toLowerCase();

  if (!q) {
    return {
      answer: 'Please enter a question.',
      intent: 'EMPTY',
      tablesUsed: [],
      filtersUsed: {},
      confidence: 0,
      reasoningSummary: 'No question text was provided.',
      visualizationType: 'text',
      data: null,
    };
  }

  // Repeat-offender / cross-district pattern
  if (/repeat offend|cross[- ]district|multiple (fir|case)s|same accused/i.test(lower)) {
    const groups = findRepeatOffenders(db, { minCases: 3 }).slice(0, 20);
    return {
      answer: groups.length > 0
        ? `Found ${groups.length} accused identity cluster(s) linked to 3+ FIRs via fuzzy name+age+gender matching. Top match: "${groups[0].representativeName}" across ${groups[0].caseCount} cases in ${groups[0].districtCount} district(s).`
        : 'No accused identity clusters matched 3 or more FIRs with the current fuzzy-match threshold.',
      intent: 'REPEAT_OFFENDER',
      tablesUsed: ['Accused', 'CaseMaster', 'Unit', 'District'],
      filtersUsed: { minCases: 3, nameSimilarityThreshold: 0.82, ageToleranceYears: 2 },
      confidence: groups.length > 0 ? Math.round(groups.reduce((s, g) => s + g.minConfidence, 0) / groups.length) : 40,
      reasoningSummary: 'Clustered Accused rows by normalized name similarity (Levenshtein) within an age tolerance of ±2 years and matching gender, then kept clusters spanning 3+ distinct CaseMasterIDs. This is a fuzzy match, not a certain identity link — see the confidence score.',
      visualizationType: 'table',
      data: groups,
    };
  }

  // Anomaly / spike detection
  if (/anomal|spike|unusual|emerging hotspot|unexpected/i.test(lower)) {
    const alerts = getAnomalyAlerts(db, 8).slice(0, 20);
    return {
      answer: alerts.length > 0
        ? `${alerts.length} anomaly alert(s) found: the strongest is ${alerts[0].crimeSubHeadName} in ${alerts[0].districtName} — ${alerts[0].reason}.`
        : 'No weekly crime-count anomalies exceed the ±2σ threshold in the current data.',
      intent: 'ANOMALY',
      tablesUsed: ['CaseMaster', 'CrimeSubHead', 'Unit', 'District'],
      filtersUsed: { lookbackWeeks: 8, zScoreThreshold: 2 },
      confidence: alerts.length > 0 ? 85 : 60,
      reasoningSummary: 'Weekly case counts per district+crime-subhead were compared to their trailing 8-week mean/standard deviation; weeks with |z| > 2 are flagged, matching the PRD-specified z-score method.',
      visualizationType: 'list',
      data: alerts,
    };
  }

  // District-specific trend / hotspot
  const districtName = extractDistrictName(db, q);
  if (districtName && /trend|hotspot|crime rate|how many|stats|compare/i.test(lower)) {
    if (ctx.jurisdiction) {
      // SHO/IO/Analyst are scoped to their own unit/district; a district-level
      // question about a different district is refused, not silently answered
      // with data outside their jurisdiction.
      const district = db.prepare('SELECT DistrictID FROM District WHERE DistrictName = ?').get(districtName) as { DistrictID: number } | undefined;
      const callerDistrictId = ctx.jurisdiction.level === 'district' ? ctx.jurisdiction.districtId : null;
      const inScope = ctx.jurisdiction.level === 'district'
        ? district?.DistrictID === callerDistrictId
        : true; // unit-level callers are checked against their own station's cases only, via getDistrictDrillDownStats being naturally empty outside their beat is not guaranteed, so restrict explicitly below
      if (ctx.jurisdiction.level === 'unit' || !inScope) {
        return {
          answer: `You don't have jurisdiction to query district-wide statistics for ${districtName}.`,
          intent: 'FORBIDDEN',
          tablesUsed: [],
          filtersUsed: { district: districtName },
          confidence: 0,
          reasoningSummary: 'District-level analytics require Analyst-level (or state-wide) access scoped to that district.',
          visualizationType: 'text',
          data: null,
        };
      }
    }
    const stats = getDistrictDrillDownStats(db, districtName);
    const trend = getDistrictTrend(db, districtName, 30);
    return {
      answer: `${districtName}: ${stats.totalCrimes} total cases (${stats.heinousCount} heinous), trend ${stats.trend} vs the prior 30-day window.`,
      intent: 'DISTRICT_TREND',
      tablesUsed: ['CaseMaster', 'Unit', 'District', 'CrimeHead'],
      filtersUsed: { district: districtName, windowDays: 30 },
      confidence: trend.priorPeriodCount > 0 ? 90 : 55,
      reasoningSummary: `Filtered CaseMaster to ${districtName} district and compared the last 30 days of registrations to the preceding 30-day window.`,
      visualizationType: 'table',
      data: { stats, trend },
    };
  }

  // Fallback: full-text BM25 search over CrimeNo/BriefFacts
  const results = (searchCases(db, q, 10) as any[]) || [];
  return {
    answer: results.length > 0
      ? `Found ${results.length} case(s) matching "${q}". Top match: Crime No ${results[0].CrimeNo}.`
      : `No cases matched "${q}". Try a crime number, district name, or a phrase from the case narrative.`,
    intent: 'SEARCH',
    tablesUsed: ['CaseMaster'],
    filtersUsed: { query: q, limit: 10 },
    confidence: results.length > 0 ? Math.min(95, 60 + results.length * 3) : 20,
    reasoningSummary: `Ran a full-text BM25 search for "${q}" over CrimeNo and BriefFacts.`,
    visualizationType: 'table',
    data: results,
  };
}
