import { XMLParser } from 'fast-xml-parser';
const p = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

/** Extract feed subscriptions from OPML (nested outlines supported). */
export function parseOpml(text) {
  let doc;
  try { doc = p.parse(String(text ?? '')); } catch { throw new Error('Invalid OPML'); }
  const body = doc?.opml?.body;
  if (!body) throw new Error('Invalid OPML: missing <body>');
  const out = []; const seen = new Set();
  const walk = (node) => {
    for (const o of [].concat(node ?? [])) {
      if (!o || typeof o !== 'object') continue;
      const url = o.xmlUrl || o.xmlurl;
      if (url && /^(https?|demo):\/\//i.test(url) && !seen.has(url)) { seen.add(url); out.push({ url, title: o.title || o.text || url }); }
      walk(o.outline);
    }
  };
  walk(body.outline);
  return out;
}

export function toOpml(feeds) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0"><head><title>Haunted Feeds</title></head><body>\n${feeds.map((f) => `  <outline type="rss" text="${esc(f.title)}" title="${esc(f.title)}" xmlUrl="${esc(f.url)}"/>`).join('\n')}\n</body></opml>\n`;
}
