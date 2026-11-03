import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';

export class Store {
  constructor(file) { this.file = file; this.data = { feeds: [], items: {} }; if (file) try { this.data = JSON.parse(readFileSync(file, 'utf8')); } catch {} }
  save() { if (!this.file) return; mkdirSync(dirname(this.file), { recursive: true }); writeFileSync(this.file + '.tmp', JSON.stringify(this.data)); renameSync(this.file + '.tmp', this.file); }
  get feeds() { return this.data.feeds; }
  addFeed(url, title = url) { if (this.data.feeds.some((f) => f.url === url)) return false; this.data.feeds.push({ url, title, lastPolled: null, error: null }); this.save(); return true; }
  removeFeed(url) { this.data.feeds = this.data.feeds.filter((f) => f.url !== url); for (const [k, v] of Object.entries(this.data.items)) if (v.feedUrl === url) delete this.data.items[k]; this.save(); }
  hasItem(id) { return id in this.data.items; }
  putItem(item) { this.data.items[item.id] = item; }
  items() { return Object.values(this.data.items); }
}
