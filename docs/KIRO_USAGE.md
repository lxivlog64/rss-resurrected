# How Kiro was used — DRAFT

> ⚠️ Draft. Section A lists what is **actually configured in this repo** (verifiable). Section B has `TODO(confirm)` markers for anything that must be confirmed after really running the project in Kiro. Do not submit B as-is: delete every claim you cannot back up.

## A. Configured in the repository (verifiable)
| Kiro feature | Where | What it does |
|---|---|---|
| Steering | `.kiro/steering/product.md` (always), `tech.md` (always), `structure.md` (fileMatch `src/**`, `test/**`) | Product goals, stack rules (no build step, never throw in parsers, no secrets), and module map |
| Specs | `.kiro/specs/feed-ingestion`, `digest-summaries`, `opml-import` | `requirements.md` in EARS syntax, `design.md` with correctness properties, `tasks.md` checklists |
| Hooks | `.kiro/hooks/run-tests-on-save.json` (PostFileSave on `src/**/*.js` → `npm test`), `check-syntax-on-save.json` | Keep tests green on save |
| MCP | `.kiro/settings/mcp.json` | `fetch` MCP server (via `uvx mcp-server-fetch`) for pulling real feeds while developing |
| Property-based testing | `test/parser.test.js` (fast-check) | Properties P1–P3 from the feed-ingestion design. P2 found a real bug: `http://a.aa//` normalized non-idempotently; fixed by collapsing trailing slashes |

## B. To confirm after running in Kiro
- TODO(confirm): Which Kiro product(s) were used (Kiro IDE / Kiro CLI) and how they differed in practice.
- TODO(confirm): Did Kiro load the steering files automatically (check the context panel)? Quote one place where steering changed the output.
- TODO(confirm): Spec-driven vs vibe coding — which parts were generated from specs (Kiro "Run task") and which were vibe-coded in chat. Add one concrete comparison.
- TODO(confirm): Did the PostFileSave hook fire in Kiro and show test output? Screenshot.
- TODO(confirm): Was the fetch MCP server started successfully and used? Example prompt.
- TODO(confirm): Custom agents — none configured yet. Add one only if actually created.
- TODO(confirm): Powers — none used yet. Mention only if actually used.
- TODO(confirm): Kiro's built-in PBT support — only claim if Kiro itself generated/ran property tests.
