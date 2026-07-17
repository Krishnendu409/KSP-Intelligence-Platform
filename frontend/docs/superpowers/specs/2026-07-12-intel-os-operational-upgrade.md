# INTEL-OS Architectural Specification & Operational Upgrade

**Date:** 2026-07-12  
**System:** Karnataka Police Department INTEL-OS v2.4  
**Compliance Standard:** Karnataka Police FIR ER Diagram (`Police_FIR_ER_Diagram.pdf`)  
**Architecture:** Offline Deterministic Intelligence OS + Dedicated Full-Page Workspaces

---

## 1. System Overview

INTEL-OS is an offline-first, deterministic intelligence and investigative platform designed for the Karnataka Police Department. Every analytical capability runs locally with zero external API dependencies or non-deterministic LLMs.

---

## 2. Core Feature Pages (Full-Page Navigation)

Each operational domain has a dedicated, feature-rich full-page workspace accessible via the primary navigation and sidebar:

1. **`/` (Executive Command Dashboard)**: Real-time operational metrics, recent FIR feeds, system health, and quick investigative search.
2. **`/hotspots` (Tactical GIS Choropleth Map Workspace)**:
   - Full-screen interactive map.
   - **Choropleth Crime Density Polygons** for Bengaluru Police Districts (Central, East, South, Whitefield, North, Koramangala, Indiranagar, MG Road Zones) colored by crime density (`Low` = emerald green, `Moderate` = amber, `Heinous/High` = crimson red).
   - **On-Map Geo-Spatial Network Overlay**: Interactive toggle plotting physical connection lines between suspect safehouses, FIR incident coordinates, and ANPR/cell towers directly on the map.
3. **`/network` (Evidentiary Link Analysis Workspace)**:
   - Full-screen Cytoscape relational graph.
   - Kingpin & Hawala Bridge automatic detection.
   - Evidentiary Shortest Path Tracing HUD (`BFS` chain of custody).
4. **`/cases` (Police FIR Database & Case Management)**:
   - Dedicated searchable database of FIR records strictly formatted to `Police_FIR_ER_Diagram.pdf`.
5. **`/copilot` (Offline Intelligence AI Copilot)**:
   - Dedicated full-page offline natural-language query assistant and dossier synthesizer.

---

## 3. Strict Database Schema Adherence (`Police_FIR_ER_Diagram.pdf`)

### A. `CaseMaster` Record Specification
- `CaseMasterID`: Integer primary key.
- `CrimeNo`: Strict 18-digit string format:
  `CategoryCode (1) + DistrictID (4) + PoliceStationID (4) + Year (4) + RunningSerial (5)`
  Example: `104430006202600001` (FIR Category `1`, District `0443` Bengaluru East, Station `0006` Indiranagar PS, Year `2026`, Serial `00001`).
- `CaseNo`: Formatted as `YYYY + 5-digit serial` (e.g., `202600001`).
- `CrimeRegisteredDate`: `YYYY-MM-DD`.
- `PoliceStationID`: Station unit reference.
- `GravityOffenceID`: `1` (Heinous) or `2` (Non-Heinous).
- `latitude` / `longitude`: Decimal GPS coordinates in Bengaluru.
- `BriefFacts`: Comprehensive investigative narrative.

### B. Related ER Tables
- **`ActSectionAssociation`**: Maps `CaseMasterID` to `ActCode` (`IPC`, `BNS`, `NDPS`, `IT_ACT`) and `SectionCode` (`302`, `120B`, `307`, `21c`).
- **`Accused`**: Suspect details (`AccusedMasterID`, `AccusedName`, `PersonID` order A1/A2).
- **`Victim`**: Victim details (`VictimMasterID`, `VictimName`).
- **`ComplainantDetails`**: Complainant details.

---

## 4. Offline Deterministic AI Copilot (`AICopilotPanel.tsx`)

- **100% Offline Rule Engine**: Operates locally using deterministic keyword indexing, structured intent classification, and algorithmic synthesis.
- **Capabilities**:
  1. **Natural Language FIR Lookup**: e.g., *"Show Heinous FIRs in Koramangala"* or *"Search IPC 302 cases in 2026"*.
  2. **Automated Case Briefing Generator**: Synthesizes a structured intelligence briefing from any `CaseMaster` record.
  3. **Charge Sheet & Act Recommendation**: Analyzes case `BriefFacts` to recommend appropriate legal sections (`IPC 302`, `IPC 120B`, `NDPS Act`).

---

## 5. Verification & TDD Strategy

All enhancements will be verified via Test-Driven Development (`vitest run`):
1. `OperationalERDatabase.test.ts`: Verifies strict `CrimeNo` formatting, ER diagram relationships, and precise Bengaluru coordinates.
2. `OfflineAICopilot.test.ts`: Verifies offline deterministic NLP querying and dossier synthesis.
3. `ChoroplethGeoNetwork.test.ts`: Verifies Choropleth district polygon data and Geo-Network spatial arcs.
