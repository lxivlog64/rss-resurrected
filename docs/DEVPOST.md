# Devpost submission — Haunted Feeds (RSS Resurrected)

**Category:** Resurrection
**Tagline:** RSS isn't dead, it was just sleeping. Your favorite sites, resurrected into one AI-summarized daily digest.

## Inspiration
Social algorithms decide what we read. RSS is an open, tracker-free way to follow the web, and it still works. It just needed a modern, friendly front end.

## What it does
Haunted Feeds follows RSS and Atom feeds (or a whole OPML file), polls them on a schedule, removes duplicate posts and tracking parameters, and shows a spooky daily digest with 2-sentence summaries. It works with no API key (offline demo plus extractive summaries). An OpenAI-compatible key turns on LLM summaries.

## How we built it
Node.js with no build step, `fast-xml-parser`, a single-file HTML UI, and JSON-file storage. The repo is set up for Kiro in `.kiro/`: steering (product, tech, structure), three specs with EARS requirements, design properties and task lists, two PostFileSave hooks, and a fetch MCP server config.

In Kiro IDE 1.4.86 (Free plan) I used Spec mode to add a feature: Kiro wrote requirement 7 and task 6 into the digest-summaries spec, then implemented `GET /api/digest.md` (`digestToMarkdown`, the route, and a test). It ran `npm test` (12/12 passing) and fixed one broken edit of its own along the way, for about 4.4 credits. Both hooks appear as enabled in the Agent Hooks panel, though I didn't see the test hook fire on a manual save. The fetch MCP server connected and Kiro invoked it, but it refused the request because my sandbox's DNS resolved the host to 198.18.0.1. The fast-check property tests are mine, not Kiro's. Screenshots and details: `docs/KIRO_USAGE.md`.

## Challenges
Real feeds are messy: RSS 1.0 vs 2.0 vs Atom, HTML inside descriptions, tracking links. Property-based tests (fast-check) check dedupe and URL normalization. After deploy, valid feeds with lots of escaped HTML (e.g. the Rust blog) hit the XML parser's entity-expansion limit; fixed with a regression fixture.

## Accomplishments
Zero-config demo, LLM summaries that fall back cleanly, round-trip OPML, 12 passing tests, including 3 property tests, a parser regression test, and the Kiro-built Markdown export test.

## What's next
Email or web-push digests, per-feed mute rules, full-text extraction.

## Links
- Repo: https://github.com/lxivlog64/rss-resurrected
- App: https://rss-resurrected.onrender.com
- Video: https://youtu.be/chdW0IqvuTw
- Blog: <DEVTO_URL>  <!-- TODO -->
- Social: <X_POST_URL>  <!-- TODO -->
