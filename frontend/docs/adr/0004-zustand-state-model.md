# ADR 0004: Zustand Global State & Persistent Workspace Model

## Status
Accepted

## Context
High-density intelligence platforms require rapid cross-panel synchronization: selecting a node in the relationship graph must instantly center the GIS map, filter the timeline, and populate the right-hand Universal Inspector. Relying on deep React prop-drilling or Context API triggers unnecessary component re-renders and lags user interactions.

## Decision
We adopt **Zustand** (`useInvestigationStore`) with structured slice selectors and JSON storage persistence as the single source of truth for all active client-side investigative session state.

## Consequences
* **Positive**: Zero-overhead atomic component updates; effortless workspace snapshot saving/restoration across browser restarts; clean separation between UI components and state logic.
* **Negative**: Requires disciplined typing of store actions and state slices to prevent store bloat.
