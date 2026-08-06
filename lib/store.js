/* Helix persistence layer.
 *
 * Spec calls for AI Memory: Helix should remember prior outreach, grant
 * submissions, investor conversations, follow-ups, accepted and rejected
 * partnerships — and improve recommendations from that history.
 *
 * Storage is a swappable driver. Today it's localStorage keyed by wallet
 * address, which survives refreshes and needs no credentials. When a
 * DATABASE_URL exists, point `remoteDriver` at /api/state and the same
 * interface keeps working — no component changes required.
 */

const VERSION = 1;
const NS = "helix:v" + VERSION + ":";

const EMPTY = {
  org: { name: "", category: "", website: "", desc: "" },
  orgRegistered: false,
  orgTx: null,
  intel: null,
  opps: [],
  members: [],
  // AI Memory — an append-only log of everything the operator has done.
  memory: [],
  pipeline: {}, // opportunityId -> { status, channel, sentAt, hash }
  leads: [],    // see LEAD_STATUSES; each carries an optional AI brief + sequence
  scans: {},    // opportunityId -> live scan result
};

export const LEAD_STATUSES = ["new", "contacted", "replied", "meeting", "won", "lost"];

export function makeLead(partial) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: "",
    company: "",
    role: "",
    contact: "",
    notes: "",
    status: "new",
    brief: null,
    sequence: null,
    createdAt: Date.now(),
    ...partial,
  };
}

/* Parse a pasted lead list. Accepts CSV/TSV with or without a header row, and
 * tolerates rows with fewer columns than expected. Column order:
 * name, company, role, contact, notes */
export function parseLeads(text) {
  const rows = (text || "").split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
  if (!rows.length) return [];
  const split = (r) => {
    const parts = r.includes("\t") ? r.split("\t") : r.split(",");
    return parts.map((p) => p.trim().replace(/^["']|["']$/g, ""));
  };
  const first = split(rows[0]).map((c) => c.toLowerCase());
  const hasHeader = first.some((c) => ["name", "company", "role", "contact", "email", "notes"].includes(c));
  const body = hasHeader ? rows.slice(1) : rows;
  return body
    .map((r) => {
      const [name, company, role, contact, ...rest] = split(r);
      if (!name) return null;
      return makeLead({ name, company: company || "", role: role || "", contact: contact || "", notes: rest.join(", ") });
    })
    .filter(Boolean);
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
}

/* ---------------- localStorage driver (default, zero credentials) -------- */

const localDriver = {
  read(key) {
    if (typeof window === "undefined") return null;
    try {
      return safeParse(window.localStorage.getItem(NS + key), null);
    } catch {
      return null; // private mode / storage disabled
    }
  },
  write(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(NS + key, JSON.stringify(value));
    } catch {
      /* quota or disabled — degrade to in-memory for this session */
    }
  },
  clear(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(NS + key);
    } catch {}
  },
};

/* ---------------- public API -------------------------------------------- */

export function loadState(address) {
  if (!address) return { ...EMPTY };
  const stored = localDriver.read(address.toLowerCase());
  return stored ? { ...EMPTY, ...stored } : { ...EMPTY };
}

export function saveState(address, state) {
  if (!address) return;
  const slim = {
    org: state.org,
    orgRegistered: state.orgRegistered,
    orgTx: state.orgTx,
    intel: state.intel,
    opps: state.opps,
    members: state.members,
    memory: (state.memory || []).slice(-200), // cap growth
    pipeline: state.pipeline,
    leads: state.leads,
    scans: state.scans,
  };
  localDriver.write(address.toLowerCase(), slim);
}

export function clearState(address) {
  if (!address) return;
  localDriver.clear(address.toLowerCase());
}

/* ---------------- AI Memory helpers -------------------------------------- */

export const MEMORY_KINDS = {
  ORG_REGISTERED: "org_registered",
  INTEL_RUN: "intel_run",
  DISCOVERY_RUN: "discovery_run",
  OPP_OPENED: "opp_opened",
  OUTREACH_DRAFTED: "outreach_drafted",
  OUTREACH_SENT: "outreach_sent",
  PARTNERSHIP_LOGGED: "partnership_logged",
  STATUS_CHANGED: "status_changed",
  SCAN_RUN: "scan_run",
  LEADS_IMPORTED: "leads_imported",
  LEAD_BRIEFED: "lead_briefed",
  LEAD_SEQUENCED: "lead_sequenced",
  LEAD_STATUS: "lead_status",
};

export function remember(memory, kind, detail) {
  const entry = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), kind, detail, at: Date.now() };
  return [...(memory || []), entry];
}

/* Compact the memory log into a prompt fragment so later AI calls are
 * informed by what already happened — this is what makes recommendations
 * improve over time rather than restarting cold every run. */
export function memoryDigest(memory, limit = 12) {
  if (!memory?.length) return "";
  const recent = memory.slice(-limit);
  const lines = recent.map((m) => {
    const when = new Date(m.at).toISOString().slice(0, 10);
    switch (m.kind) {
      case MEMORY_KINDS.OUTREACH_SENT:
        return `${when}: sent ${m.detail.channel} outreach to ${m.detail.name}`;
      case MEMORY_KINDS.OUTREACH_DRAFTED:
        return `${when}: drafted ${m.detail.channel} message for ${m.detail.name}`;
      case MEMORY_KINDS.PARTNERSHIP_LOGGED:
        return `${when}: logged partnership with ${m.detail.name}`;
      case MEMORY_KINDS.STATUS_CHANGED:
        return `${when}: ${m.detail.name} moved to ${m.detail.status}`;
      case MEMORY_KINDS.OPP_OPENED:
        return `${when}: researched ${m.detail.name} (${m.detail.kind})`;
      case MEMORY_KINDS.DISCOVERY_RUN:
        return `${when}: ran discovery, ${m.detail.count} opportunities surfaced`;
      case MEMORY_KINDS.INTEL_RUN:
        return `${when}: ran ecosystem intelligence`;
      case MEMORY_KINDS.SCAN_RUN:
        return `${when}: scanned ${m.detail.name} for live openings`;
      case MEMORY_KINDS.LEADS_IMPORTED:
        return `${when}: imported ${m.detail.count} leads`;
      case MEMORY_KINDS.LEAD_BRIEFED:
        return `${when}: briefed lead ${m.detail.name}`;
      case MEMORY_KINDS.LEAD_SEQUENCED:
        return `${when}: built follow-up sequence for ${m.detail.name}`;
      case MEMORY_KINDS.LEAD_STATUS:
        return `${when}: lead ${m.detail.name} → ${m.detail.status}`;
      default:
        return `${when}: ${m.kind}`;
    }
  });
  return "Prior activity Helix remembers (do not repeat suggestions already acted on):\n" + lines.join("\n");
}

/* ---------------- pipeline ---------------------------------------------- */

export const PIPELINE_STATUSES = ["draft", "sent", "negotiating", "accepted", "signed", "completed", "rejected"];
