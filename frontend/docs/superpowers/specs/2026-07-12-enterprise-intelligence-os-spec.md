# Enterprise Investigative Analysis OS Specification (Layered Engineering Spec v4.0.0)

**Version**: 4.0.0  
**Date**: 2026-07-12  
**Architectural Mandate**: Strict separation of concerns (`Engine / Algorithms -> Service -> Repository -> Frontend UI`), deterministic local-first engines, automated investigation gap analysis, explainability objects, supervisor workspace, and a 22-member multi-domain adversarial review board.

---

## I. Layered Architectural Topology

```
+---------------------------------------------------------------------------------------------------+
|                                       FRONTEND WORKSPACES                                         |
|  Investigation Shell | Universal Inspector | Actionable Timeline | Evidence Explorer | Supervisor |
+---------------------------------------------------------------------------------------------------+
                                                  |
+---------------------------------------------------------------------------------------------------+
|                                     INVESTIGATION SERVICE LAYER                                   |
|   InvestigationService  |  HypothesisService  |  TaskService  |  BookmarkService  |  ReportService|
+---------------------------------------------------------------------------------------------------+
                                                  |
+---------------------------------------------------------------------------------------------------+
|                                   DETERMINISTIC ANALYTICS ENGINES                                 |
|  SuggestionEngine | ExplainabilityEngine | GapAnalysisEngine | RecommendationEngine | GraphEngine |
+---------------------------------------------------------------------------------------------------+
                                                  |
+---------------------------------------------------------------------------------------------------+
|                                     REPOSITORY & LOCAL STORAGE                                    |
|   InvestigationRepository | EntityRepository | EvidenceRepository | AuditHistoryRepository        |
+---------------------------------------------------------------------------------------------------+
```

---

## II. The 15 Core Engineering Subsystems

### 1. Investigation Service Layer & Repositories
The frontend never owns business logic. All state operations route through:
- `InvestigationRepository`: CRUD and transactional persistence of investigations, cases, FIRs, and objectives.
- `InvestigationService`: High-level operations, health score calculations, and multi-case binding.
- `HypothesisService`: Hypothesis lifecycle (`PROPOSED`, `TESTING`, `SUPPORTED`, `REJECTED`, `PROVEN`).
- `TaskService`: Assignment, priority scheduling (`CRITICAL`, `HIGH`, `ROUTINE`), dependencies, and due dates.
- `BookmarkService`: Folder-based collections of nodes, edges, queries, and evidence.
- `ReportService`: Evidentiary report builder packaging graph, timeline, and notebook assets.

### 2. Deterministic Intelligence Suggestion Engine
Continuous evaluation pipeline producing structured suggestions:
- `MissingEvidenceEngine`: Detects entities or claims lacking physical/digital corroboration.
- `LeadRecommendationEngine`: Suggests unexamined secondary contacts or unverified alibis.
- `ConflictDetectionEngine`: Flags contradictory identities, addresses, or overlapping timestamps.
- `InvestigationGapEngine`: Evaluates structural completeness across entities.

### 3. Deterministic Explainability Engine (`ExplanationObject`)
Every risk rating, edge, or recommendation outputs a structured `ExplanationObject`:
```json
{
  "subjectId": "PERSON-ARJUN",
  "conclusion": "HIGH_RISK_KINGPIN",
  "reasons": [
    "Direct financial transfers to hawala courier KA01AB1234",
    "Named syndicate leader in FIR-2026-089"
  ],
  "supportingFIRs": ["FIR-2026-089", "FIR-2026-104"],
  "supportingEvidenceIds": ["EVD-CDR-8819", "EVD-ANPR-9921"],
  "confidenceGrade": "A1",
  "algorithmUsed": "MultiHopBetweennessCentrality_v2"
}
```

### 4. Investigation Gap Analysis Engine
Runs continuously in the background to detect structural gaps:
- `Vehicle exists` + `No owner` -> **GAP: Unowned Vehicle**
- `Phone exists` + `No subscriber` -> **GAP: Unregistered SIM**
- `Evidence exists` + `No chain of custody` -> **GAP: Chain of Custody Incomplete**
- `Hypothesis exists` + `No supporting evidence` -> **GAP: Unsupported Hypothesis**

### 5. Rule-Based Investigation Recommendation Engine
Converts identified gaps into actionable investigative tasks:
- Suspect has phone + No CDR -> `Recommend CDR Request Task`
- Vehicle + No ANPR -> `Recommend ANPR Grid Search Task`
- Weapon + No Ballistic Report -> `Recommend Forensic Ballistic Analysis Task`
- Cash Transfer + No Bank Statement -> `Recommend FIU Ledger Inquiry Task`

### 6. Investigation Health & Completeness Scorecard
Calculates real-time health metrics per investigation:
- `Evidence Completeness: 32%`
- `Identity Confidence: 91%`
- `Timeline Completeness: 76%`
- `Spatial Coverage: 48%`
- `Financial Coverage: 12%`
- Summary counts: `Outstanding Leads: 19`, `Duplicate Entities: 5`, `Missing Evidence: 8`.

