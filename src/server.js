import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.js';
import { pollAll, pollFeed, buildDigest, digestToMarkdown } from './poller.js';
import { parseOpml, toOpml } from './opml.js';
import { DEMO_FEEDS, demoFetch } from './demo.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = () => readFileSync(join(root, 'public/index.html'));

export function createApp({ store, fetchImpl = demoFetch, env = process.env } = {}) {
  const opts = { fetchImpl, env };
  const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
  const body = (req) => new Promise((ok, bad) => { let d = ''; req.on('data', (c) => { d += c; if (d.length > 2e6) bad(new Error('too large')); }); req.on('end', () => ok(d)); });
  return createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x');
    try {
      if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/index.html')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(indexHtml()); }
      if (req.method === 'GET' && u.pathname === '/api/health') return json(res, 200, { ok: true, llm: !!env.OPENAI_API_KEY });
      if (req.method === 'GET' && u.pathname === '/api/feeds') return json(res, 200, store.feeds);
      if (req.method === 'POST' && u.pathname === '/api/feeds') {
        const { url } = JSON.parse((await body(req)) || '{}');
        if (!url || !/^(https?|demo):\/\//.test(url)) return json(res, 400, { error: 'url must be http(s)' });
        store.addFeed(url); const f = store.feeds.find((x) => x.url === url);
        const added = await pollFeed(store, f, opts); return json(res, 201, { feed: f, added });
      }
      if (req.method === 'DELETE' && u.pathname === '/api/feeds') { store.removeFeed(u.searchParams.get('url')); return json(res, 200, { ok: true }); }
      if (req.method === 'POST' && u.pathname === '/api/opml') {
        const feeds = parseOpml(await body(req)); let n = 0;
        for (const f of feeds) if (store.addFeed(f.url, f.title)) n++;
        return json(res, 200, { found: feeds.length, imported: n });
      }
      if (req.method === 'GET' && u.pathname === '/api/opml') { res.writeHead(200, { 'content-type': 'text/x-opml', 'content-disposition': 'attachment; filename="haunted-feeds.opml"' }); return res.end(toOpml(store.feeds)); }
      if (req.method === 'POST' && u.pathname === '/api/poll') return json(res, 200, { added: await pollAll(store, opts) });
      if (req.method === 'POST' && u.pathname === '/api/demo') { for (const url of Object.keys(DEMO_FEEDS)) store.addFeed(url); return json(res, 200, { added: await pollAll(store, opts) }); }
      const digestHours = () => Math.min(168, Number(u.searchParams.get('hours')) || 24);
      if (req.method === 'GET' && u.pathname === '/api/digest.md') { res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8' }); return res.end(digestToMarkdown(buildDigest(store, { hours: digestHours() }))); }
      if (req.method === 'GET' && u.pathname === '/api/digest') return json(res, 200, buildDigest(store, { hours: digestHours() }));
      json(res, 404, { error: 'not found' });
    } catch (e) { json(res, 400, { error: String(e.message || e) }); }
  });
}

/** If the store has no feeds, load the bundled demo feeds and poll them.
 *  Set AUTO_DEMO=0 to disable (useful for production with a real OPML). */
export async function seedDemoIfEmpty(store, { fetchImpl = demoFetch, env = process.env } = {}) {
  if (String(env.AUTO_DEMO ?? '1') === '0') return { seeded: false, reason: 'disabled' };
  if (store.feeds.length > 0) return { seeded: false, reason: 'already-has-feeds' };
  for (const url of Object.keys(DEMO_FEEDS)) store.addFeed(url);
  const added = await pollAll(store, { fetchImpl, env });
  return { seeded: true, feeds: store.feeds.length, added };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const store = new Store(process.env.DATA_FILE || join(root, 'data/store.json'));
  const port = Number(process.env.PORT) || 3000;
  seedDemoIfEmpty(store).then((r) => {
    if (r.seeded) console.log(`🎃 Auto-seeded ${r.feeds} demo feeds (${r.added} items)`);
  }).catch((e) => console.warn('auto-demo seed failed:', e.message || e));
  createApp({ store }).listen(port, () => console.log(`🎃 Haunted Feeds rising on http://localhost:${port} (LLM: ${process.env.OPENAI_API_KEY ? 'on' : 'off, extractive mode'})`));
  const mins = Number(process.env.POLL_MINUTES) || 30;
  setInterval(() => pollAll(store, { fetchImpl: demoFetch }).catch(() => {}), mins * 60e3).unref();
}
