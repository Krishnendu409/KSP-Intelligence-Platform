import Database from 'better-sqlite3';
import { getDistrictTrend } from './trend.service';
import { jurisdictionClause } from '../auth/jurisdictionSql';
import type { JurisdictionFilter } from '../auth/types';

export function getMapFIRs(db: any, limit: number = 500, offset: number = 0, jurisdiction?: JurisdictionFilter | null) {
    const { clause, params } = jurisdictionClause(jurisdiction);
    const query = `
        SELECT c.CaseMasterID, c.CrimeNo, c.latitude, c.longitude, c.CaseStatusID,
               c.BriefFacts, c.GravityOffenceID, u.UnitName as PoliceStationName
        FROM CaseMaster c
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        WHERE 1=1 ${clause}
        LIMIT ? OFFSET ?
    `;
    return db.prepare(query).all(...params, limit, offset);
}

export function getChoroplethStats(db: Database.Database, jurisdiction?: JurisdictionFilter | null) {
    // Instead of doing point in polygon in SQL (which SQLite lacks native support for without SpatiaLite),
    // and instead of sending 5000 points to the frontend, we can fetch all points, do the point in polygon
    // HERE on the backend, and just return the 8 aggregated district counts!
    // But since we need the ray-casting algorithm, let's just return a slimmed down array of coordinates
    // OR we can implement the raycasting here.
    // Wait, the simplest backend aggregation is to just group by PoliceStationID / UnitID if they map to districts!
    // But since the frontend uses custom polygons, let's just fetch all coordinates + gravity IDs and return them
    // as a super lightweight array so the frontend can still do the raycasting but WITHOUT the massive JSON overhead
    // of BriefFacts, CrimeNo, etc.
    const { clause, params } = jurisdictionClause(jurisdiction);
    const query = `
        SELECT c.CaseMasterID, c.latitude, c.longitude, c.GravityOffenceID, c.CrimeRegisteredDate, c.CrimeNo
        FROM CaseMaster c
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL ${clause}
    `;
    return db.prepare(query).all(...params);
}

export function getDistrictStats(db: Database.Database, limit: number = 50, jurisdiction?: JurisdictionFilter | null) {
    const { clause, params } = jurisdictionClause(jurisdiction);
    const query = `
        SELECT
            COALESCE(d.DistrictName, 'Unknown District') as divisionName,
            COUNT(c.CaseMasterID) as crimeCount,
            SUM(CASE WHEN c.GravityOffenceID = 1 THEN 1 ELSE 0 END) as heinousCount,
            AVG(c.latitude) as centerLat,
            AVG(c.longitude) as centerLng
        FROM CaseMaster c
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        LEFT JOIN District d ON u.DistrictID = d.DistrictID
        WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL ${clause}
        GROUP BY d.DistrictID
        ORDER BY crimeCount DESC
        LIMIT ?
    `;
    return db.prepare(query).all(...params, limit);
}

export function getDistrictDrillDownStats(db: Database.Database, districtName: string) {
    // We match on either the canonical districtName or the legacy districtCode from GeoJSON just in case
    const statsQuery = `
        SELECT
            COUNT(c.CaseMasterID) as totalCrimes,
            SUM(CASE WHEN c.GravityOffenceID = 1 THEN 1 ELSE 0 END) as heinousCount,
            SUM(CASE WHEN c.GravityOffenceID != 1 THEN 1 ELSE 0 END) as nonHeinousCount
        FROM CaseMaster c
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        LEFT JOIN District d ON u.DistrictID = d.DistrictID
        WHERE d.DistrictName = ? OR d.DistrictID = ?
    `;
    const stats = db.prepare(statsQuery).get(districtName, districtName) as {totalCrimes: number, heinousCount: number, nonHeinousCount: number};

    // Fallback if no data
    if (!stats || stats.totalCrimes === 0) {
        return {
            totalCrimes: 0,
            heinousCount: 0,
            nonHeinousCount: 0,
            trend: '0%',
            topCrimes: []
        };
    }

    const topCrimesQuery = `
        SELECT
            ch.CrimeGroupName as type,
            COUNT(c.CaseMasterID) as count
        FROM CaseMaster c
        JOIN CrimeHead ch ON c.CrimeMajorHeadID = ch.CrimeHeadID
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        LEFT JOIN District d ON u.DistrictID = d.DistrictID
        WHERE (d.DistrictName = ? OR d.DistrictID = ?) AND ch.CrimeGroupName IS NOT NULL
        GROUP BY ch.CrimeHeadID
        ORDER BY count DESC
        LIMIT 5
    `;
    const topCrimes = db.prepare(topCrimesQuery).all(districtName, districtName) as {type: string, count: number}[];

    const trend = getDistrictTrend(db, districtName, 30);
    const trendLabel = trend.percentChange === null
        ? 'No prior-period data'
        : `${trend.percentChange >= 0 ? '+' : ''}${trend.percentChange}%`;

    return {
        totalCrimes: stats.totalCrimes || 0,
        heinousCount: stats.heinousCount || 0,
        nonHeinousCount: stats.nonHeinousCount || 0,
        trend: trendLabel,
        trendDetail: trend,
        topCrimes
    };
}

