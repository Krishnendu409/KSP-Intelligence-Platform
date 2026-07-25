import type Database from 'better-sqlite3';
import { jurisdictionClause } from '../auth/jurisdictionSql';
import type { JurisdictionFilter } from '../auth/types';

/**
 * Real trend and anomaly computation (PRD §7.6/§10) — replaces the previously
 * hardcoded "+12%" placeholder. Every number here is derived from an actual
 * COUNT(CaseMasterID) query; there is no simulated or invented statistic.
 */

export interface DistrictTrend {
  currentPeriodCount: number;
  priorPeriodCount: number;
  percentChange: number | null; // null when there's no prior-period baseline to compare against
  windowDays: number;
}

export function getDistrictTrend(db: Database.Database, districtNameOrId: string, windowDays = 30): DistrictTrend {
  const row = db.prepare(`
    SELECT
      SUM(CASE WHEN julianday('now') - julianday(c.CrimeRegisteredDate) <= ? THEN 1 ELSE 0 END) as currentPeriod,
      SUM(CASE WHEN julianday('now') - julianday(c.CrimeRegisteredDate) > ? AND julianday('now') - julianday(c.CrimeRegisteredDate) <= ? THEN 1 ELSE 0 END) as priorPeriod
    FROM CaseMaster c
    JOIN Unit u ON c.PoliceStationID = u.UnitID
    JOIN District d ON u.DistrictID = d.DistrictID
    WHERE (d.DistrictName = ? OR d.DistrictID = ?) AND c.CrimeRegisteredDate IS NOT NULL
  `).get(windowDays, windowDays, windowDays * 2, districtNameOrId, districtNameOrId) as { currentPeriod: number; priorPeriod: number };

  const currentPeriodCount = row?.currentPeriod ?? 0;
  const priorPeriodCount = row?.priorPeriod ?? 0;

  const percentChange = priorPeriodCount > 0
    ? Math.round(((currentPeriodCount - priorPeriodCount) / priorPeriodCount) * 1000) / 10
    : null;

  return { currentPeriodCount, priorPeriodCount, percentChange, windowDays };
}

export interface AnomalyAlert {
  districtName: string;
  crimeSubHeadName: string;
  weekStart: string;
  count: number;
  meanTrailing: number;
  stdDevTrailing: number;
  zScore: number;
  reason: string;
}

/**
 * Weekly COUNT(CaseMasterID) per District+CrimeSubHead, flagged when the most
 * recent complete week's count is more than 2 standard deviations above the
 * trailing mean of the preceding `lookbackWeeks` weeks. Method and threshold
 * are fixed and disclosed (PRD requires no black-box "AI predicted" labels).
 */
export function getAnomalyAlerts(
  db: Database.Database, 
  lookbackWeeks = 8, 
  jurisdiction?: JurisdictionFilter | null
): AnomalyAlert[] {
  const { clause, params } = jurisdictionClause(jurisdiction, 'u');

  const rows = db.prepare(`
    SELECT
      d.DistrictName as districtName,
      csh.CrimeHeadName as crimeSubHeadName,
      strftime('%Y-%W', c.CrimeRegisteredDate) as yearWeek,
      MIN(date(c.CrimeRegisteredDate, 'weekday 0', '-6 days')) as weekStart,
      COUNT(*) as count
    FROM CaseMaster c
    JOIN Unit u ON c.PoliceStationID = u.UnitID
    JOIN District d ON u.DistrictID = d.DistrictID
    JOIN CrimeSubHead csh ON c.CrimeMinorHeadID = csh.CrimeSubHeadID
    WHERE c.CrimeRegisteredDate IS NOT NULL
    ${clause}
    GROUP BY d.DistrictID, csh.CrimeSubHeadID, yearWeek
    ORDER BY d.DistrictID, csh.CrimeSubHeadID, yearWeek
  `).all(...params) as { districtName: string; crimeSubHeadName: string; yearWeek: string; weekStart: string; count: number }[];

  const series = new Map<string, { districtName: string; crimeSubHeadName: string; points: { weekStart: string; count: number }[] }>();
  for (const row of rows) {
    const key = `${row.districtName}::${row.crimeSubHeadName}`;
    if (!series.has(key)) series.set(key, { districtName: row.districtName, crimeSubHeadName: row.crimeSubHeadName, points: [] });
    series.get(key)!.points.push({ weekStart: row.weekStart, count: row.count });
  }

  const alerts: AnomalyAlert[] = [];

  for (const { districtName, crimeSubHeadName, points } of series.values()) {
    if (points.length < 3) continue; // not enough history for a meaningful baseline

    const latest = points[points.length - 1];
    const trailing = points.slice(Math.max(0, points.length - 1 - lookbackWeeks), points.length - 1);
    if (trailing.length < 2) continue;

    const mean = trailing.reduce((s, p) => s + p.count, 0) / trailing.length;
    const variance = trailing.reduce((s, p) => s + (p.count - mean) ** 2, 0) / trailing.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) continue;

    const z = (latest.count - mean) / stdDev;
    if (Math.abs(z) > 2) {
      alerts.push({
        districtName,
        crimeSubHeadName,
        weekStart: latest.weekStart,
        count: latest.count,
        meanTrailing: Math.round(mean * 10) / 10,
        stdDevTrailing: Math.round(stdDev * 10) / 10,
        zScore: Math.round(z * 100) / 100,
        reason: `${latest.count} cases vs an ${lookbackWeeks}-week trailing average of ${Math.round(mean * 10) / 10} (${z >= 0 ? '+' : ''}${Math.round(z * 100) / 100}σ)`,
      });
    }
  }

  return alerts.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
}
