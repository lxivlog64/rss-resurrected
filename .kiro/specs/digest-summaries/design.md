# Design: Digest & summaries
- `extractiveSummary(text, n=2)`: split sentences, score by non-stopword frequency / sqrt(length), +0.5 lead bonus, pick top n, restore original order.
- `summarize(item, env)`: LLM path only when key set and text > 200 chars; `AbortSignal.timeout(20000)`; any failure → extractive.
- `buildDigest(store, {hours, now})`: filter by `published || fetchedAt` ≥ cutoff, sort desc, group by `feedTitle`.
- Demo: `demoFetch` serves `demo://` URLs from `src/demo.js`, otherwise real `fetch`.
- UI badge: 🧠 AI vs 🦇 extractive.
