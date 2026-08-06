/* Server-side AI resolution, shared by every API route.
 *
 * Order: forced demo → no key → real Virtuals call → fallback to demo on any
 * failure. Callers get text back and never have to care which path ran.
 */

const DEFAULT_BASE = "https://compute.virtuals.io/v1";
const DEFAULT_MODEL = "claude-opus-4-7-fast";

export function truthy(v) {
  return typeof v === "string" && !/^\s*(0|false|off|no|)\s*$/i.test(v);
}

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
  const m = user.match(/(?:Opportunity|To|Platform):\s*([A-Za-z]+)\s*[—-]\s*([^.\n]+)/i);
  const kind = (m && m[1].trim().toLowerCase()) || "partnership";
  const name = (m && m[2].trim()) || "this opportunity";
  const scoreM = user.match(/Score\s*(\d+)/i);
  return { kind, name, score: scoreM ? parseInt(scoreM[1], 10) : 78 };
}

function parseLead(user) {
  const nameM = user.match(/Lead:\s*([^,\n(]+)/i);
  const coM = user.match(/(?:at|Company:)\s*([^,\n.]+)/i);
  const roleM = user.match(/Role:\s*([^,\n.]+)/i);
  const notesM = user.match(/Notes:\s*([^\n]+)/i);
  return {
    name: (nameM && nameM[1].trim()) || "this lead",
    company: (coM && coM[1].trim()) || "their company",
    role: (roleM && roleM[1].trim()) || "decision maker",
    notes: (notesM && notesM[1].trim()) || "",
  };
}

/* ---------------- demo generators ---------------- */

function demoIntel(user) {
  const { name, category, desc } = parseProject(user);
  const seed = hash(name + category + desc);
  const readiness = 58 + (seed % 30);
  return {
    position:
      `${name} sits in the ${category} layer of Robinhood Chain, close to both the TradFi ` +
      `onboarding flows the chain is built for and the earliest onchain builders. While the ` +
      `ecosystem is still pre-liquidity, that adjacency is an unusually strategic place to be.`,
    readiness_score: readiness,
    readiness_label: readiness >= 80 ? "Strong" : readiness >= 68 ? "Elevated" : "Emerging",
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
      `Ship one reference integration to turn ${name}'s thesis into proof`,
    ],
    funding_readiness: "You don't need a better deck. You need one undeniable proof point.",
  };
}

function demoOpps(user) {
  const { category } = parseProject(user);
  const cat = category.toLowerCase();
  const pool = [
    { kind: "partnership", name: "Robinhood Chain DEX rails", base: 91, why: `Plugs into their swap flow and removes a hop for ${cat} users.` },
    { kind: "grant", name: "Foundation Infrastructure Grant", base: 84, why: `Infra primitives are an explicit funding priority for ${cat} teams this cycle.` },
    { kind: "investor", name: "TradFi-crossover seed funds", base: 73, why: `Your wedge maps to their thesis on regulated capital entering onchain venues.` },
    { kind: "partnership", name: "Custody & wallet providers", base: 66, why: `They need the settlement guarantees a ${cat} product can provide.` },
    { kind: "grant", name: "Ecosystem hackathon track", base: 55, why: `A cheap way to generate the public proof points your profile is missing.` },
    { kind: "investor", name: "Angel operators from payments", base: 48, why: `Domain angels de-risk the TradFi go-to-market story.` },
  ];
  const seed = hash(user);
  return {
    opportunities: pool
      .map((o, i) => ({ id: String(i + 1), kind: o.kind, name: o.name, score: Math.max(20, Math.min(98, o.base + ((seed >> i) % 7) - 3)), why: o.why }))
      .sort((a, b) => b.score - a.score),
  };
}

function demoReport(user) {
  const { name } = parseProject(user);
  const o = parseOpportunity(user);
  return {
    summary: `${o.name} is a high-conviction fit for ${name}. The two sit one integration apart, and moving now — while the ecosystem is small — means being the default rather than one option among many later.`,
    fit_points: [
      `Direct overlap between what ${name} produces and what ${o.name} needs`,
      `${o.score}/100 match — among the strongest ${o.kind} signals in your set`,
      "Timing favors early movers while Robinhood Chain is pre-liquidity",
    ],
    suggested_action: `Skip the cold pitch. Get a warm intro to ${o.name} and open with a one-page "here's exactly how this works" — specifics disarm, decks bore.`,
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
      ? `Hi — I lead ${name}. We're building on Robinhood Chain and I think there's a clean ${o.kind} between us: ${o.name} needs exactly what we produce, and we'd rather build it with you than around you. Could I send over a one-page integration sketch this week? No deck, just the concrete version.`
      : `Hey — building ${name} on Robinhood Chain. See a natural fit with ${o.name} and put together a quick integration sketch. Worth 10 min this week?`,
  };
}