### 7. Relationship Confidence Explorer
Deep-dive relationship breakdown answering:
`WHY -> Evidence -> Confidence Grade (A1-F6) -> Source -> Created By -> Algorithm -> Timeline -> Conflicting Evidence -> Alternative Explanations`.

### 8. Immutable Object Audit History
Every entity stores an immutable lifecycle audit log:
`Person Created -> Merged with Alias -> Phone Added -> Address Changed -> Evidence Attached -> Risk Score Updated -> Officer Note -> Task Completed -> Hypothesis Linked`.

### 9. Enterprise Bulk Operations Engine
Enables bulk execution across selected records:
- Bulk `Merge`, `Export`, `Assign Officer`, `Tag`, `Delete`, `Watchlist Add`, `Bookmark`, `Task Creation`, `Evidence Linking`.

### 10. Multi-Format Import Workspace
Structured data ingestion pipeline supporting:
- Formats: `CSV`, `Excel`, `JSON`, `FIR`, `CDR`, `ANPR`, `Bank Statements`, `CCTV Metadata`, `GeoJSON`.
- Features: Interactive Column Mapping, Schema Validation, Live Ingest Preview, and Error Log Reporting.

### 11. Domain Workflow Templates
Pre-configured investigation templates that instantly scaffold standard tasks, hypotheses, queries, and dashboards:
- `Missing Person Investigation Workflow`
- `Cyber Fraud & Mule Account Workflow`
- `Organized Crime & Syndicate Workflow`
- `Counter-Terror Cell Investigation Workflow`

### 12. Supervisor & SHO Command Workspace
Dedicated operational command pane for supervisors:
- Case Allocation & Officer Workload Balancing
- Real-time Investigation Progress & Pending Task Monitoring
- SLA Alerts & Investigation Health Review Queue
- Warrant & Evidence Approval Queue

### 13. Actionable Command Center (`Ctrl+K`)
Command execution engine parsing and routing natural language/action commands:
- `Open Investigation Nightfall`
- `Show Hawala Network`
- `Expand Arjun Sharma 2 hops`
- `Trace Phone +919845011223`
- `Open FIR 2210`
- `Generate Briefing Report`

### 14. Investigation Recorder & Session Replay Engine
Captures analyst sequences (`Search -> Open Dossier -> Expand Graph -> Filter Timeline`) for replayable briefing and supervisory audits.

### 15. Release Metrics & Performance Dashboard
Continuous operational telemetry scorecard monitoring:
- Search Latency (`<100ms`), Timeline Latency (`<100ms`), Graph Expansion Latency (`<250ms`)
- Memory usage, FPS (`60 FPS`), and zero Critical/High domain findings.

---

## III. 22-Member Multi-Domain Adversarial Review Board

To guarantee operational defensibility and zero false positives, deployment is gated until every one of the 22 specialist domain reviewers scores the system with **0 Critical** and **0 High** findings:
1. **Major Crimes Detective**: Verifies investigative logical flow and lead tracking.
2. **Homicide Detective**: Verifies timeline precision and witness alibi cross-checking.
3. **Cyber Crime Investigator**: Verifies IP/IMEI/CDR chain analysis and digital forensics.
4. **Financial Crime Investigator**: Verifies hawala/layering financial traces and FIU links.
5. **Narcotics Investigator**: Verifies supply chain node linking and contraband transit routes.
6. **Counter-Terror Intelligence Officer**: Verifies sleeper cell communication networks and risk scoring.
7. **Digital Forensics Examiner**: Verifies SHA-256 hash integrity and image/video metadata accuracy.
8. **Crime Analyst**: Verifies statistical density, link prediction, and pattern validity.
9. **GIS Intelligence Analyst**: Verifies spatial projection accuracy, ANPR corridors, and geocoding.
10. **ANPR/Traffic Intelligence Officer**: Verifies vehicle sighting timestamps and travel speed feasibility.
11. **Intelligence Bureau Analyst**: Verifies intelligence classification and source reliability (A1-F6).
12. **Prosecutor / Legal Reviewer**: Verifies Indian Evidence Act Sec 63/65B chain of custody compliance.
13. **Supervisor / SHO**: Verifies workload management, approval workflows, and investigation health.
14. **Data Quality Auditor**: Verifies duplicate detection accuracy and orphan entity cleanup.
15. **Human Factors / UX Reviewer**: Verifies cognitive load, high contrast, and <=3 click pivot paths.
16. **Performance Engineer**: Verifies sub-100ms search/timeline and 60 FPS GIS interaction.
17. **Security Reviewer**: Verifies input validation, XSS/injection protection, and RBAC enforcement.
18. **Accessibility Reviewer**: Verifies WCAG 2.1 AA keyboard navigation and screen reader support.
19. **QA Automation Reviewer**: Verifies 100% pass rate across all automated TDD test suites.
20. **Red Team Adversary**: Actively attempts to break workflows, exploit state bugs, and corrupt evidence.
21. **Architecture Reviewer**: Verifies strict layer separation (`Engine -> Service -> Repository -> UI`).
22. **Product Reviewer**: Verifies complete functional parity with enterprise investigative benchmarks.
