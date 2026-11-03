# Requirements: Feed ingestion & dedupe
## User story
As a reader, I want to follow any RSS or Atom feed so that new posts appear exactly once in my digest.
## Acceptance criteria (EARS)
1. WHEN the user submits an http(s) feed URL, THE SYSTEM SHALL store the subscription and poll it immediately.
2. WHEN a feed document is RSS 2.0, RSS 1.0 (RDF) or Atom 1.0, THE SYSTEM SHALL extract title, link, id, publish date and text content for each item.
3. IF the document is malformed or of unknown format, THEN THE SYSTEM SHALL record an error on the feed and SHALL NOT throw.
4. THE SYSTEM SHALL derive a stable item id from guid, else normalized link, else title+date.
5. WHEN normalizing a link, THE SYSTEM SHALL remove fragments, `utm_*`, `fbclid` and `gclid` parameters and trailing slashes, and normalization SHALL be idempotent.
6. WHEN a feed is re-polled, THE SYSTEM SHALL NOT store an item whose id already exists.
7. IF the submitted URL is not http(s), THEN THE SYSTEM SHALL respond with HTTP 400.
