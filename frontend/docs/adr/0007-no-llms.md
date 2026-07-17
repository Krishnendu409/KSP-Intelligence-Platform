# ADR 0007: Zero Non-Deterministic LLMs in Analytical Execution Path

## Status
Accepted

## Context
In criminal justice, counter-terrorism, and major crimes prosecution, every piece of intelligence, entity resolution match, shortest path discovery, and risk score must be **100% deterministic, explainable, traceable, and reproducible in a court of law**. Non-deterministic Large Language Models (LLMs) hallucinate connections, produce varying scores across identical queries, and lack mathematical proofs of path justification.

## Decision
We prohibit non-deterministic LLMs from executing within any analytical engine (Unified Search, Entity Resolution, Shortest Path Graph, Spatial Clustering, Time-Brushing, or Risk Scoring). All intelligence engines must use deterministic algorithms (BFS/Dijkstra, Levenshtein distance, exact spatial indices, and rule-based NATO grading).

## Consequences
* **Positive**: 100% judicial admissibility; mathematically guaranteed explainability; zero hallucination risk; sub-100ms execution latency.
* **Negative**: Natural language free-text queries must be parsed via deterministic tokenization and structured grammar rules rather than open-ended prompt inference.
