# KSP Intelligence Platform Context and Rules

## Overview
This repository contains the source code for the Karnataka State Police (KSP) Crime Intelligence & Analytical Platform. The system is designed to move KSP beyond manual, Excel-based records by providing a state-of-the-art platform that integrates sociological insights, criminological intelligence, and cutting-edge technology.

## Core Capabilities
1. **Advanced Visualization**: Interactive dashboards and geospatial maps to track crime clusters, district-level drill-downs, and emerging trend alerts.
2. **Criminological Network & Link Analysis**: Node-based visualizations connecting suspects, victims, and locations to reveal organized crime structures.
3. **Sociological & AI-Driven Predictive Dashboards**: Overlaying crime data with socio-economic indicators and AI-driven predictive risk scoring.
4. **Pattern & Trend Discovery**: Statistical analytics for spatial and temporal hotspots.
5. **Network & Behavioral Analysis**: Identifying recurring Modus Operandi (MO) and organized crime networks.
6. **AI/ML-Driven Intelligence**: Detecting hidden correlations and predicting emerging crime risks.

## Project Rules & Architecture Constraints

### 1. Data Authenticity (No Hardcoding)
- **CRITICAL RULE**: The system must operate on 100% real data fetched from the backend SQLite database (`fir_system.sqlite`).
- Under no circumstances should frontend components or backend services rely on hardcoded fallback arrays, mock objects, or fictional placeholder data (e.g., hardcoded FIR cases, fake map pins, static performance metrics, or dummy timeline events).
- If an endpoint fails or data is empty, the UI must gracefully display an empty state or error message rather than masking the issue with synthetic data.

### 2. Full-Stack Integration
- **Frontend**: Built using React/TypeScript (Vite).
- **Backend**: Built using Express.js (TypeScript) exposing a robust API under `/api/*`.
- **Database**: SQLite (via `better-sqlite3`). The database schema strictly defines `CaseMaster`, `Accused`, `Victim`, `ActSectionAssociation`, etc.
- All frontend data requests must route through properly structured backend endpoints. Dead code or orphaned services (e.g., `TimelineService`, `EntityService`) must be fully wired up to Express routes.

### 3. Architecture Pattern
- The backend utilizes a Domain-Driven Repository pattern.
- Database access is abstracted into repositories (e.g., `SQLiteCaseRepository`, `SQLiteEntityRepository`).
- Business logic resides in domain services (e.g., `case.service.ts`, `network.service.ts`).
- Route handlers (`routes/*.ts`) manage HTTP requests/responses and delegate execution to the domain services.
- Route collisions (e.g., catching `/relationships` inside an `:id` catch-all) must be prevented by proper route ordering in `index.ts`.

### 4. Development Workflow (TDD & Subagent-Driven)
- All new features and refactors must follow **Test-Driven Development (TDD)** and **Systematic Debugging**.
- Features should be incrementally tested (using backend unit tests and frontend rendering tests).
- Complex refactoring should involve "Planning Mode" (brainstorming, auditing, writing implementation plans, obtaining review) before execution.

### 5. UI/UX Standards
- The application must maintain a highly professional, trustworthy UI tailored for Police usage.
- Information must be accurate. Displaying fake stats like "+12% crime trend" is completely unacceptable as it destroys system credibility.
- The UI must always display active session context (e.g., logged-in officer name, rank, station).

### 6. The CONTEXT Folder
- The `/CONTEXT` directory contains critical domain documentation, problem statements, diagrams, and historical reports that form the blueprint of the project.
- Always refer to these documents when making domain-level architectural decisions.
