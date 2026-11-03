# Requirements: OPML import/export
## User story
As someone leaving another reader, I want to import my OPML so I don't re-add every feed by hand.
## Acceptance criteria (EARS)
1. WHEN the user uploads an OPML file, THE SYSTEM SHALL subscribe to every outline with an http(s) `xmlUrl`, including nested outlines.
2. THE SYSTEM SHALL ignore duplicate URLs within the file and already-followed feeds, and report found vs imported counts.
3. IF the file is not valid OPML, THEN THE SYSTEM SHALL respond with an error and change nothing.
4. WHEN the user requests export, THE SYSTEM SHALL return an OPML 2.0 document such that importing it yields the same feed list.
