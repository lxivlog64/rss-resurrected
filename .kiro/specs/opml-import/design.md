# Design: OPML
- `parseOpml(text)`: fast-xml-parser with attributes; recursive walk of `body.outline`; dedupe by URL; throws `Invalid OPML` if no body.
- `toOpml(feeds)`: XML-escaped `<outline type="rss" text title xmlUrl>`.
- API: `POST /api/opml` (raw body), `GET /api/opml` (download). UI triggers a poll after import.
- Property: parseOpml(toOpml(f)) == f (covered by roundtrip test).
