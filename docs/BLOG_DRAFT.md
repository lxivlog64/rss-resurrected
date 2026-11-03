---
title: "Resurrecting RSS with Kiro: Haunted Feeds"
tags: kiro, hackathon, rss, javascript
---

This post was written as part of the Kiroween 2026 hackathon.

RSS never died. Podcasts still run on it, and most blogs still publish a feed. What went away was the habit of reading feeds. For Kiroween's **Resurrection** category I built **Haunted Feeds**, a small self-hosted reader that turns the sites you follow into one daily digest with short summaries, in a Halloween costume.

## What it does
- Follows RSS 2.0, RSS 1.0 and Atom feeds, imports and exports OPML
- Removes tracking parameters from links and de-duplicates items across polls
- Builds a digest for the last 24 hours, 3 days or a week, grouped by site
- Runs with **no API key**: offline demo feeds and an extractive summarizer. Set `OPENAI_API_KEY` to get LLM summaries, with automatic fallback if the API fails

## How I built it with Kiro
I started with specs instead of code. Each core feature (feed ingestion, digest and summaries, OPML) has a `requirements.md` written in EARS ("WHEN a feed is re-polled, THE SYSTEM SHALL NOT store an item whose id already exists"), a `design.md` and a `tasks.md`. Steering files describe the product, the stack rules and the module layout. A hook runs `npm test` every time I save a source file.

<!-- TODO(confirm): describe your real experience running the specs/tasks in Kiro; keep only what happened. -->

## The bug property-based testing caught
The design lists correctness properties, such as "URL normalization is idempotent". I turned them into fast-check tests. On the first run, fast-check shrank a failure to `http://a.aa//`: one pass removed one trailing slash and a second pass gave a different result, so the same article could get two ids. The fix was to collapse all trailing slashes at once. I would not have written that example by hand.

## Try it
```bash
git clone https://github.com/lxivlog64/rss-resurrected
cd rss-resurrected && npm install && npm start
```
Click **👻 Load demo**. MIT licensed. Happy Kiroween 🎃
