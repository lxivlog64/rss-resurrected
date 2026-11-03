# How this project uses Kiro

Everything Kiro reads lives in `.kiro/`, in the formats from the [Kiro docs](https://kiro.dev/docs/). This page lists what each file is and how a Kiro user works with it. It describes repository files only; it makes no claim about which code Kiro generated.

| Kiro feature | Files | Format (per Kiro docs) | What it holds |
|---|---|---|---|
| [Steering](https://kiro.dev/docs/steering/) | `.kiro/steering/product.md`, `tech.md`, `structure.md` | Markdown with YAML front matter: `inclusion: always` (product, tech) and `inclusion: fileMatch` + `fileMatchPattern: ["src/**/*.js","test/**/*.js"]` (structure) | Product goal and tone, stack rules (Node 20, no build step, parsers never throw, no secrets), module map |
| [Specs](https://kiro.dev/docs/specs/) | `.kiro/specs/{feed-ingestion,digest-summaries,opml-import}/` | `requirements.md` (user story + EARS acceptance criteria), `design.md`, `tasks.md` (checkbox task list) | One spec per feature; the design lists correctness properties |
| [Hooks](https://kiro.dev/docs/hooks/) | `.kiro/hooks/run-tests-on-save.json`, `check-syntax-on-save.json` | `{"version":"v1","hooks":[{name, trigger, matcher, action}]}`, trigger `PostFileSave`, matcher is a regex on the file path, action `type: command` | `npm test` when `src/*.js` is saved; `node --check` on source modules when any `.js` is saved |
| [MCP](https://kiro.dev/docs/mcp/configuration/) | `.kiro/settings/mcp.json` | Workspace-level `mcpServers` object | `fetch` server via `uvx mcp-server-fetch` |

## How a Kiro user uses these
- **Steering:** open the repo in Kiro. Files marked `always` load into every interaction; `structure.md` loads when you work on files matching its pattern. They show up in the Steering section of the Kiro panel.
- **Specs:** they appear under Specs in the Kiro panel. `tasks.md` is what Kiro's task execution interface tracks; requirements and design can be reviewed and edited before running tasks.
- **Hooks:** `.kiro/hooks/*.json` activate automatically when a session starts; the `PostFileSave` hooks run when a matching file is saved. Set `"enabled": false` to switch one off.
- **MCP:** Kiro merges `.kiro/settings/mcp.json` with the user-level config. The fetch server needs `uv` (`uvx`) installed.

## Correctness properties (fast-check)
From `.kiro/specs/feed-ingestion/design.md`, implemented in `test/parser.test.js` and run by `npm test`:
- P1 `dedupe` is idempotent, yields unique ids and preserves order.
- P2 `normalizeUrl` is idempotent and ignores `utm_source` and fragments.
- P3 a generated RSS feed with k distinct guids yields exactly k items, and the parser never throws.

## Regression found after deploy
Valid Atom feeds with lots of escaped HTML (e.g. blog.rust-lang.org) were rejected as `invalid-xml` because fast-xml-parser's default `maxTotalExpansions` (1000) counts standard entities. The fix (commit df40def) raises that cap while keeping DOCTYPE entity limits strict. `test/fixtures/atom-escaped-html.xml` covers it.

Links: [repo](https://github.com/lxivlog64/rss-resurrected) · [live demo](https://rss-resurrected.onrender.com) · [video](https://youtu.be/chdW0IqvuTw)
