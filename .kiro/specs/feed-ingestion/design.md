# Design: Feed ingestion
- `parseFeed(xml, url)` → `{title, link, items[], error?}` using fast-xml-parser; branches on `rss.channel`, `feed`, `rdf:RDF`.
- `normalizeUrl` uses WHATWG `URL`; strips tracking params, hash and trailing slashes on the path.
- `itemKey` = first 16 hex chars of sha1(guid || normalizedLink || title|date).
- `dedupe` keeps first occurrence (Set of ids) — order preserving, idempotent.
- `pollFeed` fetches with 15 s timeout and custom UA, caps 30 items per poll, summarizes only new items, saves atomically.
## Correctness properties (fast-check)
- P1 dedupe(dedupe(x)) = dedupe(x); output ids unique; output is ordered subsequence of input.
- P2 normalizeUrl idempotent; adding `utm_source` and a fragment does not change result.
- P3 generated RSS with k distinct guids yields exactly k items; parser never throws.
