# Devpost submission — Haunted Feeds (RSS Resurrected)

**Category:** Resurrection
**Tagline:** RSS isn't dead, it was just sleeping. Your favorite sites, resurrected into one AI-summarized daily digest.

## Inspiration
Social algorithms decide what we read. RSS is an open, tracker-free way to follow the web, and it still works. It just needed a modern, friendly front end.

## What it does
Haunted Feeds follows RSS and Atom feeds (or a whole OPML file), polls them on a schedule, removes duplicate posts and tracking parameters, and shows a spooky daily digest with 2-sentence summaries. It works with no API key (offline demo plus extractive summaries). An OpenAI-compatible key turns on LLM summaries.

## How we built it
Node.js with no build step, `fast-xml-parser`, a single-file HTML UI, and JSON-file storage. Structured for Kiro in `.kiro/`: steering (product, tech, structure), three specs with EARS requirements, design properties and task lists, PostFileSave hooks that run tests and a syntax check, and a fetch MCP server config. See `docs/KIRO_USAGE.md`.

## Challenges
Real feeds are messy: RSS 1.0 vs 2.0 vs Atom, HTML inside descriptions, tracking links. Property-based tests (fast-check) check dedupe and URL normalization. After deploy, valid feeds with lots of escaped HTML (e.g. the Rust blog) hit the XML parser's entity-expansion limit; fixed with a regression fixture.

## Accomplishments
Zero-config demo, LLM summaries that fall back cleanly, round-trip OPML, 10 passing tests including 3 property tests and a parser regression test.

## What's next
Email or web-push digests, per-feed mute rules, full-text extraction.

## Links
- Repo: https://github.com/lxivlog64/rss-resurrected
- App: https://rss-resurrected.onrender.com
- Video: https://youtu.be/chdW0IqvuTw
- Blog: <DEVTO_URL>  <!-- TODO -->
- Social: <X_POST_URL>  <!-- TODO -->
