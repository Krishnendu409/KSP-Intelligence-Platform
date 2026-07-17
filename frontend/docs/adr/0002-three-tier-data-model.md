# ADR 0002: Three-Tier Immutable Data Model Separation

## Status
Accepted

## Context
When multiple investigators or automated analytical engines interact with criminal records, directly mutating core database tables leads to evidentiary corruption, race conditions, and inability to audit who modified a suspect's profile or why. Furthermore, legal prosecution requires an unbroken, verifiable chain of custody for all operational records.

## Decision
We enforce a strict **Three-Tier Immutable Data Model**:
1. **Operational Records Layer**: Immutable raw forensic records (FIRs, CDRs, CCTV, ANPR, Depositions). Write-once, read-many.
2. **Derived Intelligence Layer**: Deterministically computed projections (entity deduplication, graph edges, spatial indices). Non-destructive, re-computable at any time.
3. **Analyst Intelligence Layer**: Isolated workspace store per analyst/investigation (working hypotheses, bookmarks, watchlists, personal notes, custom layouts).

## Consequences
* **Positive**: Absolute evidentiary integrity; multiple investigators can analyze the same suspect concurrently without interfering with each other's hypotheses.
* **Negative**: Requires explicit schema separation and clear API boundaries between raw records and analyst overlays.
