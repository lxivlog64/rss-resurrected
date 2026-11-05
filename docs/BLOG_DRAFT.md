---
title: "Resurrecting RSS for Kiroween: Haunted Feeds, a spec-driven feed reader"
tags: kiro, hackathon, rss, ai
---

This post was written as part of the Kiroween 2026 hackathon.

RSS never died. Podcasts still run on it, and most blogs still publish a feed. What went away was the habit of reading feeds. For Kiroween's **Resurrection** category I built **Haunted Feeds**, a small self-hosted reader that turns the sites you follow into one daily digest with short summaries, in a Halloween costume.

- 🎃 Live demo: https://rss-resurrected-lxivlog64.onrender.com (free tier, the first load can take ~50 s)
- 🎥 Video (under 3 min): https://youtu.be/kT7sllgMBfc
- 💾 Code (MIT): https://github.com/lxivlog64/rss-resurrected

## What it does
- Follows RSS 2.0, RSS 1.0 and Atom feeds, imports and exports OPML
- Removes tracking parameters from links and de-duplicates items across polls
- Builds a digest for the last 24 hours, 3 days or a week, grouped by site
- Runs with **no API key**: offline demo feeds and an extractive summarizer. Set `OPENAI_API_KEY` to get LLM summaries, with automatic fallback if the API fails

## How the project is set up for Kiro
Everything Kiro reads lives in the `.kiro/` folder of the repo, in the formats described in the [Kiro docs](https://kiro.dev/docs/). If you open the repo in Kiro, this is what you get:

**Steering** ([docs](https://kiro.dev/docs/steering/)). `.kiro/steering/` has the three foundation files Kiro defines: `product.md` (goal, zero-key requirement, tone), `tech.md` (Node 20, no build step, parsers must never throw, no secrets in code) and `structure.md` (module map). `product.md` and `tech.md` use `inclusion: always`; `structure.md` uses `inclusion: fileMatch` so it only loads when you work in `src/` or `test/`.

**Specs** ([docs](https://kiro.dev/docs/specs/)). Each feature has the standard trio in `.kiro/specs/<feature>/`: `requirements.md` with user stories and EARS acceptance criteria, `design.md`, and a `tasks.md` checklist. There are three: `feed-ingestion`, `digest-summaries` and `opml-import`. A typical criterion:

> WHEN a feed is re-polled, THE SYSTEM SHALL NOT store an item whose id already exists.

Writing the EARS lines first forced edge cases into the open: what counts as the same item, what happens with malformed XML (record an error, never throw), what to do with non-http URLs (HTTP 400). In Kiro, the tasks list in `tasks.md` is what its task execution UI tracks.

**Correctness properties.** The feed-ingestion design lists properties that the code must satisfy, and `test/parser.test.js` checks them with fast-check: de-duplication is idempotent and order-preserving, URL normalization is idempotent and ignores `utm_*` and fragments, and the parser never throws on generated feeds.

**Hooks** ([docs](https://kiro.dev/docs/hooks/)). Two `v1` hook files in `.kiro/hooks/` use the `PostFileSave` trigger. One runs `npm test` when a file under `src/` is saved; the other runs `node --check` on the source modules when any `.js` file is saved.

**MCP** ([docs](https://kiro.dev/docs/mcp/configuration/)). `.kiro/settings/mcp.json` is a workspace MCP config with the `fetch` server (`uvx mcp-server-fetch`), so the agent can pull a real feed when you ask it to look at one.

## A real bug: escaped HTML vs. entity limits
After deploying, the Rust blog's Atom feed (`https://blog.rust-lang.org/feed.xml`) showed up as `invalid-xml`, even though it is perfectly valid. The cause: fast-xml-parser counts every standard entity (`&lt;`, `&amp;`…) toward a default limit of 1,000 expansions per document, a guard against "billion laughs" attacks. Blogs that put escaped HTML in `<content type="html">` easily go past that; this one had about 1,400. Standard entities can't recurse, so the fix raises only the total-expansion cap and keeps the DOCTYPE entity size and depth limits strict. A fixture with the same shape is now a regression test, which failed before the fix and passes after it. The steering rule "parsers must never throw" is why this surfaced as an error on the feed rather than a crash.

## Try it
```bash
git clone https://github.com/lxivlog64/rss-resurrected
cd rss-resurrected && npm install && npm start   # http://localhost:3000
npm test                                          # 10 tests incl. 3 property tests
```
Or open https://rss-resurrected-lxivlog64.onrender.com and click **👻 Load demo**. Happy Kiroween 🎃
