# ADR 0006: Deterministic Derived Intelligence Layer

## Status
Accepted

## Context
Raw operational records (FIRs, CDR logs, ANPR camera hits) contain duplicate entities, unnormalized phone numbers, and implicit relationships. Performing entity resolution or graph edge discovery on-the-fly during UI rendering incurs unacceptable latency and non-deterministic variations between queries.

## Decision
We introduce a **Deterministic Derived Intelligence Layer** that pre-indexes entity deduplication merges, relationship edges, spatial bounding boxes, and NATO reliability scores into optimized read models.

## Consequences
* **Positive**: Sub-100ms multi-index search and sub-250ms graph neighborhood expansions; complete auditability of why two records were merged or linked.
* **Negative**: Requires background projection pipeline when raw operational records are ingested.