/* NEW: live opportunity scan on a specific platform */
function demoScan(user) {
  const o = parseOpportunity(user);
  const { name } = parseProject(user);
  const seed = hash(o.name + name);
  const cycles = ["Rolling — reviewed monthly", "Open now", "Closing soon", "Opens next cycle"];
  const mk = (t, i, action) => ({
    title: t,
    status: ["rolling", "open", "closing_soon", "upcoming"][(seed + i) % 4],
    status_label: cycles[(seed + i) % 4],
    deadline: ["No fixed deadline", "End of quarter", "~2 weeks", "Next quarter"][(seed + i) % 4],
    action,
    confidence: "inferred",
  });
  return {
    summary: `Typical live openings for ${o.name}. Confirm each against the source links below — Helix infers these from how programs of this type usually run, and does not yet crawl the platform directly.`,
    openings: [
      mk(`${o.name} — general application`, 0, "Submit the standard application with your integration sketch attached."),
      mk(`${o.name} — ecosystem/infra track`, 1, `Position ${name} as infrastructure other teams build on, not an end-user app.`),
      mk(`${o.name} — partner intro round`, 2, "Request a warm intro through the chain developer group rather than applying cold."),
    ],
    where_to_check: [
      "https://docs.robinhood.com/chain/connecting",
      "mailto:chain-developers-group@robinhood.com",
      "https://explorer.testnet.chain.robinhood.com",
    ],
    next_step: `Email chain-developers-group@robinhood.com referencing ${o.name} — that is the documented route while no public portal exists.`,
  };
}

/* NEW: lead brief */
function demoLeadBrief(user) {
  const l = parseLead(user);
  const { name } = parseProject(user);
  const seed = hash(l.name + l.company);
  return {
    overview: `${l.name}, ${l.role} at ${l.company}. ${l.notes ? l.notes + " " : ""}Close enough to the decision that a vague "let's connect" is a waste of everyone's afternoon. Be specific, be human, be worth the reply.`,
    fit: `${l.company} has the surface area to use what ${name} builds without a long integration.`,
    priority: 45 + (seed % 50),
    angle: `Open with the result ${l.company} feels in month one. Nobody was ever charmed by a feature list.`,
    risks: [`Anyone in a ${l.role.toLowerCase()} seat gets heavy inbound; a generic opener will be ignored.`],
  };
}

/* NEW: follow-up sequence */
function demoFollowups(user) {
  const l = parseLead(user);
  const { name } = parseProject(user);
  return {
    sequence: [
      { step: 1, when: "Day 0", channel: "Email", subject: `${l.company} × ${name}`, body: `Hi ${l.name} — I'll be direct. We built ${name} for teams in ${l.company}'s position, and I think there's one specific thing we could take off your plate this quarter. Worth a 10-minute look? I'll send the concrete version, not a deck.` },
      { step: 2, when: "Day 3", channel: "Email", subject: "Re: quick one", body: `Following up once. If this isn't a priority right now, tell me and I'll close the loop. If it is, I'll send the one-pager on exactly how it would work for ${l.company}.` },
      { step: 3, when: "Day 8", channel: "LinkedIn", subject: "", body: `Hi ${l.name} — tried email, trying here. One question: is ${l.company} solving this in-house already? If yes I'll stop. If not, I have something specific for you.` },
      { step: 4, when: "Day 16", channel: "Email", subject: "Closing the loop", body: `Last note from me. Leaving the door open — if the timing changes, reply to this and I'll pick it straight back up. Either way, good luck with the quarter.` },
    ],
    cadence_note: "Four touches over ~16 days — each shorter, each braver, each leaving the door open. The moment they reply, stop selling and start talking.",
  };
}

function demoText(system, user) {
  const s = (system || "").toLowerCase();
  let obj;
  if (s.includes("ecosystem intelligence engine")) obj = demoIntel(user);
  else if (s.includes("opportunity discovery")) obj = demoOpps(user);
  else if (s.includes("live opportunity scanner")) obj = demoScan(user);
  else if (s.includes("lead qualification")) obj = demoLeadBrief(user);
  else if (s.includes("follow-up sequence")) obj = demoFollowups(user);
  else if (s.includes("research agent")) obj = demoReport(user);
  else if (s.includes("outreach engine")) obj = demoOutreach(user);
  else obj = { note: "ok" };
  return JSON.stringify(obj);
}

/* ---------------- resolution ---------------- */

export async function runAI({ system = "", user = "" }) {
  const apiKey = process.env.VIRTUALS_API_KEY;
  if (truthy(process.env.HELIX_DEMO_MODE) || !apiKey) {
    return { text: demoText(system, user), demo: true };
  }

  const base = (process.env.VIRTUALS_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
  const model = process.env.VIRTUALS_MODEL || DEFAULT_MODEL;

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 1400,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (res.ok && text) return { text };
    return { text: demoText(system, user), demo: true, fallback: "gateway" };
  } catch {
    return { text: demoText(system, user), demo: true, fallback: "network" };
  }
}
