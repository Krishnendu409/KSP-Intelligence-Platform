# ADR 0005: Embedded SQLite Development Store (`better-sqlite3`)

## Status
Accepted

## Context
During development, testing, and field deployment, the platform must execute complex relational queries, spatial bounding lookups, and graph adjacency joins without requiring complex external database server setups or internet connectivity.

## Decision
We utilize **embedded SQLite** (`better-sqlite3`) as the local development, testing, and edge persistence engine.

## Consequences
* **Positive**: Microsecond query execution; zero infrastructure overhead; deterministic snapshotting and instant fixture reset during automated regression tests.
* **Negative**: Horizontal scaling for cloud enterprise deployment requires an adapter layer (e.g., Zoho Catalyst adapter at CMM Level 5).
