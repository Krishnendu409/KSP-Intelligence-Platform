// @ts-nocheck
const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { getMapFIRs, getChoroplethStats, getGeoArcs, getDistrictStats, getDistrictDrillDownStats, getTacticalLocations, getPoliceStations, getSystemSummary } = require('./services/network.service');
const { getCaseDetails, getCaseTimeline } = require('./services/case.service');
const { searchCases } = require('./services/SearchService');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();

const dbPath = path.resolve(__dirname, '../../../../frontend/data/fir_system.sqlite');
const db = new Database(dbPath, { readonly: false });

app.use(express.json({ limit: '10mb' })); 

// GET /api/firs - Fetch geospatial incident data
app.get('/api/firs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 500;
        const page = parseInt(req.query.page as string) || 1;
        const offset = (page - 1) * limit;
        const firs = getMapFIRs(db, limit, offset);
        res.status(200).json(firs);
    } catch (err) {
        console.error("Failed to fetch FIRs:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/firs/stats - Fetch lightweight coordinates for Choropleth
app.get('/api/firs/stats', async (req, res) => {
    try {
        const stats = getChoroplethStats(db);
        res.status(200).json(stats);
    } catch (err) {
        console.error("Failed to fetch FIR stats:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/firs/summary - Fetch system wide KPIs
app.get('/api/firs/summary', async (req, res) => {
    try {
        const stats = getSystemSummary(db);
        res.status(200).json(stats);
    } catch (err) {
        console.error("Failed to fetch FIR summary:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/districts/stats - Fetch aggregated stats per district for the heatmap
app.get('/api/districts/stats', async (req, res) => {
    try {
        const stats = getDistrictStats(db, 50);
        res.status(200).json(stats);
    } catch (err) {
        console.error("Failed to fetch district stats:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/districts/:districtId/stats - Fetch specific stats for district drilldown
app.get('/api/districts/:districtId/stats', async (req, res) => {
    try {
        const stats = getDistrictDrillDownStats(db, req.params.districtId);
        res.status(200).json(stats);
    } catch (err) {
        console.error(`Failed to fetch stats for district ${req.params.districtId}:`, err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/network/geo-arcs - Fetch related geo connections
app.get('/api/network/geo-arcs', async (req, res) => {
    try {
        const arcs = getGeoArcs(db, 200);
        res.status(200).json(arcs);
    } catch (err) {
        console.error("Failed to fetch geo arcs:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/entities/locations - Fetch tactical map locations
app.get('/api/entities/locations', async (req, res) => {
    try {
        const locations = getTacticalLocations(db, 1000);
        res.status(200).json(locations);
    } catch (err) {
        console.error("Failed to fetch tactical locations:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/police-stations - Fetch tactical map police stations
app.get('/api/police-stations', async (req, res) => {
    try {
        const stations = getPoliceStations(db);
        res.status(200).json(stations);
    } catch (err) {
        console.error("Failed to fetch police stations:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cases/:caseId - Fetch full intelligence dossier for case
app.get('/api/cases/:caseId', async (req, res) => {
    try {
        const caseMasterId = req.params.caseId.replace('CASE-', '');
        const details = getCaseDetails(db, caseMasterId);
        if (!details) return res.status(404).json({ error: "Case not found" });
        res.status(200).json(details);
    } catch (err) {
        console.error("Failed to fetch case details:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cases/:caseId/timeline - Fetch actionable timeline events
app.get('/api/cases/:caseId/timeline', async (req, res) => {
    try {
        const caseMasterId = req.params.caseId.replace('CASE-', '');
        const timeline = getCaseTimeline(db, caseMasterId);
        res.status(200).json(timeline);
    } catch (err) {
        console.error("Failed to fetch timeline:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/entities/:entityId/relationships - Fetch relationships for a case
app.get('/api/entities/:entityId/relationships', async (req, res) => {
    try {
        const { SQLiteRelationshipRepository } = require('./repositories/SQLiteRelationshipRepository');
        const { SQLiteEntityRepository } = require('./repositories/SQLiteEntityRepository');
        const { RelationshipService } = require('./services/RelationshipService');

        const relRepo = new SQLiteRelationshipRepository(db);
        const entityRepo = new SQLiteEntityRepository(db);
        // Mock Provenance Repository as it's not strictly needed for basic graphs
        const provRepo = {
            findById: () => undefined,
            findByEntityId: () => [],
            create: () => ({}),
            delete: () => false
        };

        const relationshipService = new RelationshipService(relRepo, provRepo, entityRepo);

        const entityId = req.params.entityId;
        const rels = await relationshipService.getCytoscapeGraph(entityId);
        res.status(200).json(rels);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/entities/:type/:id - Fetch profile for an entity
app.get('/api/entities/:type/:id', async (req, res) => {
    try {
        // Need to require or import getEntityProfile at top, but we'll inline require it here if needed or add import
        const { getEntityProfile } = require('./services/entity.service');
        const profile = getEntityProfile(db, req.params.type, req.params.id);
        if (!profile) return res.status(404).json({ error: 'Entity not found' });
        res.status(200).json(profile);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/intake - Insert a new FIR
app.post('/api/intake', express.json(), async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Missing text" });

        // Extremely simple mock NLP extraction
        const isHeinous = text.toLowerCase().includes('murder') || text.toLowerCase().includes('robbery') || text.toLowerCase().includes('weapon');
        const caseNo = Math.floor(Math.random() * 90000) + 10000;
        const crimeNo = `1044${caseNo}2026${Math.floor(Math.random() * 9999)}`;
        const lat = 12.9716 + (Math.random() - 0.5) * 0.1;
        const lng = 77.5946 + (Math.random() - 0.5) * 0.1;

        // Insert into CaseMaster
        const insertCase = db.prepare(`
            INSERT INTO CaseMaster (
                CrimeNo, CaseNo, BriefFacts, latitude, longitude, 
                CrimeRegisteredDate, PoliceStationID, GravityOffenceID, CaseStatusID
            ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)
        `);
        
        const info = insertCase.run(
            crimeNo, caseNo.toString(), text, lat, lng,
            305, // Hardcoded to some valid station ID
            isHeinous ? 1 : 2, 
            1 // Status 1 = Registered
        );

        const newCaseId = info.lastInsertRowid;

        // Extract potential names
        const words = text.split(/\s+/);
        const stopWords = ['The', 'A', 'An', 'In', 'At', 'On', 'Person', 'Someone', 'Man', 'Woman', 'He', 'She', 'They'];
        const capitalizedWords = words.filter(w => /^[A-Z][a-z]+$/.test(w) && !stopWords.includes(w));
        
        const accusedName = capitalizedWords.length > 0 ? capitalizedWords[0] : 'Unknown Suspect';
        const victimName = capitalizedWords.length > 1 ? capitalizedWords[1] : 'Unknown Victim';

        db.prepare('INSERT INTO Accused (CaseMasterID, AccusedName, PersonID, GenderID) VALUES (?, ?, ?, 1)')
          .run(newCaseId, accusedName, `A${newCaseId}`);
        
        db.prepare('INSERT INTO Victim (CaseMasterID, VictimName, GenderID) VALUES (?, ?, 1)')
          .run(newCaseId, victimName);

        res.json({ success: true, caseId: newCaseId, crimeNo });
    } catch (err) {
        console.error("Intake Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/search/cases - Search across FTS5 index
app.get('/api/search/cases', async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });
        const limit = parseInt(req.query.limit as string) || 20;
        const results = searchCases(db, query, limit);
        res.status(200).json(results);
    } catch (err) {
        console.error("Failed to search cases:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/copilot - AI intelligence retrieval
app.post('/api/copilot', async (req, res) => {
    res.status(501).json({ reply: "Not Implemented Yet" });
});

module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
