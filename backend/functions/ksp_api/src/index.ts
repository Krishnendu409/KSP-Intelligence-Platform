import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { runMigrations } from './db/migrate';
import { authenticate, requireAuth, requireRole, scopeJurisdiction, auditLogger } from './auth/middleware';
import { matchesJurisdiction } from './auth/jurisdictionSql';
import { signToken } from './auth/jwt';
import { verifyPassword } from './auth/password';
import { getAuditLogs } from './services/audit.service';
import { getIntakeLookups, getSectionsForAct } from './services/lookup.service';
import { createCase, IntakeValidationError } from './services/intake.service';
import { answerQuestion } from './services/copilot.service';
import { getAnomalyAlerts } from './services/trend.service';
import { findRepeatOffenders } from './services/identity.service';
import {
  getMapFIRs, getChoroplethStats, getGeoArcs, getDistrictStats,
  getDistrictDrillDownStats, getTacticalLocations, getPoliceStations, getSystemSummary,
} from './services/network.service';
import { setupIngestionRoutes } from './routes/ingestion.routes';
import { catalystAdapter } from './services/catalyst.adapter';

const { getCaseDetails, getCaseTimeline } = require('./services/case.service');
const { searchCases } = require('./services/SearchService');

const app = express();

app.use((req, _res, next) => {
  if (req.url.startsWith('/server/ksp_api')) {
    req.url = req.url.replace('/server/ksp_api', '') || '/';
  }
  next();
});

const db = new Database(env.DB_PATH, { readonly: false });
runMigrations(db);

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: ['text/*', 'application/csv'] }));
app.use(express.raw({ limit: '50mb', type: 'application/pdf' }));
app.use(auditLogger(db));
app.use(authenticate);

// ---------------------------------------------------------------------------
// Auth & System Status (login & Catalyst diagnostics are public)
// ---------------------------------------------------------------------------

