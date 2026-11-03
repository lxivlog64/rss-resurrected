import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'node:crypto';

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@', textNodeName: '#text' });
const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const text = (v) => (v == null ? '' : typeof v === 'object' ? String(v['#text'] ?? '') : String(v)).trim();

export function stripHtml(s) {
  return String(s ?? '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

export function normalizeUrl(u) {
  try {
    const url = new URL(String(u).trim());
    url.hash = '';
    for (const k of [...url.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/i.test(k)) url.searchParams.delete(k);
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch { return String(u ?? '').trim(); }
}

export function itemKey(item) {
  const basis = item.guid || (item.link ? normalizeUrl(item.link) : '') || `${item.title}|${item.published}`;
  return createHash('sha1').update(basis).digest('hex').slice(0, 16);
}

function toDate(s) { const d = new Date(s); return isNaN(d) ? null : d.toISOString(); }

/** Parse RSS 2.0 / RSS 1.0 (RDF) / Atom into {title, link, items[]}. Never throws on bad input. */
export function parseFeed(xmlText, feedUrl = '') {
  let doc;
  try { doc = xml.parse(String(xmlText ?? '')); } catch { return { title: '', link: feedUrl, items: [], error: 'invalid-xml' }; }
  if (!doc || typeof doc !== 'object') return { title: '', link: feedUrl, items: [], error: 'unknown-format' };
  let title = '', link = feedUrl, raw = [];
  if (doc.rss?.channel) {
    const ch = arr(doc.rss.channel)[0] ?? {};
    title = text(ch.title); link = text(arr(ch.link)[0]) || feedUrl;
    raw = arr(ch.item).map((i) => ({
      title: text(i.title), link: text(arr(i.link)[0]), guid: text(i.guid),
      published: toDate(text(i.pubDate) || text(i['dc:date'])),
      content: text(i['content:encoded']) || text(i.description),
    }));
  } else if (doc.feed) {
    const f = doc.feed;
    title = text(f.title);
    const pick = (links) => { const l = arr(links); const alt = l.find((x) => !x?.['@rel'] || x['@rel'] === 'alternate'); return (alt ?? l[0])?.['@href'] ?? text(alt); };
    link = pick(f.link) || feedUrl;
    raw = arr(f.entry).map((e) => ({
      title: text(e.title), link: pick(e.link) || '', guid: text(e.id),
      published: toDate(text(e.published) || text(e.updated)),
      content: text(e.content) || text(e.summary),
    }));
  } else if (doc['rdf:RDF']) {
    const r = doc['rdf:RDF'];
    title = text(arr(r.channel)[0]?.title);
    raw = arr(r.item).map((i) => ({ title: text(i.title), link: text(i.link), guid: text(i['@rdf:about']), published: toDate(text(i['dc:date'])), content: text(i.description) }));
  } else return { title: '', link: feedUrl, items: [], error: 'unknown-format' };

  const items = raw.map((i) => {
    const content = stripHtml(i.content);
    const it = { title: stripHtml(i.title) || content.slice(0, 80) || '(untitled)', link: i.link ? normalizeUrl(i.link) : '', guid: i.guid, published: i.published, content };
    return { ...it, id: itemKey(it) };
  });
  return { title: stripHtml(title) || feedUrl, link, items: dedupe(items) };
}

/** Remove duplicates by id, keeping the first occurrence. Idempotent and order-preserving. */
export function dedupe(items) {
  const seen = new Set();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}
