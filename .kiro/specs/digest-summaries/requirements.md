# Requirements: Daily digest with summaries
## User story
As a busy reader, I want one page summarizing what my sites published recently so I can catch up in minutes.
## Acceptance criteria (EARS)
1. WHEN a new item is stored, THE SYSTEM SHALL attach a summary of at most ~2 sentences and record the method used.
2. WHILE `OPENAI_API_KEY` is unset, THE SYSTEM SHALL use a deterministic extractive summarizer.
3. WHERE `OPENAI_API_KEY` is set, THE SYSTEM SHALL request an LLM summary from the configured OpenAI-compatible endpoint.
4. IF the LLM request fails or exceeds 20 s, THEN THE SYSTEM SHALL fall back to the extractive summary.
5. WHEN the user opens the digest, THE SYSTEM SHALL show items from the selected window (24 h / 3 d / 7 d), grouped by feed, newest first.
6. WHEN the user chooses "Load demo", THE SYSTEM SHALL populate the digest from bundled offline feeds without network access.
