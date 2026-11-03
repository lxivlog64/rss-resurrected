import test from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { parseFeed, dedupe, normalizeUrl, itemKey } from '../src/parser.js';
import { DEMO_FEEDS } from '../src/demo.js';

test('parses RSS 2.0 and strips tracking params', () => {
  const f = parseFeed(DEMO_FEEDS['demo://crypt-chronicle']);
  assert.equal(f.title, 'The Crypt Chronicle');
  assert.equal(f.items.length, 2);
  assert.equal(f.items[0].link, 'https://example.com/crypt/rss-rises');
  assert.ok(!f.items[0].content.includes('<p>'));
});
test('parses Atom', () => {
  const f = parseFeed(DEMO_FEEDS['demo://haunted-atom']);
  assert.equal(f.title, 'Haunted Atom Weekly');
  assert.equal(f.items[0].link, 'https://example.com/atom/specs');
  assert.ok(f.items[0].published);
});
test('garbage input never throws', () => {
  for (const s of ['', 'nope', '<html></html>', '<rss><channel></channel></rss>', null]) assert.doesNotThrow(() => parseFeed(s));
});

const itemArb = fc.record({ title: fc.string(), link: fc.webUrl(), guid: fc.option(fc.string({ minLength: 1 }), { nil: '' }), published: fc.constant(null), content: fc.string() })
  .map((i) => ({ ...i, id: itemKey(i) }));

test('PBT: dedupe is idempotent, unique, order-preserving subset', () => {
  fc.assert(fc.property(fc.array(itemArb, { maxLength: 40 }), (items) => {
    const withDupes = [...items, ...items.slice(0, Math.ceil(items.length / 2))];
    const once = dedupe(withDupes);
    assert.deepEqual(dedupe(once), once);
    assert.equal(new Set(once.map((i) => i.id)).size, once.length);
    assert.equal(once.length, new Set(withDupes.map((i) => i.id)).size);
    let j = 0; for (const x of withDupes) if (j < once.length && x === once[j]) j++;
    assert.equal(j, once.length);
  }));
});
test('PBT: normalizeUrl is idempotent and ignores fragments/utm', () => {
  fc.assert(fc.property(fc.webUrl(), fc.string({ maxLength: 8 }), (u, frag) => {
    const n = normalizeUrl(u);
    assert.equal(normalizeUrl(n), n);
    const sep = u.includes('?') ? '&' : '?';
    assert.equal(normalizeUrl(`${u.split('#')[0]}${sep}utm_source=x#${encodeURIComponent(frag)}`), normalizeUrl(u.split('#')[0]));
  }));
});
test('PBT: parseFeed of generated RSS yields unique ids and never throws', () => {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  fc.assert(fc.property(fc.array(fc.record({ t: fc.string(), g: fc.stringMatching(/^[a-z0-9]{1,6}$/) }), { maxLength: 15 }), (rows) => {
    const xml = `<rss version="2.0"><channel><title>T</title>${rows.map((r) => `<item><title>${esc(r.t)}</title><guid>${r.g}</guid></item>`).join('')}</channel></rss>`;
    const f = parseFeed(xml);
    assert.equal(f.items.length, new Set(rows.map((r) => r.g)).size);
  }));
});

test('regression: Atom feed with >1000 escaped HTML entities parses (blog.rust-lang.org shape)', async () => {
  const { readFileSync } = await import('node:fs');
  const xmlText = readFileSync(new URL('./fixtures/atom-escaped-html.xml', import.meta.url), 'utf8');
  assert.ok((xmlText.match(/&[a-z]+;/g) || []).length > 1000);
  const f = parseFeed(xmlText, 'https://blog.example.org/feed.xml');
  assert.equal(f.error, undefined);
  assert.equal(f.title, 'Example Blog');
  assert.equal(f.items.length, 10);
  assert.ok(f.items[0].summary === undefined || !/&lt;/.test(JSON.stringify(f.items[0])));
});
