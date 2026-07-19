import type Database from 'better-sqlite3';

/**
 * Deterministic identity-resolution utilities (PRD §9.3/§9.5): the schema has no
 * state-wide unique person key (Accused.PersonID is a per-case label like A1, A2),
 * so cross-FIR identity matching is necessarily a fuzzy match on
 * normalized-name + age tolerance + gender. Every result below carries a visible
 * confidence score — this is never presented as a certain identity link (ADR 0007).
 */

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

export function normalizeName(name: string): string {
  return (name || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

/** Similarity in [0,1], 1 = identical normalized strings. */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

const NAME_SIMILARITY_THRESHOLD = 0.82;
const AGE_TOLERANCE_YEARS = 2;

export interface AccusedRow {
  AccusedMasterID: number;
  CaseMasterID: number;
  AccusedName: string;
  AgeYear: number | null;
  GenderID: number | null;
}

/** Confidence in [0,100] that two Accused rows refer to the same real person. */
export function matchConfidence(a: AccusedRow, b: AccusedRow): number {
  if (a.GenderID != null && b.GenderID != null && a.GenderID !== b.GenderID) return 0;

  const sim = nameSimilarity(a.AccusedName, b.AccusedName);
  if (sim < NAME_SIMILARITY_THRESHOLD) return 0;

  let ageScore = 1;
  if (a.AgeYear != null && b.AgeYear != null) {
    const diff = Math.abs(a.AgeYear - b.AgeYear);
    if (diff > AGE_TOLERANCE_YEARS) return 0;
    ageScore = 1 - diff / (AGE_TOLERANCE_YEARS + 1);
  }

  return Math.round(sim * 70 + ageScore * 30);
}

export interface RepeatOffenderGroup {
  representativeName: string;
  members: AccusedRow[];
  caseCount: number;
  districtCount: number;
  districts: string[];
  minConfidence: number;
}

/**
 * Groups Accused rows into fuzzy identity clusters and returns groups spanning
 * more than `minCases` distinct CaseMasterID values (default 3, mirroring the
 * PRD's own example query), with each group's district span for cross-district
 * repeat-offender flagging.
 */
export function findRepeatOffenders(db: Database.Database, opts: { minCases?: number; crimeSubHeadName?: string } = {}): RepeatOffenderGroup[] {
  const minCases = opts.minCases ?? 3;

  const query = opts.crimeSubHeadName
    ? `
      SELECT a.AccusedMasterID, a.CaseMasterID, a.AccusedName, a.AgeYear, a.GenderID
      FROM Accused a
      JOIN CaseMaster c ON a.CaseMasterID = c.CaseMasterID
      JOIN CrimeSubHead csh ON c.CrimeMinorHeadID = csh.CrimeSubHeadID
      WHERE a.AccusedName IS NOT NULL AND a.AccusedName != '' AND csh.CrimeHeadName = ?
    `
    : `
      SELECT AccusedMasterID, CaseMasterID, AccusedName, AgeYear, GenderID
      FROM Accused
      WHERE AccusedName IS NOT NULL AND AccusedName != ''
    `;

  const rows = (opts.crimeSubHeadName
    ? db.prepare(query).all(opts.crimeSubHeadName)
    : db.prepare(query).all()) as AccusedRow[];

  // Union-find clustering by fuzzy match to keep this O(n^2) only within
  // pre-grouped-by-first-letter buckets (fine for demo-scale seeded data).
  const buckets = new Map<string, AccusedRow[]>();
  for (const row of rows) {
    const key = normalizeName(row.AccusedName)[0] || '?';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(row);
  }

  const groups: RepeatOffenderGroup[] = [];

  for (const bucket of buckets.values()) {
    const assigned = new Set<number>();

    for (let i = 0; i < bucket.length; i++) {
      if (assigned.has(bucket[i].AccusedMasterID)) continue;
      const cluster: AccusedRow[] = [bucket[i]];
      assigned.add(bucket[i].AccusedMasterID);

      for (let j = i + 1; j < bucket.length; j++) {
        if (assigned.has(bucket[j].AccusedMasterID)) continue;
        const confidence = matchConfidence(bucket[i], bucket[j]);
        if (confidence >= 60) {
          cluster.push(bucket[j]);
          assigned.add(bucket[j].AccusedMasterID);
        }
      }

      const distinctCases = new Set(cluster.map(c => c.CaseMasterID));
      if (distinctCases.size >= minCases) {
        let minConfidence = 100;
        for (let x = 1; x < cluster.length; x++) {
          minConfidence = Math.min(minConfidence, matchConfidence(cluster[0], cluster[x]));
        }
        groups.push({
          representativeName: cluster[0].AccusedName,
          members: cluster,
          caseCount: distinctCases.size,
          districtCount: 0,
          districts: [],
          minConfidence: cluster.length > 1 ? minConfidence : 100,
        });
      }
    }
  }

  // Resolve district span per group via CaseMaster -> Unit -> District
  const districtStmt = db.prepare(`
    SELECT DISTINCT d.DistrictName
    FROM CaseMaster c
    JOIN Unit u ON c.PoliceStationID = u.UnitID
    JOIN District d ON u.DistrictID = d.DistrictID
    WHERE c.CaseMasterID = ?
  `);

  for (const group of groups) {
    const districts = new Set<string>();
    for (const member of group.members) {
      const rows = districtStmt.all(member.CaseMasterID) as { DistrictName: string }[];
      rows.forEach(r => districts.add(r.DistrictName));
    }
    group.districts = Array.from(districts);
    group.districtCount = districts.size;
  }

  return groups.sort((a, b) => b.districtCount - a.districtCount || b.caseCount - a.caseCount);
}
