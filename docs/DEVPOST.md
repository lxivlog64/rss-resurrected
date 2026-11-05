# Devpost submission — Haunted Feeds (RSS Resurrected)

**Category:** Resurrection
**Tagline:** RSS isn't dead, it was just sleeping. Your favorite sites, resurrected into one AI-summarized daily digest.

## Inspiration
Social algorithms decide what we read. RSS is an open, tracker-free way to follow the web, and it still works. It just needed a modern, friendly front end.

## What it does
Haunted Feeds follows RSS and Atom feeds (or a whole OPML file), polls them on a schedule, removes duplicate posts and tracking parameters, and shows a spooky daily digest with 2-sentence summaries. It works with no API key (offline demo plus extractive summaries). An OpenAI-compatible key turns on LLM summaries.

## How we built it
Node.js with no build step, `fast-xml-parser`, a single-file HTML UI, and JSON-file storage. The repo is set up for Kiro in `.kiro/`: steering ×3 (product, tech, structure), specs ×3 with EARS requirements / design / tasks, two PostFileSave hooks, and a fetch MCP server config.

## How I used Kiro
- **IDE / CLI / Web / Crew:** Kiro IDE 1.4.86 on the Free plan only. CLI, Web, and Crew not tried on this project.
- **Custom agents:** not used.
- **Agent hooks:** two `PostFileSave` hooks (run `npm test` on `src/` saves; `node --check` on `.js` saves) show as enabled in the Agent Hooks panel, but I did not see the test hook fire on a manual save.
- **Spec-driven:** Spec mode added requirement 7 and task 6 to `digest-summaries`, then implemented `GET /api/digest.md` (`digestToMarkdown`, the route, and a test). It ran `npm test` (12/12 at the time; suite is now 13/13), broke one edit to `server.js`, and fixed it itself — about 4.4 credits. Compared with vibe coding, the EARS acceptance criteria kept the Markdown export on the same digest logic as the JSON endpoint.
- **Steering:** always-on product/tech docs plus a fileMatch structure map. The tech.md rule "parsers never throw" stopped Kiro from rewriting `parseFeed` to throw on bad XML.
- **MCP:** workspace `fetch` via `uvx mcp-server-fetch` connected and Kiro called it; sandbox DNS resolved the host to `198.18.0.1`, so the call was refused.
- **PBT:** fast-check properties for dedupe, URL normalization, and generated-RSS parsing are in `npm test`, written by me, not by Kiro.
- **Powers:** not used.

Screenshots and the same answers in long form: `docs/KIRO_USAGE.md`.

## Challenges
Real feeds are messy: RSS 1.0 vs 2.0 vs Atom, HTML inside descriptions, tracking links. Property-based tests (fast-check) check dedupe and URL normalization. After deploy, valid feeds with lots of escaped HTML (e.g. the Rust blog) hit the XML parser's entity-expansion limit; fixed with a regression fixture.

## Accomplishments
Zero-config demo, LLM summaries that fall back cleanly, round-trip OPML, 13 passing tests, including 3 property tests, a parser regression test, the Kiro-built Markdown export test, and an auto-demo seed test.

## What's next
Email or web-push digests, per-feed mute rules, full-text extraction.

## Links
- Repo: https://github.com/lxivlog64/rss-resurrected
- App: https://rss-resurrected.onrender.com
- Video: https://youtu.be/kT7sllgMBfc
- Blog: <DEVTO_URL>  <!-- TODO -->
- Social: <X_POST_URL>  <!-- TODO -->
