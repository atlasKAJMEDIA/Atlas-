/* Live opportunity scan.
 *
 * After discovery surfaces WHO to approach, this answers WHAT is actually open
 * on that platform right now — the concrete applications, tracks, and rounds a
 * team can act on today.
 *
 * Two paths:
 *   1. With a search provider key (SERPER_API_KEY or TAVILY_API_KEY), it runs a
 *      real web search and hands the results to the model to extract current
 *      openings. Those come back marked confidence: "verified" with source URLs.
 *   2. Without one, the model infers the typical shape of openings for that kind
 *      of program, marked confidence: "inferred", alongside the real links where
 *      the user can confirm.
 *
 * The distinction is always surfaced in the response so inferred results are
 * never mistaken for confirmed live listings.
 */

import { runAI } from "../../../lib/ai-server";

export const runtime = "nodejs";
export const maxDuration = 60;

async function webSearch(query) {
  if (process.env.SERPER_API_KEY) {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: 8 }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) throw new Error(`Serper ${res.status}`);
    const d = await res.json();
    return (d.organic || []).map((r) => ({ title: r.title, url: r.link, snippet: r.snippet }));
  }
  if (process.env.TAVILY_API_KEY) {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: 8 }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) throw new Error(`Tavily ${res.status}`);
    const d = await res.json();
    return (d.results || []).map((r) => ({ title: r.title, url: r.url, snippet: r.content }));
  }
  return null; // no provider configured
}

export async function POST(request) {
  let opportunity, project;
  try {
    ({ opportunity, project } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!opportunity?.name) {
    return Response.json({ error: "Missing opportunity." }, { status: 400 });
  }

  const query =
    `${opportunity.name} ${opportunity.kind === "grant" ? "grant application open deadline" : opportunity.kind === "investor" ? "investment thesis portfolio apply" : "partnership integration apply"} 2026`;

  let results = null;
  let searchError = null;
  try {
    results = await webSearch(query);
  } catch (e) {
    searchError = e.message;
  }

  const live = Array.isArray(results) && results.length > 0;

  const system = live
    ? "You are Helix's live opportunity scanner. You are given REAL web search results about a platform. Extract only what is genuinely supported by those results — current open applications, tracks, rounds, or programs. Never invent a deadline or a URL that is not in the results. Mark each opening confidence:\"verified\" only when a result directly supports it, otherwise \"inferred\". Respond ONLY with valid JSON, no fences: " +
      '{"summary":"1-2 sentences on what is currently open","openings":[{"title":"...","status":"open|rolling|closing_soon|upcoming|unknown","status_label":"short human label","deadline":"...","action":"what to do next","confidence":"verified|inferred","url":"source url or empty"}],"where_to_check":["url"],"next_step":"single most useful action"}'
    : "You are Helix's live opportunity scanner. No live search provider is configured, so you must reason from how programs of this type normally operate. Respond ONLY with valid JSON, no fences, and mark EVERY opening confidence:\"inferred\" — never claim a specific confirmed deadline or listing: " +
      '{"summary":"1-2 sentences, stating these are inferred and must be confirmed","openings":[{"title":"...","status":"open|rolling|closing_soon|upcoming|unknown","status_label":"short human label","deadline":"...","action":"what to do next","confidence":"inferred","url":""}],"where_to_check":["url"],"next_step":"single most useful action"}';

  const user =
    `Platform: ${opportunity.kind} — ${opportunity.name}. Score ${opportunity.score ?? "n/a"}. Context: ${opportunity.why || ""}\n` +
    `Project: ${project?.name || "the project"} (${project?.category || "Web3"}). Building: ${project?.desc || ""}\n` +
    (live
      ? `\nREAL SEARCH RESULTS:\n${results.map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${(r.snippet || "").slice(0, 260)}`).join("\n\n")}`
      : "");

  const ai = await runAI({ system, user });

  // "live" only when we had real results AND the model actually read them.
  // If the AI resolved to demo/fallback content, the openings weren't extracted
  // from the sources, so we must not label them verified — even though the
  // (real) source links are still worth returning for the user to confirm.
  const trulyLive = live && !ai.demo;

  return Response.json({
    text: ai.text,
    demo: ai.demo || false,
    searchMode: trulyLive ? "live" : "inferred",
    searchProvider: process.env.SERPER_API_KEY ? "serper" : process.env.TAVILY_API_KEY ? "tavily" : null,
    searchError,
    sources: live ? results.slice(0, 5) : [],
  });
}
