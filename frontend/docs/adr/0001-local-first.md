# ADR 0001: Local-First Investigation Workspace Architecture

## Status
Accepted

## Context
Police investigations and intelligence analysts operate under strict data sovereignty, low-latency requirements, and occasional disconnected/field conditions. Traditional cloud-only dashboards suffer from network latency during dense graph or spatial interactions and risk single-point-of-failure outages during active operations.

## Decision
We adopt a **local-first architecture** where all active analytical state, workspace layouts, navigation stacks, and high-frequency UI interactions execute against client-side memory (`useInvestigationStore` via Zustand) and local database persistence (`better-sqlite3`). Remote sync with enterprise cloud backends (e.g., Zoho Catalyst) operates asynchronously without blocking the analyst's immediate interaction loop.

## Consequences
* **Positive**: Sub-100ms UI responsiveness; guaranteed zero-latency navigation; resilience against network interruptions.
* **Negative**: Requires careful client-side memory management when handling datasets approaching 500,000+ entities.
