# 🎃 Haunted Feeds — RSS Resurrected

RSS isn't dead, it was just sleeping. Haunted Feeds is a small, self-hosted RSS/Atom reader that turns the sites you follow into one daily digest with short summaries, wrapped in a Halloween UI. Made for **Kiroween 2026** (category: Resurrection); see `.kiro/` and the Kiro section below.

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
[`/.kiro`](.kiro) holds steering (product, tech, structure), three specs with EARS requirements/design/tasks, two `PostFileSave` hooks and a workspace MCP config (`fetch`).

In Kiro IDE 1.4.86 (Free plan), Spec mode added requirement 7 and task 6 to the `digest-summaries` spec and implemented `GET /api/digest.md` (`digestToMarkdown`, route, test). It ran `npm test` (12/12) and fixed one broken edit of its own on the way, for about 4.4 credits. Both hooks show as enabled in the Agent Hooks panel, but I didn't see the test hook fire on a manual save. The fetch MCP server connected and Kiro called it, but my sandbox's DNS (198.18.0.1) made it refuse the request. Details and screenshots: [docs/KIRO_USAGE.md](docs/KIRO_USAGE.md).

## License
MIT
