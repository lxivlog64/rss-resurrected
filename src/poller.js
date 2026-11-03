import { parseFeed } from './parser.js';
import { summarize } from './summarize.js';

export async function pollFeed(store, feed, { fetchImpl = fetch, env = process.env } = {}) {
  try {
    const r = await fetchImpl(feed.url, { headers: { 'user-agent': 'HauntedFeeds/1.0 (+RSS resurrected)' }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const parsed = parseFeed(await r.text(), feed.url);
    if (parsed.error) throw new Error(parsed.error);
    let added = 0;
    for (const it of parsed.items.slice(0, 30)) {
      if (store.hasItem(it.id)) continue;
      const { summary, method } = await summarize(it, env);
      store.putItem({ ...it, content: it.content.slice(0, 4000), summary, method, feedUrl: feed.url, feedTitle: parsed.title, fetchedAt: new Date().toISOString() });
      added++;
    }
    if (feed.title === feed.url) feed.title = parsed.title;
    Object.assign(feed, { lastPolled: new Date().toISOString(), error: null });
    store.save();
    return added;
  } catch (e) {
    Object.assign(feed, { lastPolled: new Date().toISOString(), error: String(e.message || e) });
    store.save();
    return 0;
  }
}

export async function pollAll(store, opts) {
  let total = 0;
  for (const f of store.feeds) total += await pollFeed(store, f, opts);
  return total;
}

/** Items from the last `hours`, grouped by feed, newest first. */
export function buildDigest(store, { hours = 24, now = Date.now() } = {}) {
  const cutoff = now - hours * 3600e3;
  const items = store.items().filter((i) => new Date(i.published || i.fetchedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(b.published || b.fetchedAt) - new Date(a.published || a.fetchedAt));
  const groups = {};
  for (const i of items) (groups[i.feedTitle] ??= []).push(i);
  return { generatedAt: new Date(now).toISOString(), hours, count: items.length, groups };
}
