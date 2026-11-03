---
inclusion: fileMatch
fileMatchPattern: ["src/**/*.js", "test/**/*.js"]
---
# Structure
- `src/parser.js` feed parsing, URL normalization, item ids, dedupe (pure functions)
- `src/opml.js` OPML import/export
- `src/summarize.js` extractive + optional LLM summarizer
- `src/store.js` JSON-file persistence (atomic write)
- `src/poller.js` polling + digest building
- `src/server.js` HTTP API + static UI; `src/demo.js` offline demo feeds
- `public/index.html` single-file spooky UI
- `test/*.test.js` one test file per area; new pure logic gets a property test.
