# 🎃 Haunted Feeds — RSS Resurrected

RSS isn't dead, it was just sleeping. Haunted Feeds is a small, self-hosted RSS/Atom reader that turns the sites you follow into one daily digest with short summaries, wrapped in a Halloween UI. Organized for [Kiro](https://kiro.dev) (see `.kiro/`) for **Kiroween 2026** (category: Resurrection).

**Live demo:** https://rss-resurrected.onrender.com (free tier, first load may take ~50 s)  
**Video:** https://youtu.be/chdW0IqvuTw

## Features
- Follow RSS 2.0, RSS 1.0 (RDF) and Atom feeds; links are de-tracked and items de-duplicated across polls
- OPML import and export
- Background polling (`POLL_MINUTES`, default 30) or "Poll now"
- Digest for the last 24 h, 3 days or a week, grouped by site
- **Works without an API key**: bundled demo feeds and offline extractive summaries
- Optional LLM summaries through any OpenAI-compatible API

## Run
```bash
npm install && npm start        # http://localhost:3000, then click "👻 Load demo"
npm test                        # unit + property-based tests (fast-check)
docker build -t haunted-feeds . && docker run -p 3000:3000 -v hf:/data haunted-feeds
```

## Configuration (env vars)
| Var | Default | Purpose |
|---|---|---|
| `PORT` | 3000 | HTTP port |
| `DATA_FILE` | `data/store.json` | Persistence file |
| `POLL_MINUTES` | 30 | Background poll interval |
| `OPENAI_API_KEY` | unset | Enables LLM summaries |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Any OpenAI-compatible endpoint |
| `LLM_MODEL` | `gpt-4o-mini` | Model name |

## API
`GET/POST/DELETE /api/feeds`, `POST /api/poll`, `POST /api/demo`, `GET /api/digest?hours=24`, `POST|GET /api/opml`, `GET /api/health`.

## Kiro
See [`/.kiro`](.kiro) (steering, specs, hooks, MCP) and [docs/KIRO_USAGE.md](docs/KIRO_USAGE.md).

## License
MIT
