// Offline demo feeds so the app works with no network and no API key.
const day = (h) => new Date(Date.now() - h * 3600e3).toUTCString();
export const DEMO_FEEDS = {
  'demo://crypt-chronicle': `<?xml version="1.0"?><rss version="2.0"><channel><title>The Crypt Chronicle</title><link>https://example.com/crypt</link>
<item><title>RSS rises from the grave</title><link>https://example.com/crypt/rss-rises?utm_source=x</link><guid>crypt-1</guid><pubDate>${day(2)}</pubDate><description>&lt;p&gt;Developers are rediscovering RSS as algorithmic feeds grow noisier. Open feeds let readers choose what they follow without tracking. Tools that summarize feeds with AI make a daily digest practical again. Many blogs never stopped publishing feeds at all.&lt;/p&gt;</description></item>
<item><title>Why open standards never really die</title><link>https://example.com/crypt/open-standards</link><guid>crypt-2</guid><pubDate>${day(5)}</pubDate><description>Open standards outlive the companies that try to replace them. XML syndication has powered podcasts for two decades. Every podcast app is secretly an RSS reader. The format is boring, and boring is exactly why it survives.</description></item>
</channel></rss>`,
  'demo://haunted-atom': `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Haunted Atom Weekly</title><link href="https://example.com/atom"/><id>urn:haunted</id><updated>${new Date().toISOString()}</updated>
<entry><title>Spec-driven development with an AI IDE</title><link href="https://example.com/atom/specs"/><id>urn:haunted:1</id><updated>${new Date(Date.now() - 3 * 3600e3).toISOString()}</updated><summary>Writing requirements before code sounds old fashioned. With an agentic IDE, the spec becomes the prompt, the plan and the documentation at once. Teams report fewer surprises because acceptance criteria are written in plain language. Hooks keep tests running on every save.</summary></entry>
<entry><title>Pumpkin carving for engineers</title><link href="https://example.com/atom/pumpkins"/><id>urn:haunted:2</id><updated>${new Date(Date.now() - 30 * 3600e3).toISOString()}</updated><summary>A short guide to carving pumpkins with precision tools and a lot of patience.</summary></entry>
</feed>`,
};
export const demoFetch = async (url, opts) => (DEMO_FEEDS[url] ? new Response(DEMO_FEEDS[url], { status: 200 }) : fetch(url, opts));
