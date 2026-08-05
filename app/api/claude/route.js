/* Atlas AI proxy — Virtuals compute gateway (OpenAI-compatible chat completions),
 * with a built-in DEMO MODE that costs nothing and always works.
 *
 * Resolution order for every request:
 *   1. If ATLAS_DEMO_MODE is on, OR no VIRTUALS_API_KEY is set  → serve demo content.
 *   2. Otherwise call the Virtuals gateway for real.
 *   3. If that call errors or returns a bad shape                → fall back to demo content.
 *
 * Result: the UI can never render a broken/empty state, and you can run a full
 * demonstration for $0 by leaving the key unset or setting ATLAS_DEMO_MODE=1.
 *
 * The key, when present, lives server-side only and never reaches the browser.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_BASE = "https://compute.virtuals.io/v1";
const DEFAULT_MODEL = "claude-opus-4-7-fast";

function truthy(v) {
  return typeof v === "string" && !/^\s*(0|false|off|no|)\s*$/i.test(v);
}

/* ------------------------------------------------------------------ *
 * Demo content generator — produces the same JSON shape the client
 * asks each prompt for, tailored to the project the user typed in.
 * ------------------------------------------------------------------ */

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function parseProject(user) {
  const m = user.match(/(?:Project|From):\s*([^(\n]+?)\s*\(([^)]+)\)/i);
  const name = (m && m[1].trim()) || "Your project";
  const category = (m && m[2].trim()) || "Web3";
  const descM = user.match(/(?:building|What they're building:)\s*([^\n]+)/i);
  const desc = (descM && descM[1].trim().replace(/[.\s]+$/, "")) || "your product";
  return { name, category, desc };
}

function parseOpportunity(user) {
  const m = user.match(/(?:Opportunity|To):\s*([A-Za-z]+)\s*[—-]\s*([^.\n]+)/i);
  const kind = (m && m[1].trim().toLowerCase()) || "partnership";
  const name = (m && m[2].trim()) || "this opportunity";
  const scoreM = user.match(/Score\s*(\d+)/i);
  const score = scoreM ? parseInt(scoreM[1], 10) : 78;
  return { kind, name, score };
}

function demoIntel(user) {
  const { name, category, desc } = parseProject(user);
  const seed = hash(name + category + desc);
  const readiness = 58 + (seed % 30); // 58–87
  const label = readiness >= 80 ? "Strong" : readiness >= 68 ? "Elevated" : "Emerging";
  return {
    position:
      `${name} sits in the ${category} layer of Robinhood Chain, close to both the ` +
      `TradFi onboarding flows the chain is built for and the earliest onchain builders. ` +
      `While the ecosystem is still pre-liquidity, that adjacency is an unusually strategic ` +
      `place to be — the teams launching next will need what ${name} is building.`,
    readiness_score: readiness,
    readiness_label: label,
    strengths: [
      `A ${category.toLowerCase()} wedge that maps directly to Robinhood Chain's TradFi-first thesis`,
      `${name} is infrastructure other builders integrate with, not a standalone consumer bet`,
    ],
    gaps: [
      "No public audit or testnet traction to point at yet",
      "Thin ecosystem footprint — no hackathon, grant, or governance presence so far",
    ],
    drivers: [
      { label: "Ecosystem fit", value: 70 + (seed % 25) },
      { label: "Funding readiness", value: 45 + (seed % 30) },
      { label: "Integration surface", value: 25 + (seed % 35) },
    ],
    ecosystem_moves: [
      "Apply to the foundation infrastructure grant before this quarter's window closes",
      `Ship one reference integration with a Robinhood Chain protocol to turn ${name}'s thesis into proof`,
    ],
    funding_readiness: "Your system needs proof points, not more pitch surface.",
  };
}

function demoOpps(user) {
  const { category } = parseProject(user);
  const cat = category.toLowerCase();
  const pool = [
    { kind: "partnership", name: "Robinhood Chain DEX rails", base: 91, why: `Plugs directly into their swap flow and removes a hop for ${cat} users.` },
    { kind: "grant", name: "Foundation Infrastructure Grant", base: 84, why: `Infra primitives are an explicit funding priority for ${cat} teams this cycle.` },
    { kind: "investor", name: "TradFi-crossover seed funds", base: 73, why: `Your wedge maps to their thesis on regulated capital entering onchain venues.` },
    { kind: "partnership", name: "Custody & wallet providers", base: 66, why: `They need the settlement guarantees a ${cat} product like yours can provide.` },
    { kind: "grant", name: "Ecosystem hackathon track", base: 55, why: `A cheap way to generate the public proof points your profile is missing.` },
    { kind: "investor", name: "Angel operators from payments", base: 48, why: `Domain angels de-risk the TradFi go-to-market story for ${cat} founders.` },
  ];
  const seed = hash(user);
  const opportunities = pool.map((o, i) => ({
    id: String(i + 1),
    kind: o.kind,
    name: o.name,
    score: Math.max(20, Math.min(98, o.base + ((seed >> i) % 7) - 3)),
    why: o.why,
  }));
  opportunities.sort((a, b) => b.score - a.score);
  return { opportunities };
}

function demoReport(user) {
  const { name } = parseProject(user);
  const o = parseOpportunity(user);
  return {
    summary:
      `${o.name} is a high-conviction fit for ${name}. The two sit one integration apart, ` +
      `and moving now — while the ecosystem is small — means being the default rather than ` +
      `one option among many later.`,
    fit_points: [
      `Direct overlap between what ${name} produces and what ${o.name} needs`,
      `${o.score}/100 match — among the strongest ${o.kind} signals in your current set`,
      "Timing favors early movers while Robinhood Chain is pre-liquidity",
    ],
    suggested_action: `Open a warm intro to ${o.name} and lead with a concrete integration sketch, not a pitch.`,
  };
}

function demoOutreach(user) {
  const { name } = parseProject(user);
  const o = parseOpportunity(user);
  const chM = user.match(/Channel:\s*(\w+)/i);
  const channel = (chM && chM[1]) || "Email";
  const long = /email|linkedin/i.test(channel);
  return {
    subject: long ? `${name} × ${o.name} — a quick integration idea` : `re: ${o.name}`,
    body: long
      ? `Hi — I lead ${name}. We're building on Robinhood Chain and I think there's a clean ` +
        `${o.kind} between us: ${o.name} needs exactly what we produce, and we'd rather build it ` +
        `with you than around you. Could I send over a one-page integration sketch this week? ` +
        `No deck, just the concrete version.`
      : `Hey — building ${name} on Robinhood Chain. See a natural fit with ${o.name} and put ` +
        `together a quick integration sketch. Worth 10 min this week?`,
  };
}

function demoText(system, user) {
  const s = system.toLowerCase();
  let obj;
  if (s.includes("ecosystem intelligence engine")) obj = demoIntel(user);
  else if (s.includes("opportunity discovery")) obj = demoOpps(user);
  else if (s.includes("research agent")) obj = demoReport(user);
  else if (s.includes("outreach engine")) obj = demoOutreach(user);
  else obj = { note: "ok" };
  return JSON.stringify(obj);
}

/* ------------------------------------------------------------------ */

export async function POST(request) {
  let system = "", user = "";
  try {
    ({ system = "", user = "" } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const apiKey = process.env.VIRTUALS_API_KEY;
  const forceDemo = truthy(process.env.ATLAS_DEMO_MODE);

  // 1 & 2: no key, or demo forced → free canned content.
  if (forceDemo || !apiKey) {
    return Response.json({ text: demoText(system, user), demo: true });
  }

  // 3: try the real gateway.
  const base = (process.env.VIRTUALS_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
  const model = process.env.VIRTUALS_MODEL || DEFAULT_MODEL;

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (res.ok && text) {
      return Response.json({ text });
    }
    // Bad status or empty content → fall back so the demo never breaks.
    return Response.json({ text: demoText(system, user), demo: true, fallback: "gateway" });
  } catch {
    // Network/egress failure → fall back.
    return Response.json({ text: demoText(system, user), demo: true, fallback: "network" });
  }
}