app.get('/api/system/catalyst', (req, res) => {
  res.json({
    status: 'operational',
    platform: 'Zoho Catalyst Advanced I/O Serverless Engine',
    metadata: catalystAdapter.getRuntimeMetadata(),
    capabilities: [
      'Catalyst Serverless Functions (Node.js 20)',
      'Catalyst Data Store / Hybrid SQLite FTS5 Relational Engine',
      'Catalyst Stratus Evidentiary Vault (PDF & Scanned Handwritten FIRs)',
      'Catalyst Zia Services & Deterministic AI Copilot Engine',
      'Role-Based Cryptographic Territory Scoping & Immutable Audit Trail'
    ],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = db.prepare(`SELECT * FROM Users WHERE Username = ? AND IsActive = 1`).get(username) as any;
  if (!user || !verifyPassword(password, user.PasswordHash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const employee = db.prepare(`SELECT UnitID, DistrictID FROM Employee WHERE EmployeeID = ?`).get(user.EmployeeID) as any;

  const token = signToken({
    userId: user.UserID,
    username: user.Username,
    role: user.Role,
    employeeId: user.EmployeeID,
    unitId: employee?.UnitID ?? null,
    districtId: employee?.DistrictID ?? null,
  });

  db.prepare(`UPDATE Users SET LastLoginAt = datetime('now') WHERE UserID = ?`).run(user.UserID);
  res.json({ token, role: user.Role });
});

app.use(requireAuth);

app.get('/api/auth/me', (req, res) => {
  const row = db.prepare(`
    SELECT u.Username, u.Role, e.FirstName, e.EmployeeID, r.RankName, dz.DesignationName,
           unit.UnitName, unit.UnitID, dist.DistrictName, dist.DistrictID
    FROM Users u
    JOIN Employee e ON u.EmployeeID = e.EmployeeID
    LEFT JOIN Rank r ON e.RankID = r.RankID
    LEFT JOIN Designation dz ON e.DesignationID = dz.DesignationID
    LEFT JOIN Unit unit ON e.UnitID = unit.UnitID
    LEFT JOIN District dist ON e.DistrictID = dist.DistrictID
    WHERE u.UserID = ?
  `).get(req.user!.userId) as any;

  if (!row) return res.status(404).json({ error: 'User not found' });

  res.json({
    username: row.Username,
    role: row.Role,
    employee: {
      firstName: row.FirstName,
      rank: row.RankName,
      designation: row.DesignationName,
      unitName: row.UnitName,
      unitId: row.UnitID,
      districtName: row.DistrictName,
      districtId: row.DistrictID,
    },
  });
});

// ---------------------------------------------------------------------------
// Lookups (real dropdown data for the intake form — no hardcoded frontend arrays)
// ---------------------------------------------------------------------------

app.get('/api/lookups', (req, res) => {
  try {
    res.json(getIntakeLookups(db));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lookups/sections/:actCode', (req, res) => {
  try {
    res.json(getSectionsForAct(db, req.params.actCode));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// FIR / map / district data — jurisdiction-scoped per PRD §13.1
// ---------------------------------------------------------------------------

app.get('/api/firs', scopeJurisdiction(['CaseMaster', 'Unit']), (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 500;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;
    res.status(200).json(getMapFIRs(db, limit, offset, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to fetch FIRs:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/firs/stats', scopeJurisdiction(['CaseMaster']), (req, res) => {
  try {
    res.status(200).json(getChoroplethStats(db, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to fetch FIR stats:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/firs/summary', scopeJurisdiction(['CaseMaster', 'Accused', 'Victim']), (req, res) => {
  try {
    res.status(200).json(getSystemSummary(db, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to fetch FIR summary:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/districts/stats', scopeJurisdiction(['CaseMaster', 'District']), (req, res) => {
  try {
    res.status(200).json(getDistrictStats(db, 50, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to fetch district stats:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/districts/:districtId/stats', scopeJurisdiction(['CaseMaster', 'District']), (req, res) => {
  try {
    const jurisdiction = req.jurisdiction;
    if (jurisdiction) {
      const callerDistrictId = jurisdiction.level === 'district' ? jurisdiction.districtId : req.user!.districtId;
      const district = db.prepare(`SELECT DistrictID FROM District WHERE DistrictName = ? OR DistrictID = ?`)
        .get(String(req.params.districtId), String(req.params.districtId)) as { DistrictID: number } | undefined;
      if (!district || district.DistrictID !== callerDistrictId) {
        return res.status(403).json({ error: 'Forbidden: district is outside your jurisdiction' });
      }
    }
    res.status(200).json(getDistrictDrillDownStats(db, String(req.params.districtId)));
  } catch (err: any) {
    console.error(`Failed to fetch stats for district ${req.params.districtId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/network/geo-arcs', scopeJurisdiction(['Accused', 'CaseMaster']), (req, res) => {
  try {
    res.status(200).json(getGeoArcs(db, 200, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to fetch geo arcs:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/entities/locations', scopeJurisdiction(['CaseMaster']), (req, res) => {
  try {
    res.status(200).json(getTacticalLocations(db, 1000, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to fetch tactical locations:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/police-stations', scopeJurisdiction(['Unit', 'CaseMaster']), (req, res) => {
  try {
    res.status(200).json(getPoliceStations(db, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to fetch police stations:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Case detail / timeline — jurisdiction enforced via post-fetch ownership check
// ---------------------------------------------------------------------------

app.get('/api/cases/:caseId', scopeJurisdiction(['CaseMaster']), (req, res) => {
  try {
    const caseMasterId = String(req.params.caseId).replace('CASE-', '');
    const details = getCaseDetails(db, caseMasterId);
    if (!details) return res.status(404).json({ error: 'Case not found' });
    if (!matchesJurisdiction(req.jurisdiction, { unitId: details.ResolvedUnitID, districtId: details.ResolvedDistrictID })) {
      return res.status(403).json({ error: 'Forbidden: this case is outside your jurisdiction' });
    }
    res.status(200).json(details);
  } catch (err: any) {
    console.error('Failed to fetch case details:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases/:caseId/timeline', scopeJurisdiction(['CaseMaster']), (req, res) => {
  try {
    const caseMasterId = String(req.params.caseId).replace('CASE-', '');
    const details = getCaseDetails(db, caseMasterId);
    if (!details) return res.status(404).json({ error: 'Case not found' });
    if (!matchesJurisdiction(req.jurisdiction, { unitId: details.ResolvedUnitID, districtId: details.ResolvedDistrictID })) {
      return res.status(403).json({ error: 'Forbidden: this case is outside your jurisdiction' });
    }
    res.status(200).json(getCaseTimeline(db, caseMasterId));
  } catch (err: any) {
    console.error('Failed to fetch timeline:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Entity / relationship graph
// ---------------------------------------------------------------------------

app.get('/api/entities/:entityId/relationships', (req, res) => {
  try {
    const { SQLiteRelationshipRepository } = require('./repositories/SQLiteRelationshipRepository');
    const { SQLiteEntityRepository } = require('./repositories/SQLiteEntityRepository');
    const { RelationshipService } = require('./services/RelationshipService');
    const { ProvenanceRepository } = require('./repositories/ProvenanceRepository');

    const relRepo = new SQLiteRelationshipRepository(db);
    const entityRepo = new SQLiteEntityRepository(db);
    const provRepo = new ProvenanceRepository();

    const relationshipService = new RelationshipService(relRepo, provRepo, entityRepo);
    relationshipService.getCytoscapeGraph(req.params.entityId).then((rels: unknown) => {
      res.status(200).json(rels);
    }).catch((e: any) => {
      console.error(e);
      res.status(500).json({ error: e.message });
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/entities/:sourceId/path/:targetId', (req, res) => {
  try {
    const { SQLiteRelationshipRepository } = require('./repositories/SQLiteRelationshipRepository');
    const { SQLiteEntityRepository } = require('./repositories/SQLiteEntityRepository');
    const { RelationshipService } = require('./services/RelationshipService');
    const { ProvenanceRepository } = require('./repositories/ProvenanceRepository');

    const relRepo = new SQLiteRelationshipRepository(db);
    const entityRepo = new SQLiteEntityRepository(db);
    const provRepo = new ProvenanceRepository();

    const relationshipService = new RelationshipService(relRepo, provRepo, entityRepo);
    relationshipService.findShortestPath(req.params.sourceId, req.params.targetId).then((result: unknown) => {
      res.status(200).json(result);
    }).catch((e: any) => {
      console.error(e);
      res.status(500).json({ error: e.message });
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/entities/:type/:id', (req, res) => {
  try {
    const { getEntityProfile } = require('./services/entity.service');
    const profile = getEntityProfile(db, req.params.type, req.params.id);
    if (!profile) return res.status(404).json({ error: 'Entity not found' });
    res.status(200).json(profile);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/entities/:type/:id/notes', (req, res) => {
  try {
    const { getEntityNotes } = require('./services/entity_notes.service');
    res.json(getEntityNotes(db, req.params.type, req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/entities/:type/:id/notes', (req, res) => {
  try {
    const { addEntityNote } = require('./services/entity_notes.service');
    const author = req.user ? `${req.user.role}.${req.user.username}` : 'INVESTIGATOR';
    const result = addEntityNote(db, {
      entityType: req.params.type,
      entityId: req.params.id,
      author,
      text: req.body.text || '',
      noteType: req.body.noteType || 'NOTE',
    });
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/cases/:caseId/documents', (req, res) => {
  try {
    const { getCaseDocuments } = require('./services/case_documents.service');
    const caseId = String(req.params.caseId).replace(/^CASE-/i, '');
    res.json(getCaseDocuments(db, caseId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/cases/:caseId/documents', (req, res) => {
  try {
    const { saveCaseDocument } = require('./services/case_documents.service');
    const author = req.user ? `${req.user.role}.${req.user.username}` : 'INVESTING OFFICER';
    const caseId = String(req.params.caseId).replace(/^CASE-/i, '');
    const doc = saveCaseDocument(db, {
      caseMasterId: caseId,
      documentTitle: req.body.documentTitle || 'Untitled Evidence',
      documentType: req.body.documentType || 'CASE_DOCUMENT',
      content: req.body.content || '',
      uploadedBy: author,
      fileSize: req.body.fileSize || 0
    });
    res.status(201).json({ success: true, document: doc });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// Intake — real structured FIR registration, deterministic case numbering
// ---------------------------------------------------------------------------

app.post('/api/intake', (req, res) => {
  try {
    if (!req.user!.unitId || !req.user!.districtId) {
      return res.status(400).json({ error: 'Your account has no registered station/district — cannot register a case.' });
    }
    const result = createCase(db, {
      unitId: req.user!.unitId,
      districtId: req.user!.districtId,
      employeeId: req.user!.employeeId,
    }, req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof IntakeValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Intake Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Search + Copilot (deterministic — no LLM in the analytical path, ADR 0007)
// ---------------------------------------------------------------------------

app.get('/api/search/cases', scopeJurisdiction(['CaseMaster', 'Unit']), (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });
    const limit = parseInt(req.query.limit as string) || 20;
    res.status(200).json(searchCases(db, query, limit, req.jurisdiction));
  } catch (err: any) {
    console.error('Failed to search cases:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/copilot', scopeJurisdiction(['CaseMaster', 'Accused', 'District']), (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const isCrossDistrictQuery = /repeat offend|cross[- ]district|district-to-district/i.test(message);
    if (isCrossDistrictQuery && req.jurisdiction) {
      return res.status(403).json({
        answer: 'Cross-district repeat-offender analysis requires state-wide (SCRB/SP) access.',
        intent: 'FORBIDDEN',
        tablesUsed: [],
        filtersUsed: {},
        confidence: 0,
        reasoningSummary: 'This question requires visibility beyond your assigned jurisdiction.',
        visualizationType: 'text',
        data: null,
      });
    }

    res.json(answerQuestion(db, message, { jurisdiction: req.jurisdiction ?? null }));
  } catch (err: any) {
    console.error('Copilot error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Analytics — trend/anomaly + repeat-offender detection (PRD §7.6/§9.5/§10)
// ---------------------------------------------------------------------------

app.get('/api/analytics/anomalies', scopeJurisdiction(['CaseMaster', 'District']), (req, res) => {
  try {
    const lookbackWeeks = parseInt(req.query.lookbackWeeks as string) || 8;
    res.json(getAnomalyAlerts(db, lookbackWeeks, req.jurisdiction));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/repeat-offenders', requireRole('SCRB', 'SP'), (req, res) => {
  try {
    const minCases = parseInt(req.query.minCases as string) || 3;
    res.json(findRepeatOffenders(db, { minCases }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Audit trail — SCRB/SP only (PRD §7.8/§13.4)
// ---------------------------------------------------------------------------

app.get('/api/audit/logs', requireRole('SCRB', 'SP'), (req, res) => {
  try {
    res.json(getAuditLogs(db, {
      from: req.query.from as string,
      to: req.query.to as string,
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Automated Data Ingestion — bulk CSV and PDF FIR processing (PRD §4/Differentiators)
// ---------------------------------------------------------------------------
app.use('/api/ingestion', setupIngestionRoutes(db));

// Central error handler — anything thrown synchronously outside a route's own
// try/catch still gets audit-logged (via auditLogger's res.on('finish') hook)
// with a real status code instead of crashing the process.
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.locals.errorMessage = err?.message;
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    const mode = catalystAdapter.getRuntimeMetadata().isCloudRuntime ? 'Zoho Catalyst Serverless Cloud Mode' : 'Hybrid Edge Commander Mode';
    console.log(`[KSP API Engine] Server running on http://localhost:${env.PORT} [${mode}]`);
  });
}

module.exports = app;
export default app;