export function getGeoArcs(db: Database.Database, limit: number = 200, jurisdiction?: JurisdictionFilter | null) {
    // Find pairs of cases that share an accused name and have geo-coordinates
    // Since accused names might not be 100% clean, we just do a basic join
    const c1 = jurisdictionClause(jurisdiction, 'u1');
    const c2 = jurisdictionClause(jurisdiction, 'u2');
    const query = `
        SELECT
            c1.CaseMasterID as sourceId,
            c1.CrimeNo as sourceLabel,
            c1.latitude as sourceLat,
            c1.longitude as sourceLng,
            c2.CaseMasterID as targetId,
            c2.CrimeNo as targetLabel,
            c2.latitude as targetLat,
            c2.longitude as targetLng,
            a1.AccusedName as linkLabel
        FROM Accused a1
        JOIN CaseMaster c1 ON a1.CaseMasterID = c1.CaseMasterID
        LEFT JOIN Unit u1 ON c1.PoliceStationID = u1.UnitID
        JOIN Accused a2 ON a1.AccusedName = a2.AccusedName AND a1.CaseMasterID < a2.CaseMasterID
        JOIN CaseMaster c2 ON a2.CaseMasterID = c2.CaseMasterID
        LEFT JOIN Unit u2 ON c2.PoliceStationID = u2.UnitID
        WHERE c1.latitude IS NOT NULL AND c1.longitude IS NOT NULL
          AND c2.latitude IS NOT NULL AND c2.longitude IS NOT NULL
          AND a1.AccusedName != 'Unknown' AND a1.AccusedName != ''
          ${c1.clause} ${c2.clause}
        LIMIT ?
    `;

    const links = db.prepare(query).all(...c1.params, ...c2.params, limit) as any[];

    return links.map((link, idx) => ({
        id: `arc-${idx}`,
        sourceId: `CASE-${link.sourceId}`,
        targetId: `CASE-${link.targetId}`,
        sourceLabel: `${link.sourceLabel} (${link.sourceLat.toFixed(3)}, ${link.sourceLng.toFixed(3)})`,
        targetLabel: `${link.targetLabel} (${link.targetLat.toFixed(3)}, ${link.targetLng.toFixed(3)})`,
        sourceLat: link.sourceLat,
        sourceLng: link.sourceLng,
        targetLat: link.targetLat,
        targetLng: link.targetLng,
        relationshipType: 'CO_ACCUSED_LINK',
        severity: 'HIGH',
        sharedEntity: link.linkLabel
    }));
}

export function getTacticalLocations(db: Database.Database, limit: number = 1000, jurisdiction?: JurisdictionFilter | null) {
    const { clause, params } = jurisdictionClause(jurisdiction);
    const query = `
        SELECT
            'CASE-' || c.CaseMasterID as id,
            'CASE-' || c.CaseMasterID as entityId,
            'CASE-' || c.CaseMasterID as caseId,
            'FIR_INCIDENT' as category,
            'Crime No: ' || c.CrimeNo as title,
            SUBSTR(c.BriefFacts, 1, 100) || '...' as subtitle,
            CASE WHEN c.GravityOffenceID = 1 THEN 'CRITICAL' ELSE 'MEDIUM' END as threatLevel,
            c.latitude,
            c.longitude,
            'Active Case' as details,
            c.CrimeRegisteredDate as timestamp
        FROM CaseMaster c
        LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
        WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL ${clause}
        ORDER BY c.CrimeRegisteredDate DESC
        LIMIT ?
    `;
    return db.prepare(query).all(...params, limit);
}

export function getPoliceStations(db: Database.Database, jurisdiction?: JurisdictionFilter | null) {
    // Since Unit table doesn't have exact lat/lngs, we derive them from the average location of their registered FIRs
    const { clause, params } = jurisdictionClause(jurisdiction);
    const query = `
        SELECT
            'PS-' || u.UnitID as id,
            u.UnitName as name,
            d.DistrictName || ' District' as jurisdiction,
            AVG(c.latitude) as latitude,
            AVG(c.longitude) as longitude,
            'Local Station' as contact
        FROM Unit u
        JOIN CaseMaster c ON u.UnitID = c.PoliceStationID
        LEFT JOIN District d ON u.DistrictID = d.DistrictID
        WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL ${clause}
        GROUP BY u.UnitID
        HAVING COUNT(c.CaseMasterID) > 0
    `;
    return db.prepare(query).all(...params);
}

export function getSystemSummary(db: Database.Database, jurisdiction?: JurisdictionFilter | null) {
    const { clause, params } = jurisdictionClause(jurisdiction);
    const joinAndWhere = `LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID WHERE 1=1 ${clause}`;

    const cases = db.prepare(`SELECT COUNT(*) as cnt FROM CaseMaster c ${joinAndWhere}`).get(...params) as {cnt: number};
    const heinous = db.prepare(`SELECT COUNT(*) as cnt FROM CaseMaster c ${joinAndWhere} AND c.GravityOffenceID = 1`).get(...params) as {cnt: number};
    const suspects = jurisdiction
        ? db.prepare(`SELECT COUNT(DISTINCT a.AccusedMasterID) as cnt FROM Accused a JOIN CaseMaster c ON a.CaseMasterID = c.CaseMasterID ${joinAndWhere}`).get(...params) as {cnt: number}
        : db.prepare('SELECT COUNT(DISTINCT AccusedMasterID) as cnt FROM Accused').get() as {cnt: number};
    const victims = jurisdiction
        ? db.prepare(`SELECT COUNT(DISTINCT v.VictimMasterID) as cnt FROM Victim v JOIN CaseMaster c ON v.CaseMasterID = c.CaseMasterID ${joinAndWhere}`).get(...params) as {cnt: number}
        : db.prepare('SELECT COUNT(DISTINCT VictimMasterID) as cnt FROM Victim').get() as {cnt: number};

    return {
        totalCases: cases.cnt,
        heinousCases: heinous.cnt,
        suspectsTracked: suspects.cnt,
        victimsRegistered: victims.cnt
    };
}
