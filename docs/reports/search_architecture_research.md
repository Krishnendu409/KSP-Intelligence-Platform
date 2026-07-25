# Deep Research: Police OS Search Architecture (SQLite + Node.js)

## Executive Summary
This report analyzes the optimal search architecture for a local-first Police Intelligence Operating System built on Node.js and SQLite. The goal is to replace a shallow, hardcoded frontend search array with a deep, scalable backend module capable of searching 5,000+ real records with high relevance, typo tolerance, and speed.

Our findings indicate that pure in-memory JavaScript search libraries (like Lunr or MiniSearch) fail to scale efficiently without imposing severe memory pressure on the Node.js V8 heap. Conversely, standalone binary engines like Meilisearch, while powerful, introduce unnecessary deployment complexity for a local-first stack. The most robust, lowest-friction solution is to leverage SQLite's built-in **FTS5 (Full-Text Search) extension** with external content tables and triggers, natively supported by `better-sqlite3`.

However, traditional BM25 exact-match lexical search performs poorly on messy police data (e.g., misspellings, colloquialisms, code-switched languages). To mitigate this without the heavy operational burden of local LLM vector embeddings (`sqlite-vec` + ONNX), the recommended approach is to utilize FTS5 combined with phonetic hashing (Double Metaphone) at the application tier, or utilizing FTS5's trigram tokenization for partial substring matching.

## Key Findings
1.  **FTS5 is Native & Zero-Config:** `better-sqlite3` compiles with FTS5 enabled by default. No external dependencies are required to achieve sub-millisecond lexical search with BM25 relevance ranking.
2.  **External Content Tables are Essential:** To avoid duplicating the 5,000+ FIR records, FTS5 can be configured as an "External Content Table" that points to the base `CaseMaster` table.
3.  **Triggers Guarantee Sync:** Database triggers (`AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`) are the industry standard for ensuring the FTS5 index never falls out of sync with the base tables, keeping the Node.js application logic clean.
4.  **BM25 Ranks Negatively:** SQLite's built-in BM25 algorithm scores better matches with *more negative* numbers. Sorting by `ORDER BY rank ASC` is required for relevance.
5.  **Pure JS Libraries don't scale well:** Libraries like Lunr or MiniSearch consume significant Node.js heap memory per unique token, risking Garbage Collection (GC) pauses as the database grows past 50k records.

## Detailed Analysis

### The FTS5 Architecture
The implementation of FTS5 requires three components:
1.  The base table (e.g., `CaseMaster`).
2.  The FTS5 virtual table (e.g., `CaseMaster_fts`), configured with `content='CaseMaster'`.
3.  SQL Triggers that automatically mirror operations from the base table to the virtual table.

When querying, the `MATCH` operator utilizes an inverted index, turning full-table scans into instant lookups. The hidden `rank` column provides the BM25 score.

### Handling Messy Police Data
Standard tokenizers fail when "robbery" is spelled "robery". 
*   **Trigram Tokenization:** SQLite FTS5 supports an experimental `tokenize='trigram'` setting. It breaks words into 3-character chunks, allowing for extremely fast fuzzy substring matching (`LIKE '%rob%'`).
*   **Node.js Phonetics:** Generating a Double Metaphone hash (using the `natural` npm package) for suspect names at ingestion allows phonetic matching ("Smith" matches "Smythe").

## Contrarian Views And Risks
*   **Single-Writer Bottleneck:** SQLite (and FTS5) relies on a single-writer lock. While WAL mode (`PRAGMA journal_mode=WAL`) allows concurrent reads, massive bulk inserts will block other writes. The index update overhead from triggers exacerbates this.
*   **The Hybrid Search Horizon:** Some architects argue that lexical search (BM25) is obsolete for intelligence work, advocating for pure Semantic Vector Search using `sqlite-vec` and local embeddings. However, the operational complexity of deploying C-extensions and running local ONNX models makes this risky for short-timeline deployments compared to native FTS5.

## Open Questions
*   **Schema Scope:** Should the FTS5 index cover just `CaseMaster.BriefFacts`, or should we create a materialized view that joins `Accused`, `Victim`, and `ActSectionAssociation` into a single searchable text blob per case?
*   **Search Syntax:** FTS5 `MATCH` queries fail if they contain unescaped special characters. How aggressively should the Node.js backend sanitize user input from the Copilot UI?

## Sources
*   *SQLite FTS5 Documentation:* `https://sqlite.org/fts5.html`
*   *better-sqlite3 GitHub:* `https://github.com/WiseLibs/better-sqlite3`
*   *FlexSearch / MiniSearch Benchmarks:* Node.js in-memory search scaling limits.
*   *Hybrid Search Architectures:* RRF (Reciprocal Rank Fusion) and `sqlite-vec` integration.

## Rerun Inputs
workflow: firecrawl-deep-research
topic: best approach for implementing search in Node.js + SQLite stack (BM25 vs FTS5 vs In-memory) tailored for Police OS
depth: exhaustive
output: markdown
