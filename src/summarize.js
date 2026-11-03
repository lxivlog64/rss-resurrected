const STOP = new Set('a an the and or but of to in on for with is are was were be been it this that as at by from we you they i he she not have has had will would can could our your their its into about than then so if do does did more most also just'.split(' '));

/** Deterministic extractive summary: top-scoring sentences by word frequency, original order. */
export function extractiveSummary(text, maxSentences = 2) {
  const sentences = String(text ?? '').replace(/\s+/g, ' ').match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g)?.map((s) => s.trim()).filter((s) => s.length > 20) ?? [];
  if (sentences.length <= maxSentences) return sentences.join(' ') || String(text ?? '').slice(0, 280);
  const freq = {};
  for (const w of String(text).toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []) if (!STOP.has(w) && w.length > 2) freq[w] = (freq[w] ?? 0) + 1;
  const scored = sentences.map((s, idx) => {
    const ws = s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
    return { s, idx, score: ws.reduce((a, w) => a + (freq[w] ?? 0), 0) / Math.sqrt(ws.length || 1) + (idx === 0 ? 0.5 : 0) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, maxSentences).sort((a, b) => a.idx - b.idx).map((x) => x.s).join(' ');
}

/** Summarize an item: LLM if OPENAI_API_KEY (OpenAI-compatible) is set, else extractive. Falls back on error. */
export async function summarize(item, env = process.env) {
  const text = item.content || item.title;
  if (env.OPENAI_API_KEY && text.length > 200) {
    try {
      const base = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
      const r = await fetch(`${base}/chat/completions`, {
        method: 'POST', signal: AbortSignal.timeout(20000),
        headers: { 'content-type': 'application/json', authorization: `Bearer ${env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: env.LLM_MODEL || 'gpt-4o-mini', max_tokens: 120, messages: [
          { role: 'system', content: 'Summarize the article in 2 crisp sentences. No preamble.' },
          { role: 'user', content: `${item.title}\n\n${text.slice(0, 6000)}` }] }),
      });
      if (r.ok) { const j = await r.json(); const s = j.choices?.[0]?.message?.content?.trim(); if (s) return { summary: s, method: 'llm' }; }
    } catch { /* fall through */ }
  }
  return { summary: extractiveSummary(text), method: 'extractive' };
}
