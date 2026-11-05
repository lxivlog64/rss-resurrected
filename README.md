# 🎃 Haunted Feeds — RSS Resurrected

RSS isn't dead, it was just sleeping. Haunted Feeds is a small, self-hosted RSS/Atom reader that turns the sites you follow into one daily digest with short summaries, wrapped in a Halloween UI. Made for **Kiroween 2026** (category: Resurrection); see `.kiro/` and the Kiro section below.

**Live demo:** https://rss-resurrected.onrender.com (free tier, first load may take ~50 s)  
**Video:** https://youtu.be/kT7sllgMBfc

## Features
- Follow RSS 2.0, RSS 1.0 (RDF) and Atom feeds; links are de-tracked and items de-duplicated across polls
- OPML import and export
- Background polling (`POLL_MINUTES`, default 30) or "Poll now"
- Digest for the last 24 h, 3 days or a week, grouped by site
- **Works without an API key**: bundled demo feeds and offline extractive summaries
- Optional LLM summaries through any OpenAI-compatible API

## Run
```bash
npm install && npm start        # http://localhost:3000 (empty store auto-seeds demo; or click "👻 Load demo")
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
| `AUTO_DEMO` | `1` | On empty store, auto-load bundled demo feeds at startup; set `0` to disable |

## API
`GET/POST/DELETE /api/feeds`, `POST /api/poll`, `POST /api/demo`, `GET /api/digest?hours=24`, `POST|GET /api/opml`, `GET /api/health`.

## How Kiro was used
[`/.kiro`](.kiro) holds steering ×3 (product, tech, structure), specs ×3 with EARS requirements/design/tasks, two `PostFileSave` hooks, and a workspace MCP config (`fetch`). Full write-up answering each Kiroween judging prompt: [docs/KIRO_USAGE.md](docs/KIRO_USAGE.md).

| Area | What happened |
|---|---|
| IDE / CLI / Web / Crew | **Kiro IDE 1.4.86** (Free plan) only. CLI, Web, and Crew not tried. |
| Custom agents | Not used. |
| Agent hooks | Two hooks enabled in the panel; did **not** fire on a manual save. |
| Spec-driven | Spec mode added req 7 + task 6 and implemented `GET /api/digest.md` (~4.4 credits); fixed one broken edit itself. |
| Steering | product/tech always-on; structure on `src/**`/`test/**`. tech.md "parsers never throw" kept the stack stable. |
| MCP | `fetch` connected and was invoked; sandbox DNS `198.18.0.1` refused the call. |
| PBT (fast-check) | In `npm test`, **authored by me**, not by Kiro. |
| Powers | Not used. |

`npm test` is currently **13/13** (unit + property + the auto-demo seed test).

## License
MIT
