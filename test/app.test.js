import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOpml, toOpml } from '../src/opml.js';
import { extractiveSummary } from '../src/summarize.js';
import { Store } from '../src/store.js';
import { createApp } from '../src/server.js';

test('OPML nested import + roundtrip', () => {
  const o = `<opml version="2.0"><body><outline text="Tech"><outline text="A" xmlUrl="https://a.com/feed"/><outline text="B" xmlUrl="https://b.com/rss"/></outline><outline text="A dup" xmlUrl="https://a.com/feed"/></body></opml>`;
  const feeds = parseOpml(o);
  assert.deepEqual(feeds.map((f) => f.url), ['https://a.com/feed', 'https://b.com/rss']);
  assert.deepEqual(parseOpml(toOpml(feeds)), feeds);
  assert.throws(() => parseOpml('<html/>'));
});
test('extractive summary is short and deterministic', () => {
  const t = 'RSS feeds are back in fashion among developers. The weather was cloudy today in the city. Developers love RSS feeds because RSS feeds respect developers. Cats sleep a lot during the long afternoon.';
  const s = extractiveSummary(t);
  assert.equal(s, extractiveSummary(t));
  assert.ok(s.length < t.length);
  assert.match(s, /RSS/);
});
test('API: demo -> digest works offline with no API key', async () => {
  const app = createApp({ store: new Store(null), env: {} }).listen(0);
  const base = `http://localhost:${app.address().port}`;
  try {
    const r = await (await fetch(`${base}/api/demo`, { method: 'POST' })).json();
    assert.equal(r.added, 4);
    const again = await (await fetch(`${base}/api/poll`, { method: 'POST' })).json();
    assert.equal(again.added, 0, 'no duplicates on re-poll');
    const d = await (await fetch(`${base}/api/digest?hours=24`)).json();
    assert.equal(d.count, 3);
    assert.ok(Object.values(d.groups).flat().every((i) => i.method === 'extractive' && i.summary));
    assert.equal((await fetch(`${base}/api/feeds`, { method: 'POST', body: '{"url":"ftp://x"}' })).status, 400);
    assert.equal((await fetch(base)).status, 200);
  } finally { app.close(); }
});

test('OPML import accepts built-in demo:// feeds', async () => {
  const { parseOpml } = await import('../src/opml.js');
  const r = parseOpml('<opml version="2.0"><body><outline xmlUrl="demo://crypt-chronicle"/><outline xmlUrl="ftp://x"/></body></opml>');
  assert.deepEqual(r.map((f) => f.url), ['demo://crypt-chronicle']);
});
