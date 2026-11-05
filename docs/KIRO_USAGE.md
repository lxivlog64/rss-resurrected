# How this project uses Kiro

Everything Kiro reads lives in `.kiro/`, in the formats from the [Kiro docs](https://kiro.dev/docs/). This write-up answers the Kiroween 2026 judging prompts one by one. It states what was actually used in Kiro IDE 1.4.86 (Free plan) and what was not. Do not treat the TODO lines as claimed work — they mark planned follow-up sessions once more Kiro credits arrive.

## File map

| Kiro feature | Files | Format (per Kiro docs) | What it holds |
|---|---|---|---|
| [Steering](https://kiro.dev/docs/steering/) | `.kiro/steering/product.md`, `tech.md`, `structure.md` | Markdown with YAML front matter: `inclusion: always` (product, tech) and `inclusion: fileMatch` + `fileMatchPattern: ["src/**/*.js","test/**/*.js"]` (structure) | Product goal and tone, stack rules (Node 20, no build step, parsers never throw, no secrets), module map |
| [Specs](https://kiro.dev/docs/specs/) | `.kiro/specs/{feed-ingestion,digest-summaries,opml-import}/` | `requirements.md` (user story + EARS acceptance criteria), `design.md`, `tasks.md` (checkbox task list) | One spec per feature; the design lists correctness properties |
| [Hooks](https://kiro.dev/docs/hooks/) | `.kiro/hooks/run-tests-on-save.json`, `check-syntax-on-save.json` | `{"version":"v1","hooks":[{name, trigger, matcher, action}]}`, trigger `PostFileSave`, matcher is a regex on the file path, action `type: command` | `npm test` when `src/*.js` is saved; `node --check` on source modules when any `.js` is saved |
| [MCP](https://kiro.dev/docs/mcp/configuration/) | `.kiro/settings/mcp.json` | Workspace-level `mcpServers` object | `fetch` server via `uvx mcp-server-fetch` |

## Kiro IDE, CLI, Web, Crew?

**Used: Kiro IDE 1.4.86 on Linux, Free plan.** The project was first authored outside Kiro with the `.kiro/` files above already in place; the real Kiro session then ran Spec mode on that repo (see below).

**Not used: Kiro CLI, Kiro Web, Kiro Crew.** I have not compared them on this project.

<!-- TODO(kiro-credits): try the same digest.md change via Kiro CLI and note how agent hooks / MCP differ from the IDE. -->

## Custom agents

**Not used.** No custom agents were created or invoked in IDE, CLI, Web, or Crew.

<!-- TODO(kiro-credits): add a custom agent that only edits specs + tests, and one that only runs parser work, then record which surface they ran in. -->

## Agent hooks

Two `PostFileSave` hooks ship in `.kiro/hooks/`:

1. `run-tests-on-save.json` — matcher `(^|/)src/.*\.js$`, runs `npm test`.
2. `check-syntax-on-save.json` — matcher `\.js$`, runs `node --check` over `src/*.js`.

Both were recognized in the **Agent Hooks** panel. Kiro wrote `"enabled": true` into `run-tests-on-save.json`. When I saved a file under `src/` by hand, I **did not** see the run-tests hook fire. I have not isolated the cause yet (matcher vs. save path vs. IDE session).

So: hooks are configured and enabled; they did **not** improve the day-to-day loop in the session I ran, because they did not fire on manual save.

<!-- TODO(kiro-credits): re-test hooks after a clean IDE reopen; try saving via Kiro's own edit so the PostFileSave path is the one Kiro owns. -->

## Spec-driven development

This is the part that actually shipped code through Kiro.

I asked in **Spec mode** for a Markdown export of the digest. Kiro:

1. Added **requirement 7** (EARS) to `.kiro/specs/digest-summaries/requirements.md`: *WHEN the user requests `GET /api/digest.md`, THE SYSTEM SHALL return a Markdown document with content-type `text/markdown`, built using the same digest logic…*
2. Added **task 6** to `.kiro/specs/digest-summaries/tasks.md`.
3. Implemented it: `digestToMarkdown` in `src/poller.js`, the `GET /api/digest.md` route in `src/server.js`, and a test in `test/app.test.js`.
4. Asked for approval, ran `npm test`, and got a green suite (was 12/12 at that moment; the suite is now 13/13 after a later auto-demo seed test).

One of its edits to `src/server.js` broke the file; Kiro noticed and fixed it itself before the tests passed. The whole run used about **4.4 credits**.

Compared with vibe coding: the EARS requirement and the checkbox task list forced a clear acceptance surface (`text/markdown`, same digest logic, content-type header) before any code landed. That is what kept the Markdown export aligned with `GET /api/digest` instead of inventing a parallel formatter. The three specs under `.kiro/specs/` (feed-ingestion, digest-summaries, opml-import) are the same shape; only the digest.md change was driven end-to-end inside Spec mode.

![Spec in progress](kiro-shots/01-spec-in-progress.png)
![Code changes and test approval](kiro-shots/02-code-changes-and-test-approval.png)
![Implementation summary](kiro-shots/03-spec-impl-summary.png)
![server.js diff](kiro-shots/04-code-diff-server-js.png)

<!-- TODO(kiro-credits): drive a second feature (e.g. per-feed mute) fully through Spec mode, including a new requirements/design/tasks triad. -->

## Steering docs

Three steering files load into Kiro:

- `product.md` (`inclusion: always`) — Resurrection tone, offline-first demo, no account wall.
- `tech.md` (`inclusion: always`) — Node ≥20, no build step, parsers never throw, no secrets in repo.
- `structure.md` (`inclusion: fileMatch` on `src/**/*.js` and `test/**/*.js`) — module map.

They kept Kiro on the existing stack during the digest.md run (no sudden TypeScript rewrite, no new framework). The biggest practical win was **tech.md's "parsers never throw"** rule, which matches `parseFeed`'s return-an-`error`-field style and stopped Kiro from "helpfully" throwing on bad XML.

<!-- TODO(kiro-credits): add a steering doc for test style (node:test + fast-check) and measure whether Kiro starts writing property tests on its own. -->

## MCP

`.kiro/settings/mcp.json` registers a workspace `fetch` server (`uvx mcp-server-fetch`). It connected and exposed 1 tool. Kiro called `@fetch/fetch` on a real feed URL; the tool refused the request because DNS in this sandbox resolved the host to `198.18.0.1`, a reserved address the fetch server blocks. So MCP was wired up and invoked, but it did **not** return feed content here, and it did not unblock any feature that would have been impossible without it.

![Hooks and MCP panel](kiro-shots/06-hooks-and-mcp-panel-final.png)
![MCP fetch call](kiro-shots/09-mcp-call.png)

<!-- TODO(kiro-credits): re-try fetch MCP outside the 198.18.0.1 sandbox, or add an MCP that talks to the local Haunted Feeds API instead of the public net. -->

## Property-based testing (PBT)

PBT is in the repo and runs under `npm test`, but **Kiro did not write it**. I authored the fast-check properties from the correctness notes in `.kiro/specs/feed-ingestion/design.md`:

- P1 `dedupe` is idempotent, yields unique ids, preserves order.
- P2 `normalizeUrl` is idempotent and ignores `utm_source` / fragments.
- P3 a generated RSS feed with k distinct guids yields exactly k items, and the parser never throws.

PBT did catch real issues earlier in development around dedupe/URL normalization. It is also slightly flaky on P3 when a generated guid looks like scientific notation (e.g. `e0`), which `fast-xml-parser` can coerce to a number — that is a known generator gap, not a Kiro finding.

<!-- TODO(kiro-credits): ask Kiro Spec mode to add a property for OPML round-trip and for digest.md ≡ digest JSON content. -->

## Kiro powers

**Not used.** No bundled Powers and no third-party Power integrations.

<!-- TODO(kiro-credits): try a Node/testing Power if one fits, and note whether it changes how specs or hooks get authored. -->

## Regression found after deploy (not via Kiro)

Valid Atom feeds with lots of escaped HTML (e.g. blog.rust-lang.org) were rejected as `invalid-xml` because fast-xml-parser's default `maxTotalExpansions` (1000) counts standard entities. The fix (commit df40def) raises that cap while keeping DOCTYPE entity limits strict. `test/fixtures/atom-escaped-html.xml` covers it.

## How a Kiro user uses these files

- **Steering:** open the repo in Kiro. Files marked `always` load into every interaction; `structure.md` loads when you work on files matching its pattern.
- **Specs:** they appear under Specs in the Kiro panel. `tasks.md` is what Kiro's task execution interface tracks.
- **Hooks:** `.kiro/hooks/*.json` activate when a session starts; set `"enabled": false` to switch one off.
- **MCP:** Kiro merges `.kiro/settings/mcp.json` with the user-level config. The fetch server needs `uv` (`uvx`) installed.

Links: [repo](https://github.com/lxivlog64/rss-resurrected) · [live demo](https://rss-resurrected-lxivlog64.onrender.com) · [video](https://youtu.be/kT7sllgMBfc)
