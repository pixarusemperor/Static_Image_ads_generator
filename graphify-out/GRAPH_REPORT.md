# Graph Report - .  (2026-07-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 115 nodes · 149 edges · 13 communities (9 shown, 4 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.79)
- Token cost: 603 input · 36 output

## Graph Freshness
- Built from commit: `bbfef396`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- page.tsx
- route.ts
- route.ts
- React Template Components
- layout.tsx
- route.ts
- Coolify Deployment Automation
- Graph Query and Ingestion
- Knowledge Graph Extraction Pipeline
- HTML/CSS Satori Rendering
- Template Classification Layout Engine
- ADR Directory Conventions
- Local Markdown Issue Tracker

## God Nodes (most connected - your core abstractions)
1. `Graphify Extraction Pipeline` - 9 edges
2. `Graphify Skill (Full Spec)` - 7 edges
3. `HTML/CSS Satori Rendering` - 6 edges
4. `Graphify Query` - 6 edges
5. `getGenAIClient()` - 5 edges
6. `getGenAIModel()` - 5 edges
7. `POST()` - 4 edges
8. `POST()` - 4 edges
9. `POST()` - 4 edges
10. `getTemplateComponent()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `HTML/CSS Satori Rendering` --conceptually_related_to--> `Pillow/Canvas Rendering`  [INFERRED]
  adr/0003-html-css-satori-rendering.md → agents/image-analysis-report.md
- `Template Classification Layout Engine` --conceptually_related_to--> `Template Categories (5 Groups)`  [INFERRED]
  adr/0001-template-classification-layout-engine.md → agents/image-analysis-report.md
- `Deterministic JSON Assembly API` --conceptually_related_to--> `Dynamic Variables System`  [INFERRED]
  adr/0006-deterministic-assembly-api.md → agents/image-analysis-report.md
- `Graphify Skill` --references--> `Graphify Skill (Full Spec)`  [EXTRACTED]
  CLAUDE.md → skills/graphify/SKILL.md
- `POST()` --calls--> `getGenAIClient()`  [EXTRACTED]
  app/api/analyze/route.ts → utils/ai.ts

## Import Cycles
- None detected.

## Communities (13 total, 4 thin omitted)

### Community 0 - "page.tsx"
Cohesion: 0.27
Nodes (8): ChatMessage, HTMLCSSEditorDashboard(), initialTemplateLayers, syncVariablesToLayers(), CanvasLayer, CustomTemplate(), CustomTemplateProps, TemplateId

### Community 1 - "route.ts"
Cohesion: 0.50
Nodes (6): getMockClassification(), POST(), getMockChatUpdate(), POST(), getGenAIClient(), getGenAIModel()

### Community 2 - "route.ts"
Cohesion: 0.36
Nodes (6): emojiCache, POST(), getTemplateComponent(), templatesDimensions, getFontBuffers(), resolveImageToBase64()

### Community 3 - "React Template Components"
Cohesion: 0.14
Nodes (15): templatesMap, Template1A(), Template1AProps, Template1B(), Template1BProps, Template2A(), Template2AProps, Template3A() (+7 more)

### Community 4 - "layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 7 - "Graph Query and Ingestion"
Cohesion: 0.13
Nodes (15): Graphify Skill, URL Ingestion (Add), File Watcher (Watch), BFS/DFS Traversal Modes, Graphify Explain (Node Detail), Graphify Path (Shortest Path), Save Query Result (Feedback Loop), Query Vocabulary Expansion (+7 more)

### Community 8 - "Knowledge Graph Extraction Pipeline"
Cohesion: 0.17
Nodes (12): FalkorDB Export, MCP Server Export, Neo4j Export, Confidence Score Rubric, Hyperedges (N-ary Relations), Node ID Format Rules, Cross-Repo Graph Merge, Git Commit Hook (Auto-Rebuild) (+4 more)

### Community 9 - "HTML/CSS Satori Rendering"
Cohesion: 0.17
Nodes (12): Konva.js, React-Konva Canvas Editor, HTML/CSS Satori Rendering, Vercel Satori, AI Background Removal, rembg Library, Subject Extraction, Next.js App Router (+4 more)

### Community 10 - "Template Classification Layout Engine"
Cohesion: 0.22
Nodes (11): Dynamic JSON Layout, Template Classification Layout Engine, AI Chat State Modification, Direct JSON Layout State Modification, Gemini Structured Output Mode, Sanity Validators, Deterministic JSON Assembly API, POST /api/assemble (+3 more)

## Knowledge Gaps
- **35 isolated node(s):** `emojiCache`, `geistSans`, `geistMono`, `metadata`, `initialTemplateLayers` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Graphify Skill (Full Spec)` connect `Graph Query and Ingestion` to `Knowledge Graph Extraction Pipeline`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Graphify Extraction Pipeline` connect `Knowledge Graph Extraction Pipeline` to `Graph Query and Ingestion`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `HTML/CSS Satori Rendering` connect `HTML/CSS Satori Rendering` to `Template Classification Layout Engine`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Graphify Extraction Pipeline` (e.g. with `FalkorDB Export` and `MCP Server Export`) actually correct?**
  _`Graphify Extraction Pipeline` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `HTML/CSS Satori Rendering` (e.g. with `Subject Extraction` and `Sanity Validators`) actually correct?**
  _`HTML/CSS Satori Rendering` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `emojiCache`, `geistSans`, `geistMono` to the rest of the system?**
  _42 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React Template Components` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._