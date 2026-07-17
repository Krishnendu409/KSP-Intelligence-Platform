# Enterprise Investigative Analysis OS Layered Engineering Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the application into a layered, deterministic **Enterprise Intelligence & Decision-Support System** (Gotham / i2 parity) backed by dedicated Investigation Services, Deterministic Suggestion/Gap Engines, Explainability Objects, and a 22-Member Adversarial Review Board.

**Architecture:** Layered separation of concerns (`Engine / Algorithms -> Service -> Repository -> Frontend UI`).

---

### Task 1: Investigation Repository & Service Layer (`InvestigationService`, `HypothesisService`, `TaskService`)
**Files:**
- Create: `src/investigation/services/InvestigationRepository.ts`
- Create: `src/investigation/services/InvestigationService.ts`
- Create: `src/investigation/services/HypothesisService.ts`
- Create: `src/investigation/services/TaskService.ts`
- Test: `src/investigation/services/InvestigationServiceLayer.test.ts`

- [ ] **Step 1: Write the failing test** verifying `InvestigationRepository` stores multi-case investigations, `InvestigationService` computes health scores (`Evidence Completeness`, `Identity Confidence`), and `TaskService` links tasks to officers/evidence.
- [ ] **Step 2: Implement InvestigationRepository, InvestigationService, HypothesisService, and TaskService**.
- [ ] **Step 3: Verify tests pass** (`npx vitest run src/investigation/services/InvestigationServiceLayer.test.ts`).

---

### Task 2: Deterministic Suggestion, Gap Analysis & Explainability Engine (`SuggestionEngine`, `GapAnalysisEngine`, `ExplainabilityEngine`)
**Files:**
- Create: `src/investigation/engine/ExplainabilityEngine.ts`
- Create: `src/investigation/engine/GapAnalysisEngine.ts`
- Create: `src/investigation/engine/SuggestionEngine.ts`
- Test: `src/investigation/engine/DeterministicEngines.test.ts`

- [ ] **Step 1: Write the failing test** verifying `ExplainabilityEngine` outputs deterministic `ExplanationObject`s, `GapAnalysisEngine` detects unowned vehicles/unregistered SIMs/unsupported hypotheses, and `SuggestionEngine` recommends CDR/ANPR actions.
- [ ] **Step 2: Implement ExplainabilityEngine, GapAnalysisEngine, and SuggestionEngine**.
- [ ] **Step 3: Verify tests pass** (`npx vitest run src/investigation/engine/DeterministicEngines.test.ts`).

---

### Task 3: Actionable Timeline Engine & Offline-First Timeline Service
**Files:**
- Modify: `src/timeline/useTimelineData.ts`
- Modify: `src/timeline/TimelinePanel.tsx`
- Test: `src/timeline/ActionableTimelineEngine.test.ts`

- [ ] **Step 1: Write the failing test** verifying non-empty offline operational timeline events with actionable handlers (`Open Recording`, `Open Camera`, `Open Chain of Custody`).
- [ ] **Step 2: Implement actionable timeline events and fix empty timeline bug**.
- [ ] **Step 3: Verify tests pass** (`npx vitest run src/timeline/ActionableTimelineEngine.test.ts`).

---

### Task 4: Universal Intelligence Inspector Drawer & Relationship Confidence Explorer
**Files:**
- Create: `src/investigation/ui/UniversalInspectorDrawer.tsx`
- Create: `src/investigation/ui/RelationshipConfidenceExplorer.tsx`
- Test: `src/investigation/ui/UniversalInspectorDrawer.test.tsx`

- [ ] **Step 1: Write the failing test** verifying UniversalInspectorDrawer renders Person, Vehicle, Phone, Edge ("WHY?"), Evidence Item, Task, and Hypothesis views.
- [ ] **Step 2: Implement UniversalInspectorDrawer and RelationshipConfidenceExplorer components**.
- [ ] **Step 3: Verify tests pass** (`npx vitest run src/investigation/ui/UniversalInspectorDrawer.test.tsx`).

---

### Task 5: Enterprise Database Browser, Bulk Operations & Import Workspace
**Files:**
- Create: `src/investigation/ui/StructuredDatabaseGrid.tsx`
- Create: `src/investigation/ui/DataQualityCenterModal.tsx`
- Create: `src/investigation/ui/MergeCenterModal.tsx`
- Test: `src/investigation/ui/EnterpriseDatabaseOps.test.tsx`

- [ ] **Step 1: Write the failing test** verifying multi-entity grid filtering, duplicate detection, and auditable entity merge.
- [ ] **Step 2: Implement StructuredDatabaseGrid, DataQualityCenterModal, and MergeCenterModal**.
- [ ] **Step 3: Verify tests pass** (`npx vitest run src/investigation/ui/EnterpriseDatabaseOps.test.tsx`).

---

### Task 6: Actionable Command Center (`Ctrl+K`), Investigation Recorder & Supervisor Workspace
**Files:**
- Create: `src/investigation/ui/CommandCenterModal.tsx`
- Create: `src/investigation/ui/SupervisorCommandWorkspace.tsx`
- Create: `src/investigation/ui/ReleaseMetricsDashboard.tsx`
- Test: `src/investigation/ui/CommandCenterSupervisor.test.tsx`

- [ ] **Step 1: Write the failing test** verifying Ctrl+K executes actionable investigation commands (`Open Investigation Nightfall`, `Expand 2 hops`, `Trace Phone`) and Supervisor Workspace tracks SLA health.
- [ ] **Step 2: Implement CommandCenterModal, SupervisorCommandWorkspace, and ReleaseMetricsDashboard**.
- [ ] **Step 3: Verify tests pass** (`npx vitest run src/investigation/ui/CommandCenterSupervisor.test.tsx`).
