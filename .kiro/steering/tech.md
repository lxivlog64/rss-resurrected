---
inclusion: always
---
# Tech
- Node.js >= 20, ES modules, no build step. Only runtime dep: `fast-xml-parser`. Dev dep: `fast-check`.
- HTTP via `node:http`; tests via `node:test` (`npm test`). Property-based tests with fast-check for parser/dedupe/URL logic.
- LLM calls use an OpenAI-compatible `/chat/completions` endpoint (`OPENAI_BASE_URL`, `LLM_MODEL`); always fall back to extractive on error/timeout.
- Never log or commit secrets. Config only via env vars.
- Parser functions must never throw on malformed input; return `{ error }` instead.
