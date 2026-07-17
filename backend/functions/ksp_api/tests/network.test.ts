import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { getMapFIRs, getDistrictStats, getDistrictDrillDownStats, getTacticalLocations, getPoliceStations } from '../src/services/network.service';

describe('Network Service', () => {
    let db;

    beforeAll(() => {
        // Connect to the actual test database
        const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');
        db = new Database(dbPath);
    });

    afterAll(() => {
        if(db) db.close();
    });

    it('getMapFIRs should return basic case info with coordinates', () => {
        const firs = getMapFIRs(db, 10);
        expect(firs.length).toBeLessThanOrEqual(10);
        expect(firs[0]).toHaveProperty('CaseMasterID');
        expect(firs[0]).toHaveProperty('CrimeNo');
        expect(firs[0]).toHaveProperty('latitude');
        expect(firs[0]).toHaveProperty('longitude');
        expect(firs[0]).toHaveProperty('CaseStatusID');
    });



    it('getDistrictStats should return aggregated crime stats per district/unit', () => {
        const stats = getDistrictStats(db, 50);
        
        expect(Array.isArray(stats)).toBe(true);
        expect(stats.length).toBeGreaterThan(0);
        
        const firstStat = stats[0];
        expect(firstStat).toHaveProperty('divisionName');
        expect(firstStat).toHaveProperty('crimeCount');
        expect(firstStat).toHaveProperty('heinousCount');
        expect(firstStat).toHaveProperty('centerLat');
        expect(firstStat).toHaveProperty('centerLng');
        
        // Ensure crimeCount is aggregated correctly
        expect(firstStat.crimeCount).toBeGreaterThan(0);
    });

    it('getDistrictDrillDownStats should return specific stats for a district', () => {
        const stats = getDistrictDrillDownStats(db, 'Bengaluru Urban');
        
        expect(stats).toHaveProperty('totalCrimes');
        expect(stats).toHaveProperty('heinousCount');
        expect(stats).toHaveProperty('nonHeinousCount');
        expect(stats).toHaveProperty('trend');
        expect(stats).toHaveProperty('topCrimes');
        expect(Array.isArray(stats.topCrimes)).toBe(true);
    });

    it('getTacticalLocations should return map markers for FIRs', () => {
        const locations = getTacticalLocations(db, 10);
        
        expect(Array.isArray(locations)).toBe(true);
        if (locations.length > 0) {
            expect(locations[0]).toHaveProperty('id');
            expect(locations[0]).toHaveProperty('category');
            expect(locations[0]).toHaveProperty('title');
            expect(locations[0]).toHaveProperty('latitude');
            expect(locations[0]).toHaveProperty('longitude');
            expect(locations[0]).toHaveProperty('threatLevel');
        }
    });

    it('getPoliceStations should return aggregated PS locations', () => {
        const stations = getPoliceStations(db);
        
        expect(Array.isArray(stations)).toBe(true);
        if (stations.length > 0) {
            expect(stations[0]).toHaveProperty('id');
            expect(stations[0]).toHaveProperty('name');
            expect(stations[0]).toHaveProperty('jurisdiction');
            expect(stations[0]).toHaveProperty('latitude');
            expect(stations[0]).toHaveProperty('longitude');
        }
    });
});
