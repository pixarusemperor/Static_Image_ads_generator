@AGENTS.md

## Agent skills

### Issue tracker

GitHub Issues on `pixarusemperor/Static_Image_ads_generator`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` at root + `docs/adr/`. See `docs/agents/domain.md`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

<!-- BEGIN:coolify-deploy-rules -->
## Deployment (Coolify) — MANDATORY RULES

This project auto-deploys to production on every push to the deploy branch
(GitHub Actions → Coolify API → VPS builds and runs). These rules exist because
an agent caused a full production outage on 2026-08-21 by violating them:

### Before deploying

1. **Read the env contract first** (`src/lib/env.ts`). A `required()` var missing in prod = 100% of requests return 500 while the container shows "healthy" — TCP healthchecks cannot see app-level validation failures.
2. **Set ALL env vars BEFORE the first deploy.** Post-deploy env edits trigger a full Docker rebuild on a disk-constrained VPS.
3. **Check disk before any build** (`df -h /` on the VPS): builds need ~3GB transient free. Below that, free space first using the SAFE ORDER in `docs/runbooks/vps-recovery.md` §3 (caches → scratchpads → desktop snaps → dangling images). Never jump to destructive commands.
4. **Never retry failed deploys blindly.** Diagnose from build logs first; each failed build leaves cache that makes the next one worse.

### While deploying

5. **One deploy at a time** — the workflow's concurrency group enforces this; never trigger manual API deploys while a workflow run is live.
6. **Poll to completion** — green means deployment status = `finished`, not merely triggered.

### Hard limits — NEVER

7. No `docker system prune -af`, no `docker volume prune`, no removing images/containers/volumes you did not create in this session.
8. No stopping, pausing, or deleting other apps; no touching other apps' domains.
9. No changing repo visibility without asking.
10. No pushes to the deploy branch with failing typecheck/lint/tests.

### If things break

11. **Panel down ≠ rebuild.** Follow `docs/runbooks/vps-recovery.md` IN ORDER: disk → coolify-db → panel → app. Recovery is usually minutes, not rebuilds.
12. **Document incidents** in `docs/DIAGNOSTIC-AND-FIX.md` — facts and timestamps, appended, never deleted.

Reference: https://github.com/pixarusemperor/coolify-deploy-playbook
<!-- END:coolify-deploy-rules -->
